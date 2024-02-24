import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import typeorm from "./model/typeorm/typeorm";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // define the environment variables in docker-compose for production
      load: [typeorm]
    }),
    TypeOrmModule.forRootAsync(
      {
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => configService.get("typeorm"),
      },
      ), 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
