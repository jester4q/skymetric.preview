import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiSecurity,
    ApiTags,
} from '@nestjs/swagger';
import { AuthTokenGuard } from '../auth/token/authToken.guard';
import { HasRoles } from '../user/roles/roles.decorator';
import { UserRoleEnum } from '../user/types';
import { UserRolesGuard } from '../user/roles/roles.guard';
import { TariffService } from './tariff.service';
import { GetTariffsResponseDTO, TariffDTO } from './tariff.dto';

@ApiTags('Tariffs')
@Controller('/api/tarifs')
@ApiSecurity('bearer')
@UseGuards(AuthTokenGuard, UserRolesGuard)
export class TariffController {
    constructor(private tariffService: TariffService) {}

    @Get('')
    @HasRoles(
        UserRoleEnum.admin,
        UserRoleEnum.siteUser,
        UserRoleEnum.premiumUser,
    )
    @ApiBearerAuth()
    @ApiCreatedResponse({
        description: 'List of tariffs',
        type: GetTariffsResponseDTO,
    })
    async list(): Promise<GetTariffsResponseDTO> {
        const tariffs = await this.tariffService.fetchAll();
        return { items: tariffs };
    }

    @Get('/:id')
    @HasRoles(
        UserRoleEnum.admin,
        UserRoleEnum.siteUser,
        UserRoleEnum.premiumUser,
    )
    @ApiBearerAuth()
    @ApiCreatedResponse({
        description: 'Get tariff by id',
        type: TariffDTO,
    })
    async get(@Param('id') id: number): Promise<TariffDTO> {
        const tariff = await this.tariffService.fetchOne(id);
        return tariff;
    }

    /*
    @Delete('/:id')
    @HasRoles(UserRoleEnum.admin)
    @ApiBearerAuth()
    async delete(@Param('id') id: number): Promise<{ success: boolean }> {
        const result = await this.tariffService.delete(id);
        return { success: result };
    }
    */

    /*
    @Post('')
    @HasRoles(UserRoleEnum.admin)
    @ApiBearerAuth()
    @ApiCreatedResponse({
        description: 'Create new tariff',
        type: TariffDTO,
    })
    @ApiBadRequestResponse({
        description: 'Could not add new tariff',
    })
    async add(@Body() req: AddTariffRequestDTO): Promise<TariffDTO> {
        const tariff = await this.tariffService.add(req);
        return tariff;
    }
    */

    /*
    @Patch('/:id')
    @HasRoles(UserRoleEnum.admin)
    @ApiBearerAuth()
    @ApiCreatedResponse({
        description: 'Change tariff',
        type: TariffDTO,
    })
    @ApiBadRequestResponse({
        description: 'Could not change tariff',
    })
    async patch(@Param('id') id: number, @Body() req: PatchTariffRequestDTO): Promise<TariffDTO> {
        const tariff = await this.tariffService.update(id, req);
        return tariff;
    }
    */
}
