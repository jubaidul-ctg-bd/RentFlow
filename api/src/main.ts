import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // required for Stripe webhook signature verification
    logger: ['log', 'warn', 'error', 'debug'],
  });

  // ── HTTP request logger ──────────────────────────────────────
  const logger = new Logger('HTTP');
  app.use((req: any, res: any, next: () => void) => {
    const { method, originalUrl, ip } = req;
    const start = Date.now();
    res.on('finish', () => {
      const ms = Date.now() - start;
      const { statusCode } = res;
      logger.log(`${method} ${originalUrl} ${statusCode} +${ms}ms — ${ip}`);
    });
    next();
  });
  // ────────────────────────────────────────────────────────────

  app.use(helmet());

  app.enableCors({
    origin: [
      process.env.PLATFORM_URL ?? 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`RentFlow API running on port ${port}`);
}

bootstrap();
