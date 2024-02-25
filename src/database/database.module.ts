import { Module } from '@nestjs/common';
import { AnswerService } from './answer/answer.service';
import { QuestionService } from './question/question.service';
import { QuizService } from './quiz/quiz.service';

@Module({
  providers: [AnswerService, QuestionService, QuizService]
})
export class DatabaseModule {}
