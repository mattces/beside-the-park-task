import { Module } from '@nestjs/common';
import { QuizResolver } from './resolvers/quiz.resolver';
import { DatabaseModule } from "../database/database.module";
import { QuestionResolver } from './resolvers/question.resolver';
import { ScoreService } from "./services/score.service";

@Module({
  imports: [DatabaseModule],
  providers: [QuizResolver, QuestionResolver, ScoreService]
})
export class QuizModule {}
