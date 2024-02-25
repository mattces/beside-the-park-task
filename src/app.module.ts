import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";


import typeorm from "./model/typeorm/typeorm";


@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ["./**/*.graphql"],
      definitions: {
        path: join(process.cwd(), "src/graphql.ts"),
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
  providers: [AppService]
})
export class AppModule {
}
