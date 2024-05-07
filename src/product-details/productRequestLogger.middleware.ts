import { Injectable, NestMiddleware } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';
import { ProductRequestService } from './productRequest.service';
import { TSessionUser } from '../auth/token/authToken.service';
import { getResponseLog } from '../common/log/logger.middleware';

@Injectable()
export class productRequestLoggerMiddleware implements NestMiddleware {
    constructor(private service: ProductRequestService) {}

    use(request: Request, response: Response, next: NextFunction): void {
        const { ip, method, originalUrl: url, body } = request;
        const userAgent = request.get('user-agent') || '';

        getResponseLog(response, (log) => {
            const user: TSessionUser = request.user as TSessionUser;
            const reqBody = {
                userId: (user && user['userId']) || 0,
                ...(body || {}),
            };
            const resLog = log.response;
            let fail = '';

            if (resLog.statusCode >= 400 && resLog.statusCode < 500) {
                fail = resLog.body.message;
            }
            if (resLog.statusCode >= 500) {
                fail = resLog.statusMessage;
            }
            this.service.log(user, request.query['q'] as string, fail);
        });

        if (next) {
            next();
        }
    }
}
