import {
    Controller,
    Get,
    UseGuards,
    Param,
    Query,
    BadRequestException,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiParam,
    ApiProperty,
    ApiPropertyOptional,
    ApiQuery,
    ApiSecurity,
    ApiTags,
} from '@nestjs/swagger';
import { AuthTokenGuard } from '../auth/token/authToken.guard';
import { HasRoles } from '../user/roles/roles.decorator';
import { UserRoleEnum } from '../user/types';
import { UserRolesGuard } from '../user/roles/roles.guard';
import { CategoryDetailsService } from './category.details.service';
import { GetCategoryDetailsDTOResponseDTO } from './category.details.dto';
import { TRatingQuantityChange } from 'src/product-details/product.details.types';

@ApiTags('Product categories details')
@Controller('/api/categories-details')
@ApiSecurity('bearer')
@UseGuards(AuthTokenGuard, UserRolesGuard)
export class CategoryDetailsController {
    constructor(private categoryDetailsService: CategoryDetailsService) {}

    @Get('/:parentId?')
    @HasRoles(
        UserRoleEnum.admin,
        UserRoleEnum.premiumUser,
        UserRoleEnum.siteUser,
    )
    @ApiBearerAuth()
    @ApiParam({ name: 'parentId', required: false, allowEmptyValue: true })
    @ApiQuery({
        name: 'ratingQuantityChange',
        type: Number,
        description: 'param: rating quantity change period (30, 60, 90)',
        required: true,
    })
    @ApiCreatedResponse({
        description: 'Details of children categories',
        type: GetCategoryDetailsDTOResponseDTO,
    })
    async list(
        @Param('parentId') parentId: number = 0,
        @Query('ratingQuantityChange') ratingQuantityChange: number,
    ): Promise<GetCategoryDetailsDTOResponseDTO> {
        console.log('parenId', parentId);
        const ratingQuantityChangeStr =
            this.validateRatingQuantityChange(ratingQuantityChange);

        if (isNaN(parentId)) {
            parentId = 0;
        }

        const categories = await this.categoryDetailsService.fetchAll(
            parentId || 0,
            ratingQuantityChangeStr,
        );
        return { children: categories };
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
}
