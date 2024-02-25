import { Module } from '@nestjs/common';
import { AnswerService } from './services/answer/answer.service';
import { QuestionService } from './services/question/question.service';
import { QuizService } from './services/quiz/quiz.service';

@Module({
  providers: [AnswerService, QuestionService, QuizService]
})
export class DatabaseModule {}
