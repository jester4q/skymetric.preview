import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TSessionUser } from '../auth/token/authToken.service';
import { ProductRequest } from '../common/db/entities';
import { Repository } from 'typeorm';

@Injectable()
export class ProductRequestService {
    constructor(
        @InjectRepository(ProductRequest)
        private requestRepository: Repository<ProductRequest>,
    ) {}

    public async log(user: TSessionUser, query: string, fail: string) {
        let code = '';
        let url = query;
        if (/^\d+$/.test(query)) {
            url = '';
            code = query;
        } else {
            url = query;
            code = this.getCode(query);
        }

        await this.requestRepository
            .create({
                code: code,
                url: url,
                sessionId: (user && user.sessionId) || 0,
                status: fail ? 0 : 1,
                errorDescription: fail,
            })
            .save();
    }

    private getCode(query: string) {
        try {
            const url = new URL(query);

            if (url.host !== 'kaspi.kz' && !url.pathname.includes('shop/')) {
                return '';
            }
            const path = url.pathname || '';
            const parts = path.split('/');
            let code = parts.pop();
            while (!code && parts.length) {
                code = parts.pop();
            }
            if (!code || !/^[a-zA-Z0-9\-]+$/.test(code)) {
                return '';
            }

            const codeMatch = code.match(/^[a-zA-Z0-9\-]+-(\d+)?$/);
            if (!codeMatch || !codeMatch[1]) {
                return '';
            }
            return codeMatch[1];
        } catch (err) {}
        return '';
    }
}
