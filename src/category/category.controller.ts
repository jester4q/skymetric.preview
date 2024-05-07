import {
    Controller,
    Get,
    UseGuards,
    Param,
    Body,
    Post,
    Query,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse,
    ApiProperty,
    ApiQuery,
    ApiSecurity,
    ApiTags,
} from '@nestjs/swagger';
import { AuthTokenGuard } from '../auth/token/authToken.guard';
import {
    GetAllCategoriesResponseDTO,
    GetCategoriesResponseDTO,
    SaveCategoriesRequestDTO,
} from './category.dto';
import { CategoryService } from './category.service';
import { HasRoles } from '../user/roles/roles.decorator';
import { UserRoleEnum } from '../user/types';
import { UserRolesGuard } from '../user/roles/roles.guard';
import { SessionUser } from 'src/auth/token/sessionUser.decorator';
import { TSessionUser } from 'src/auth/token/authToken.service';

@ApiTags('Product categories')
@Controller('/api/categories')
@ApiSecurity('bearer')
@UseGuards(AuthTokenGuard, UserRolesGuard)
export class CategoryController {
    constructor(private categoryService: CategoryService) {}

    @Get()
    @HasRoles(UserRoleEnum.premiumUser)
    @ApiBearerAuth()
    @ApiCreatedResponse({
        description: 'Tree of categories',
        type: GetAllCategoriesResponseDTO,
    })
    @ApiBadRequestResponse({ description: 'Product is not found by request' })
    async all(): Promise<GetAllCategoriesResponseDTO> {
        const categories = await this.categoryService.fetchAllAsTree();
        return { items: categories };
    }

    @Get('/:parentId')
    @HasRoles(UserRoleEnum.parser)
    @ApiBearerAuth()
    @ApiProperty({ name: 'parentId', required: true })
    @ApiQuery({ name: 'depth', required: false })
    @ApiCreatedResponse({
        description: 'Tree of categories',
        type: GetCategoriesResponseDTO,
    })
    @ApiBadRequestResponse({ description: 'Product is not found by request' })
    async list(
        @Param('parentId') parentId: number,
        @Query('depth') depth?: number,
    ): Promise<GetCategoriesResponseDTO> {
        const categories = await this.categoryService.fetchTree(
            parentId,
            depth,
        );
        return categories;
    }

    @Post('/:parentId')
    @HasRoles(UserRoleEnum.parser)
    @ApiBearerAuth()
    @ApiProperty({ name: 'parentId', required: true })
    @ApiBody({ required: true })
    async save(
        @SessionUser() user: TSessionUser,
        @Param('parentId') parentId: number,
        @Body() req: SaveCategoriesRequestDTO,
    ): Promise<GetAllCategoriesResponseDTO> {
        const result = await this.categoryService.save(
            parentId,
            req.empty ? [] : req.categories,
        );
        return { items: result };
    }
}
