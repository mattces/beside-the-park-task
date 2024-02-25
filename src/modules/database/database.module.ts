import { Module } from '@nestjs/common';
import { AnswerService } from './services/answer/answer.service';
import { QuestionService } from './services/question/question.service';
import { QuizService } from './services/quiz/quiz.service';
import { TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Quiz } from "./services/quiz/quiz.entity";
import { Answer } from "./services/answer/answer.entity";
import { Question } from "./services/question/question.entity";

@Module({
  providers: [AnswerService, QuestionService, QuizService],
  imports: [TypeOrmModule.forFeature([Quiz, Question, Answer])]
})
export class DatabaseModule {}
