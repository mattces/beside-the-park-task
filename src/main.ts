import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {config as dotenvConfig} from "dotenv";


if (process.env.NODE_ENV == "development") {
  dotenvConfig({ path: ".env.development.local" });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
