import { Injectable } from '@nestjs/common';
import {
    DataSource,
    FindOptionsWhere,
    In,
    QueryRunner,
    Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TCategory, TSimpleCategory } from './category.types';
import { Category } from '../common/db/entities';
import {
    TCategoryName,
    TCategoryPath,
    TCategoryUrls,
} from '../product/product.types';
import { ApiError, NotFoundApiError } from '../common/error';

function isSameUrl(a: string, b: string) {
    //const url1 = a.split('?')[0];
    //const url2 = b.split('?')[0];

    return a.toLocaleLowerCase() == b.toLowerCase();
}
@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,

        private dataSource: DataSource,
    ) {}

    public async fetchAllAsTree(): Promise<TSimpleCategory[]> {
        const parents = await this.categoryRepository.findBy({
            parentCategoryId: 0,
            status: 1,
        });
        const result: TSimpleCategory[] = [];
        const promises: Promise<void>[] = [];
        for (let i = 0; i < parents.length; i++) {
            promises.push(
                this.fetchTreeBranch(parents[i], -1).then((branch) => {
                    result.push(this.toSimpleCategory(branch));
                }),
            );
        }
        await Promise.all(promises);
        return result;
    }

    public async fetchTree(
        parentCategoryId: number,
        depth: number = -1,
    ): Promise<TCategory> {
        const parent = await this.categoryRepository.findOneBy({
            id: parentCategoryId,
            status: 1,
        });
        if (!parent) {
            throw new Error(
                'There is no category with id = ' + parentCategoryId,
            );
        }
        if (depth != 0) {
            await this.fetchTreeBranch(parent, depth - 1);
        }
        return this.toCategory(parent);
    }

    public async fetchOne(categoryId: number): Promise<TCategory> {
        const category = await this.categoryRepository.findOneByOrFail({
            id: categoryId,
            status: 1,
        });
        return this.toCategory(category);
    }

    public async fetchAll(categoryIds: number[]): Promise<TCategory[]> {
        const result = await this.categoryRepository.findBy({
            id: In(categoryIds),
            status: 1,
        });
        return result.map((item) => this.toCategory(item));
    }

    public async fetchCategoryLeavesIds(categoryId: number): Promise<number[]> {
        try {
            const category = await this.fetchTree(categoryId);
            return this.get3LevelCategories(category);
        } catch (e) {
            throw new NotFoundApiError(
                'Could not get category by id ' + categoryId,
            );
        }
    }

    public async fetchCategoriesByIds(
        ids: number[],
        free: boolean = false,
    ): Promise<TCategory[]> {
        if (!ids.length) {
            return [];
        }
        const where: FindOptionsWhere<Category> = {
            id: In(ids),
        };
        if (free) {
            where.free = true;
        }
        const categories = await this.categoryRepository.findBy(where);
        return categories.map((category) => this.toCategory(category));
    }

    public async save(
        parentId: number,
        categories: { name: string; url: string }[],
    ): Promise<TCategory[]> {
        const parent = await this.categoryRepository.findOneBy({
            id: parentId,
        });
        if (!parent) {
            throw new ApiError('There is no category with id = ' + parentId);
        }

        if (!categories || !categories.length) {
            await this.setStatusToTree(parent, false, true);
            return [];
        }

        const result: number[] = [];

        const old = await this.categoryRepository.findBy({
            parentCategoryId: parentId,
        });

        for (let i = 0; i < categories.length; i++) {
            const newItem = categories[i];
            const hasItem = old.find((oldItem) =>
                isSameUrl(newItem.url, oldItem.url),
            );
            if (hasItem) {
                hasItem.name = newItem.name;
                hasItem.status = 1;
                await hasItem.save();
                result.push(hasItem.id);
            }
            if (!hasItem) {
                const category = this.categoryRepository.create({
                    parentCategoryId: parentId,
                    level: parent.level + 1,
                    name: newItem.name,
                    url: newItem.url,
                    status: 1,
                });
                const newCategory = await category.save();
                result.push(newCategory.id);
            }
        }

        for (let i = 0; i < old.length; i++) {
            const oldItem = old[i];
            const hasItem = categories.find((newItem) =>
                isSameUrl(newItem.url, oldItem.url),
            );
            if (!hasItem) {
                await this.setStatusToTree(oldItem, false);
            }
        }

        return this.fetchAll(result);
    }

    public async checkPath(path: number[]): Promise<boolean> {
        const categories = await this.categoryRepository
            .createQueryBuilder()
            .where('`Category`.id in (:...ids)', { ids: path })
            .getMany();
        if (path.length !== categories.length) {
            return false;
        }
        let failed = false;
        for (let i = path.length - 1; !failed && i >= 0; i--) {
            const x = path[i];
            const category = categories.find((cat) => cat.id == x);
            if (
                !category ||
                (i > 0 && category.parentCategoryId != path[i - 1])
            ) {
                failed = true;
            }
        }
        return !failed;
    }

    public async addPath(
        path: TCategoryName,
        urls?: TCategoryUrls,
    ): Promise<TCategoryPath> {
        const treePath = new Array(6).fill(null, 0, 6);
        for (let i = 0; i < 6; i++) {
            const lvName = 'level' + (i + 1);
            treePath[i] =
                path[lvName] && path[lvName].length
                    ? { name: path[lvName], url: urls && urls[lvName] }
                    : null;
        }
        const way = treePath.filter((x) => !!x);
        const result: TCategoryPath = { level1: 0, level2: 0 };
        const queryRunner = this.dataSource.createQueryRunner();
        try {
            await queryRunner.connect();
            await queryRunner.startTransaction();
            let parentId = 0;
            for (let i = 0; i < way.length; i++) {
                const cat = await this.addCategory(
                    i + 1,
                    way[i],
                    parentId,
                    queryRunner,
                );
                result['level' + (i + 1)] = cat.id;
                parentId = cat.id;
            }
            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }

        return result;
    }

    protected async addCategory(
        level: number,
        name: { name: string; url: string },
        parentId: number,
        runner: QueryRunner,
    ): Promise<Category> {
        let cat = await this.categoryRepository
            .createQueryBuilder()
            .where('`Category`.name like :name', { name: name.name })
            .andWhere('level = :n', { n: level })
            .getOne();

        if (cat) {
            if (cat.parentCategoryId == parentId && cat.level === level) {
                if (name.url && !cat.url) {
                    cat.url = name.url;
                    await runner.manager.save(cat);
                }
                return cat;
            }

            throw new Error('Could not create category with name "${name}"');
        }
        cat = this.categoryRepository.create({
            parentCategoryId: parentId,
            name: name.name,
            level: level,
            url: name.url || '',
            status: 1,
        });
        await runner.manager.save(cat);
        return cat;
    }

    protected toCategory(category: Category): TCategory {
        return {
            id: category.id,
            name: category.name,
            level: category.level,
            parentId: category.parentCategoryId,
            url: category.url,
            children:
                (category.children &&
                    category.children.map((item) => this.toCategory(item))) ||
                [],
        };
    }

    protected toSimpleCategory(category: Category): TSimpleCategory {
        return {
            id: category.id,
            name: category.name,
            children:
                (category.children &&
                    category.children.map((item) =>
                        this.toSimpleCategory(item),
                    )) ||
                [],
        };
    }

    protected async fetchTreeBranch(
        category: Category,
        depth: number,
    ): Promise<Category> {
        category.children = await this.categoryRepository.findBy({
            parentCategoryId: category.id,
            status: 1,
        });
        if (category.children && category.children.length && depth) {
            const promises = [];
            for (let i = 0; i < category.children.length; i++) {
                promises.push(
                    this.fetchTreeBranch(category.children[i], depth - 1),
                );
            }
            await Promise.all(promises);
        }

        return category;
    }

    protected async setStatusToTree(
        category: Category,
        status: boolean,
        exclude: boolean = false,
    ) {
        const children = await this.categoryRepository.findBy({
            parentCategoryId: category.id,
            status: status ? 0 : 1,
        });
        if (!exclude) {
            category.status = status ? 1 : 0;
        }
        await category.save();
        if (children && children.length) {
            const promises = [];
            for (let i = 0; i < children.length; i++) {
                promises.push(this.setStatusToTree(children[i], status));
            }
            await Promise.all(promises);
        }
    }

    private get3LevelCategories(category: TCategory): number[] {
        if (!category.children || !category.children.length) {
            return [category.id];
        }
        const result = [];
        if (category.children) {
            for (let i = 0; i < category.children.length; i++) {
                const ids = this.get3LevelCategories(category.children[i]);
                result.push(...ids);
            }
        }
        return result;
    }
}
