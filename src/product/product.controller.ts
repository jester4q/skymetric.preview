import {
    Controller,
    Param,
    UseGuards,
    Put,
    Body,
    Post,
    UsePipes,
    ValidationPipe,
    Get,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiSecurity,
    ApiTags,
} from '@nestjs/swagger';
import { AuthTokenGuard } from '../auth/token/authToken.guard';
import { ProductService } from './product.service';
import { InternalServerErrorException } from '@nestjs/common/exceptions';
import {
    AddDetailedProductModel,
    AddProductModel,
    ProductModel,
} from './product.model';
import { HasRoles } from '../user/roles/roles.decorator';
import { UserRoleEnum } from '../user/types';
import { UserRolesGuard } from '../user/roles/roles.guard';
import { SessionUser } from '../auth/token/sessionUser.decorator';
import { TSessionUser } from '../auth/token/authToken.service';
import { AddProductRequestDTO } from './add.product.dto';
import { SaveProductRequestDTO } from './save.product.dto';
import { AddDetailedProductRequestDTO } from './add.detailed.product.dto';
import { UserRequestGuard } from '../user/user.request.guard';
import { ProductDto } from './product.dto';

@ApiTags('Product')
@Controller('/api/products')
@ApiSecurity('bearer')
@UseGuards(AuthTokenGuard, UserRolesGuard)
export class ProductController {
    constructor(private productService: ProductService) {}

    @Post('')
    @HasRoles(UserRoleEnum.parser)
    @ApiBearerAuth()
    @ApiCreatedResponse({
        description: 'Save product of some category',
        type: ProductDto,
    })
    async add(
        @SessionUser() user: TSessionUser,
        @Body() product: AddProductRequestDTO,
    ): Promise<ProductDto> {
        try {
            const model = new AddProductModel(product);
            const result = await this.productService.add(user, model);
            return result;
        } catch (e) {
            throw new InternalServerErrorException('Could not add products');
        }
    }

    @Post('/detailed')
    @HasRoles(
        UserRoleEnum.chromeExtension,
        UserRoleEnum.siteUser,
        UserRoleEnum.premiumUser,
    )
    @UseGuards(UserRequestGuard)
    @ApiBearerAuth()
    @ApiCreatedResponse({
        description: 'Add product of some category',
        type: ProductDto,
    })
    @UsePipes(new ValidationPipe({ transform: true }))
    async addDetailed(
        @SessionUser() user: TSessionUser,
        @Body() product: AddDetailedProductRequestDTO,
    ): Promise<ProductDto> {
        try {
            const model = new AddDetailedProductModel(product);
            const result = await this.productService.addAndUpdate(user, model);
            return result;
        } catch (e) {
            throw new InternalServerErrorException(
                'Could not add(update) product. ' + e.message,
            );
        }
    }

    @Put('/:id')
    @HasRoles(UserRoleEnum.parser)
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'Save product of some category',
        type: ProductDto,
    })
    async save(
        @SessionUser() user: TSessionUser,
        @Param('id') id: number,
        @Body() product: SaveProductRequestDTO,
    ): Promise<ProductDto> {
        try {
            const model = new ProductModel(product);
            return this.productService.save(user, id, model);
        } catch (e) {
            throw new InternalServerErrorException(
                'Could not save product history',
            );
        }
    }
}
