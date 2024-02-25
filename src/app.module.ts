import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";
import { QuizResolver } from './resolvers/quiz/quiz.resolver';
import { QuestionResolver } from './resolvers/question/question.resolver';
import { AnswerResolver } from './resolvers/answer/answer.resolver';


import typeorm from "./model/typeorm/typeorm";


@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ["./**/*.graphql"],
      definitions: {
        path: join(process.cwd(), "src/model/graphql/graphql.ts"),
        outputAs: "class"
      }
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
    )
  ],
  controllers: [AppController],
  providers: [AppService, QuizResolver, QuestionResolver, AnswerResolver]
})
export class AppModule {
}
