import { Module } from '@nestjs/common';
import { QuizResolver } from './resolvers/quiz.resolver';

@Module({
  imports: [],
  providers: [QuizResolver]
})
export class QuizModule {}
