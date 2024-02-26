import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";
import { DatabaseModule } from './modules/database/database.module';


import typeorm from "./config/typeorm";
import { QuizModule } from "./modules/quiz/quiz.module";


@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      csrfPrevention: false,
      playground: true, 
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      // define the environment variables in docker-compose for production
      load: [typeorm]
    }),
    TypeOrmModule.forRootAsync(
      {
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => configService.get("typeorm")
      }
    ),
    DatabaseModule,
    QuizModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
}
