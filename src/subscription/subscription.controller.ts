import {
    Controller,
    Get,
    UseGuards,
    Param,
    BadRequestException,
    ForbiddenException,
    NotFoundException,
    Delete,
} from '@nestjs/common';
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
import { SubscriptionService } from './subscription.service';
import { SubscriptionDTO } from './subscription.dto';
import { SessionUser } from '../auth/token/sessionUser.decorator';
import { TSessionUser } from '../auth/token/authToken.service';

@ApiTags('Subscriptions')
@Controller('/api/subscription')
export class SubscriptionController {
    constructor(private subscriptionService: SubscriptionService) {}

    @Get('/:userId')
    @UseGuards(AuthTokenGuard, UserRolesGuard)
    @ApiSecurity('bearer')
    @HasRoles(
        UserRoleEnum.admin,
        UserRoleEnum.siteUser,
        UserRoleEnum.premiumUser,
    )
    @ApiBearerAuth()
    @ApiCreatedResponse({
        description: 'Get active subscription',
        type: SubscriptionDTO,
    })
    async getActiveSubscription(
        @SessionUser() session: TSessionUser,
        @Param('userId') userId: number,
    ): Promise<SubscriptionDTO> {
        if (
            !session.roles.includes(UserRoleEnum.admin) &&
            session.userId != userId
        ) {
            throw new ForbiddenException(
                'User can`t get subscription of another user',
            );
        }
        const subscription = await this.subscriptionService.getActive(userId);
        if (!subscription) {
            throw new NotFoundException(
                'Could not find subscription of the user',
            );
        }
        return subscription;
    }

    @Delete('/:userId')
    @UseGuards(AuthTokenGuard, UserRolesGuard)
    @ApiSecurity('bearer')
    @HasRoles(
        UserRoleEnum.admin,
        UserRoleEnum.siteUser,
        UserRoleEnum.premiumUser,
    )
    @ApiBearerAuth()
    @ApiCreatedResponse({
        description: 'Check payment token',
        type: SubscriptionDTO,
    })
    async deleteActiveSubscription(
        @SessionUser() session: TSessionUser,
        @Param('userId') userId: number,
    ): Promise<SubscriptionDTO> {
        if (
            !session.roles.includes(UserRoleEnum.admin) &&
            session.userId != userId
        ) {
            throw new ForbiddenException(
                'User don`t have access to subscription of another user',
            );
        }
        const subscription = await this.subscriptionService.getActive(userId);
        if (!subscription || subscription.status == 'WillBeCancelled') {
            throw new NotFoundException(
                'Could not find active subscription of the user',
            );
        }

        await this.subscriptionService.cancel(subscription);

        return subscription;
    }
}
