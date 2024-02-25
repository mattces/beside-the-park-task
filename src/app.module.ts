import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";
import { DatabaseModule } from './modules/database/database.module';
import { QuizResolver } from './resolvers/quiz/quiz.resolver';
import { QuestionResolver } from './resolvers/question/question.resolver';
import { AnswerResolver } from './resolvers/answer/answer.resolver';


import typeorm from "./config/typeorm";


@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
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
    DatabaseModule
  ],
  controllers: [AppController],
  providers: [AppService, QuizResolver, QuestionResolver, AnswerResolver]
})
export class AppModule {
}
