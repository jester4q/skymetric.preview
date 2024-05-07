import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiSecurity,
    ApiTags,
} from '@nestjs/swagger';
import { AuthTokenGuard } from '../auth/token/authToken.guard';
import { ProductService } from './product.service';
import { CategoryService } from '../category/category.service';
import { HasRoles } from '../user/roles/roles.decorator';
import { UserRoleEnum } from '../user/types';
import { UserRolesGuard } from '../user/roles/roles.guard';
import {
    GetCategoryProductsQueryDto,
    GetCategoryProductsResponseDto,
} from './product.list.dto';

@ApiTags('Product')
@Controller('/api/products')
@ApiSecurity('bearer')
@UseGuards(AuthTokenGuard, UserRolesGuard)
export class ProductListController {
    constructor(
        private productService: ProductService,
        private categoryService: CategoryService,
    ) {}

    @Get('/:categoryId')
    @HasRoles(UserRoleEnum.parser)
    @ApiBearerAuth()
    @ApiCreatedResponse({
        description: 'List of product of some category',
        type: GetCategoryProductsResponseDto,
    })
    async list(
        @Param('categoryId') categoryId: number,
        @Query() query: GetCategoryProductsQueryDto,
    ): Promise<GetCategoryProductsResponseDto> {
        const { reverse, depth, excludeCheckedToday } = query;
        const categoryIds = await this.categoryService.fetchCategoryLeavesIds(
            categoryId,
        );
        if (categoryIds.length) {
            const products = await this.productService.fetchAllInCategory(
                categoryIds,
                depth,
                reverse,
                excludeCheckedToday,
            );
            return { items: products };
        }
        return { items: [] };
    }
}
