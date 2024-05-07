require('dotenv').config();

import * as basicAuth from 'express-basic-auth';
import appConfig from './common/config/app.config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common/pipes';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { ApiContextInterceptor } from './common/context.interceptor';
import * as bodyParser from 'body-parser';
import { ApiExceptionFilter } from './common/exception.filter';

global.__basedir = __dirname;

async function bootstrap() {
    const appConf = appConfig();
    const httpPort = appConf.appHttpPort || 3000;
    const app = await NestFactory.create(AppModule, {
        cors: {
            origin: [
                'http://account.skymetric.kz',
                'http://skymetric.kz',
                'http://dev.skymetric.kz',
                'https://account.skymetric.kz',
                'https://skymetric.kz',
                'https://dev.skymetric.kz',
                'https://kaspi.kz',
                'http://localhost:' + httpPort,
                'http://127.0.0.1:' + httpPort,
            ],
        },
    });
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(
        bodyParser.urlencoded({
            limit: '50mb',
            extended: true,
            parameterLimit: 1000000,
        }),
    );
    app.use(
        ['/docs'],
        basicAuth({
            challenge: true,
            users: {
                [appConf.appDocUser.username]: appConf.appDocUser.password,
            },
        }),
    );
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.useGlobalPipes(
        new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalInterceptors(new ApiContextInterceptor());
    app.useGlobalFilters(new ApiExceptionFilter());
    const config = new DocumentBuilder()
        .setTitle('SkyMetric: REST Api')
        .setDescription('')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
    app.use('/robots.txt', function (req, res, next) {
        res.type('text/plain');
        res.send('User-agent: *\nDisallow: /');
    });
    await app.listen(httpPort, () =>
        console.log('Server started on port ' + httpPort),
    );
}

bootstrap();
