import { Module } from '@nestjs/common';
import { AnswerService } from './services/answer.service';
import { QuestionService } from './services/question.service';
import { QuizService } from './services/quiz.service';
import { TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Quiz } from "./model/quiz.entity";
import { Answer } from "./model/answer.entity";
import { Question } from "./model/question.entity";

@Module({
  providers: [AnswerService, QuestionService, QuizService],
  imports: [TypeOrmModule.forFeature([Quiz, Question, Answer])],
  exports: [AnswerService, QuizService, QuestionService]
})
export class DatabaseModule {}
