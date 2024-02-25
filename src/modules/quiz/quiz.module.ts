import { Module } from '@nestjs/common';
import { QuizResolver } from './resolvers/quiz.resolver';
import { DatabaseModule } from "../database/database.module";

@Module({
  imports: [DatabaseModule],
  providers: [QuizResolver]
})
export class QuizModule {}
