import { Module } from '@nestjs/common';
import { QuizResolver } from './resolvers/quiz.resolver';
import { DatabaseModule } from "../database/database.module";
import { QuestionResolver } from './resolvers/question.resolver';

@Module({
  imports: [DatabaseModule],
  providers: [QuizResolver, QuestionResolver]
})
export class QuizModule {}
