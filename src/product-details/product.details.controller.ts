import {
    Controller,
    Get,
    Query,
    UseGuards,
    ParseArrayPipe,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiQuery,
    ApiSecurity,
    ApiTags,
} from '@nestjs/swagger';
import { AuthTokenGuard } from '../auth/token/authToken.guard';
import { ProductDetailsService } from './product.details.service';
import { ProductUrlPipe } from './productUrl.pipe';
import { ProductPeriodPipe } from './productPeriod.pipe';
import { ProductDataTypesPipe } from './productDataTypes.pipe';
import {
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common/exceptions';
import { ProductModePipe } from './productMode.pipe';
import { UserRolesGuard } from '../user/roles/roles.guard';
import {
    ProductDetailsDto,
    ProductDetailsInfoDto,
} from './product.details.dto';
import { dateToStr } from '../utils';
import { UserRequestGuard } from '../user/user.request.guard';
import { HasRoles } from '../user/roles/roles.decorator';
import { UserRoleEnum } from '../user/types';
import { SessionUser } from '../auth/token/sessionUser.decorator';
import { TSessionUser } from '../auth/token/authToken.service';
import { TProduct } from '../product/product.types';
import {
    DataTypesEnum,
    ModeEnum,
    TProductStat,
    TRatingQuantityChange,
} from './product.details.types';
import { TRange, TSorting } from '../common/page/types';

@ApiTags('Product')
@Controller('/api/product-details')
@ApiSecurity('bearer')
@UseGuards(AuthTokenGuard)
@ApiSecurity('bearer')
@UseGuards(AuthTokenGuard, UserRolesGuard)
export class ProductDetailsController {
    constructor(private productService: ProductDetailsService) {}

    @Get('/list')
    @HasRoles(UserRoleEnum.siteUser, UserRoleEnum.premiumUser)
    @UseGuards(UserRequestGuard)
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'List of products of some categories',
        type: ProductDetailsDto,
    })
    @ApiQuery({
        name: 'categories',
        type: [Number],
        description: 'categories ids',
        required: true,
    })
    @ApiQuery({
        name: 'ratingQuantityChange',
        type: Number,
        description: 'param: rating quantity change period (30, 60, 90)',
        required: false,
    })
    @ApiQuery({
        name: 'ratingQuantityChangeFrom',
        type: Number,
        description: 'filter: rating quantity change from',
        required: false,
    })
    @ApiQuery({
        name: 'ratingQuantityChangeTo',
        type: Number,
        description: 'filter: rating quantity change to',
        required: false,
    })
    @ApiQuery({
        name: 'priceFrom',
        type: Number,
        description: 'filter: price from',
        required: false,
    })
    @ApiQuery({
        name: 'priceTo',
        type: Number,
        description: 'filter: price to',
        required: false,
    })
    @ApiQuery({
        name: 'revenueFrom',
        type: Number,
        description: 'filter: revenue from',
        required: false,
    })
    @ApiQuery({
        name: 'revenueTo',
        type: Number,
        description: 'filter: revenue to',
        required: false,
    })
    @ApiQuery({
        name: 'ratingQuantityFrom',
        type: Number,
        description: 'filter: rating quantity from',
        required: false,
    })
    @ApiQuery({
        name: 'ratingQuantityTo',
        type: Number,
        description: 'filter: rating quantity to',
        required: false,
    })
    @ApiQuery({
        name: 'offersQuantityFrom',
        type: Number,
        description: 'filter: offers quantity from',
        required: false,
    })
    @ApiQuery({
        name: 'offersQuantityTo',
        type: Number,
        description: 'filter: offers quantity to',
        required: false,
    })
    @ApiQuery({
        name: 'ratingFrom',
        type: Number,
        description: 'filter: rating from',
        required: false,
    })
    @ApiQuery({
        name: 'ratingTo',
        type: Number,
        description: 'filter: rating to',
        required: false,
    })
    @ApiQuery({
        name: 'page',
        type: Number,
        description: 'page number',
        required: true,
    })
    @ApiQuery({
        name: 'size',
        type: Number,
        description: 'page size',
        required: false,
    })
    @ApiQuery({
        name: 'sorting',
        type: String,
        description:
            'Sorting:  `unitPrice,asc` | `unitPrice,desc` | `ratingQuantity,asc` | `ratingQuantity,desc` | `offersQuantity,asc` | `offersQuantity,desc` | `productRating,asc` | `productRating,desc` | `ratingQuantityChange,asc` | `ratingQuantityChange,desc` | `revenue,asc` | `revenue,desc`',
        required: false,
    })
    async list(
        @SessionUser() user: TSessionUser,
        @Query(
            'categories',
            new ParseArrayPipe({ items: Number, separator: ',' }),
        )
        categories: number[],
        @Query('ratingQuantityChange') ratingQuantityChange: number,
        @Query('priceFrom') priceFrom: number = NaN,
        @Query('priceTo') priceTo: number = NaN,
        @Query('revenueFrom') revenueFrom: number = NaN,
        @Query('revenueTo') revenueTo: number = NaN,
        @Query('ratingQuantityChangeFrom')
        ratingQuantityChangeFrom: number = NaN,
        @Query('ratingQuantityChangeTo') ratingQuantityChangeTo: number = NaN,
        @Query('ratingQuantityFrom') ratingQuantityFrom: number = NaN,
        @Query('ratingQuantityTo') ratingQuantityTo: number = NaN,
        @Query('offersQuantityFrom') offersQuantityFrom: number = NaN,
        @Query('offersQuantityTo') offersQuantityTo: number = NaN,
        @Query('ratingFrom') ratingFrom: number = NaN,
        @Query('ratingTo') ratingTo: number = NaN,
        @Query('page') page: number = 1,
        @Query('size') size: number = 10,
        @Query('sorting') sorting: string = '',
    ) {
        if (page < 1 || !Number.isInteger(page)) {
            throw new BadRequestException('Page number is not valid');
        }
        if (size < 1 || !Number.isInteger(size) || size > 10) {
            throw new BadRequestException('Page size is not valid (max: 10)');
        }
        const ratingQuantityChangeStr =
            this.validateRatingQuantityChange(ratingQuantityChange);

        const priceRange = this.validateNumberFilter(
            priceFrom,
            priceTo,
            'price',
            true,
        );

        const revenueRange = this.validateNumberFilter(
            revenueFrom,
            revenueTo,
            'revenue',
            true,
        );

        const ratingQuantityRange = this.validateNumberFilter(
            ratingQuantityFrom,
            ratingQuantityTo,
            'rating quantity',
            true,
        );

        const ratingQuantityChangeRange = this.validateNumberFilter(
            ratingQuantityChangeFrom,
            ratingQuantityChangeTo,
            'rating quantity change',
            true,
        );

        const offersQuantityRange = this.validateNumberFilter(
            offersQuantityFrom,
            offersQuantityTo,
            'offers quantity',
            true,
        );

        const ratingRange = this.validateNumberFilter(
            ratingFrom,
            ratingTo,
            'rating',
            false,
        );

        const sort = this.validateSorting(sorting);

        const isPremiumRole = user.roles.includes(UserRoleEnum.premiumUser);

        if (sort && sort.field == 'ratingQuantityChange') {
            if (!ratingQuantityChangeStr) {
                throw new BadRequestException(
                    'RatingQuantityChange param is not defined for sorting',
                );
            }
            sort.field = sort.field + ratingQuantityChangeStr;
        }

        if (ratingQuantityChangeRange && !ratingQuantityChangeStr) {
            throw new BadRequestException(
                'RatingQuantityChange param is not defined for filter ratingQuantityChange',
            );
        }

        if (!isPremiumRole) {
            return await this.productService.fetchAllFree(
                categories,
                {
                    ratingQuantityChange: ratingQuantityChangeStr,
                },
                {
                    offersQuantity: offersQuantityRange,
                    ratingQuantity: ratingQuantityRange,
                    ['ratingQuantityChange' + ratingQuantityChangeStr]:
                        ratingQuantityChangeRange,
                    rating: ratingRange,
                    price: priceRange,
                    revenue: revenueRange,
                },
                { number: page, size: size, sorting: sort },
            );
        }
        return await this.productService.fetchAll(
            categories,
            {
                ratingQuantityChange: ratingQuantityChangeStr,
            },
            {
                offersQuantity: offersQuantityRange,
                ratingQuantity: ratingQuantityRange,
                ['ratingQuantityChange' + ratingQuantityChangeStr]:
                    ratingQuantityChangeRange,
                rating: ratingRange,
                price: priceRange,
                revenue: revenueRange,
            },
            { number: page, size: size, sorting: sort },
        );
    }

    @Get('?')
    @ApiBearerAuth()
    @HasRoles(
        UserRoleEnum.siteUser,
        UserRoleEnum.chromeExtension,
        UserRoleEnum.premiumUser,
    )
    @UseGuards(UserRequestGuard)
    @ApiOkResponse({
        description: 'Return information about product by url or code',
        type: ProductDetailsInfoDto,
    })
    @ApiQuery({
        name: 'q',
        type: String,
        description: 'Product url or code',
        required: true,
    })
    @ApiQuery({
        name: 'period',
        type: Number,
        description: 'Period',
        required: true,
    })
    @ApiQuery({
        enum: DataTypesEnum,
        isArray: true,
        name: 'data_type',
        description: 'Set of data types',
        required: true,
        example: [
            DataTypesEnum.prices,
            DataTypesEnum.rating,
            DataTypesEnum.reviews,
            DataTypesEnum.sellers,
            DataTypesEnum.ratingCount,
        ],
    })
    @ApiQuery({
        enum: ModeEnum,
        name: 'mode',
        description: 'Mode of response',
        required: false,
        example: ModeEnum.dates,
    })
    async getProductInfo(
        @SessionUser()
        user: TSessionUser,
        @Query('q', new ProductUrlPipe())
        productCode: string,
        @Query('period', new ProductPeriodPipe())
        period: number,
        @Query('data_type', new ProductDataTypesPipe())
        types: DataTypesEnum[],
        @Query('mode', new ProductModePipe())
        mode?: ModeEnum,
    ): Promise<ProductDetailsInfoDto> {
        const isPremiumRole = user.roles.includes(UserRoleEnum.premiumUser);
        const isSiteRole = user.roles.includes(UserRoleEnum.siteUser);
        if (!(isPremiumRole || isSiteRole) && period > 95) {
            throw new BadRequestException('Max period value is 95');
        }
        if (period > 190) {
            throw new BadRequestException('Max period value is 190');
        }
        const product = await this.productService.fetchOne(productCode);

        if (!isPremiumRole && !product.free) {
            if (types.length > 1 || types[0] !== DataTypesEnum.prices) {
                throw new ForbiddenException(
                    `Access to this data types is forbidden`,
                );
            }
        }

        const stat = await (mode === ModeEnum.values
            ? this.productService.fetchStatByValues(product.id, period, types)
            : this.productService.fetchStatByDates(product.id, period, types));

        return this.toDTO(product, stat, period);
    }

    private toDTO(
        product: TProduct,
        stat: TProductStat,
        period: number,
    ): ProductDetailsInfoDto {
        return {
            code: product.code,
            dateLastCheck:
                (product.lastCheckedAt && dateToStr(product.lastCheckedAt)) ||
                '',
            galleryImages:
                (product.galleryImages &&
                    product.galleryImages.reduce((r: string[], item) => {
                        r.push(...(Object.values(item) as string[]));
                        return r;
                    }, [])) ||
                [],
            period: period,
            rating: product.productRating,
            reviewsQuantity: product.reviewsQuantity,
            ratingQuantity: product.ratingQuantity,
            title: product.title,
            unitPrice: product.unitPrice,
            url: product.url,
            brand: product.brand,
            weight: product.weight,
            revenue: product.revenue,
            kaspiCreatedAt:
                (product.kaspiCreatedAt && dateToStr(product.kaspiCreatedAt)) ||
                '',
            ...stat,
        };
    }

    private validateNumberFilter(
        from: number,
        to: number,
        field: string,
        integer: boolean = false,
    ): TRange<number> {
        from = isNaN(from) ? undefined : from;
        to = isNaN(to) ? undefined : to;
        if (
            from != undefined &&
            (from < 0 || (integer && !Number.isInteger(from)))
        ) {
            throw new BadRequestException(
                'From ' + field + ' value is not valid',
            );
        }

        if (to !== undefined && (to < 0 || !Number.isInteger(to))) {
            throw new BadRequestException(
                'To ' + field + ' value is not valid',
            );
        }
        /*
        if (to !== undefined && from === undefined) {
            throw new BadRequestException(
                'From ' + field + ' value is not valid',
            );
        }
        */

        if (from !== undefined && !(to === undefined || to >= from)) {
            throw new BadRequestException(
                'To ' + field + ' value is not valid',
            );
        }

        return from === undefined && to === undefined
            ? undefined
            : { from, to };
    }

    private validateRatingQuantityChange(
        value: number | string,
    ): TRatingQuantityChange {
        if (!value) {
            return undefined;
        }
        const result = value.toString();
        if (!['30', '60', '90'].includes(value.toString())) {
            throw new BadRequestException(
                'Rating quantity change is not valid',
            );
        }
        return result as TRatingQuantityChange;
    }

    private validateSorting(sorting: string): TSorting {
        if (!sorting) {
            return null;
        }
        const parts = sorting.split(',');
        const order =
            parts[1] && parts[1].toLowerCase() == 'desc' ? 'DESC' : 'ASC';

        if (parts[0] == 'price') {
            parts[0] = 'unitPrice';
        }
        if (parts[0] == 'rating') {
            parts[0] = 'productRating';
        }

        if (
            ![
                'unitPrice',
                'ratingQuantity',
                'offersQuantity',
                'productRating',
                'ratingQuantityChange',
                'revenue',
            ].includes(parts[0])
        ) {
            throw new BadRequestException('Sorting field is not valid');
        }
        return {
            field: parts[0],
            order: order,
        };
    }
}
