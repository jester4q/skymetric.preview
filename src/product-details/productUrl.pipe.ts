import {
    PipeTransform,
    ArgumentMetadata,
    BadRequestException,
} from '@nestjs/common';

const { URL } = require('url');

export class ProductUrlPipe implements PipeTransform {
    transform(url: string, metadata: ArgumentMetadata) {
        url = url.trim();
        if (!url.length) {
            throw new BadRequestException(
                'Product url is not defined. Please enter kaspi shop url or product code.',
            );
        }

        if (/^\d+$/.test(url)) {
            return url;
        }

        const path = this.checkUrl(url);
        if (!path) {
            throw new BadRequestException(
                'Product url is not valid. Please enter kaspi shop url or product code.',
            );
        }

        const parts = path.split('/');
        let code = parts.pop();
        while (!code && parts.length) {
            code = parts.pop();
        }
        if (!code || !/^[a-zA-Z0-9\-]+$/.test(code)) {
            throw new BadRequestException('Product url is not valid');
        }

        const codeMatch = code.match(/^[a-zA-Z0-9\-]+-(\d+)?$/);
        if (!codeMatch || !codeMatch[1]) {
            throw new BadRequestException('Product url is not valid');
        }

        return codeMatch[1];
    }

    private checkUrl(str: any): string {
        let url;
        try {
            url = new URL(str);
        } catch (err) {
            return '';
        }
        if (url.host != 'kaspi.kz') {
            throw new BadRequestException(
                'Product url is not valid. It is possisble to check products of kaspi.kz only',
            );
        }
        if (url.pathname.indexOf('shop/') === -1) {
            throw new BadRequestException(
                'Product url is not valid. It is possisble to check products of kaspi.kz shop only',
            );
        }
        return url.pathname || '';
    }
}
