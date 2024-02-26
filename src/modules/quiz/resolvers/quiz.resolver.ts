import { Args, ID, Int, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { Quiz } from "../../database/model/quiz.entity";
import { QuizService } from "../../database/services/quiz.service";
import { CreateQuizInput, SubmitAnswersForQuestionInput} from "./quiz.input";
import { QuestionService } from "../../database/services/question.service";
import { Score } from "./quiz.output";
import { QuestionType } from "../../database/model/question.entity";
import { HttpException, HttpStatus } from "@nestjs/common";
import { AnswerService } from "../../database/services/answer.service";
import { Answer } from "../../database/model/answer.entity";
import { ScoreService } from "../services/score.service";


@Resolver(of => Quiz)
export class QuizResolver {
  constructor(
    private readonly quizService: QuizService,
    private readonly questionService: QuestionService,
    private readonly answerService: AnswerService,
    
    private  readonly  scoreService:ScoreService 
  ) {
  }

  @Query(returns => Quiz, { nullable: true })
  async quiz(@Args("id", { type: () => ID }) id: string): Promise<Quiz | null> {
    return this.quizService.findOneById(id);
  }

  @Query(returns => [Quiz])
  async quizzes() {
    return this.quizService.findAll();
  }


  @Query(returns => Score)
  async score(
    @Args("quizId", {type: () => ID}) 
      quizId: string,
    @Args("answers", { type: () => [SubmitAnswersForQuestionInput] })
      answers: SubmitAnswersForQuestionInput[]
  ): Promise<Score> {
    return await this.scoreService.getScore(quizId, answers.map(({answerDescriptions}) => answerDescriptions));
  }


  @Mutation(returns => Quiz)
  async createQuiz(
    @Args("quiz", { type: () => CreateQuizInput })
      quiz: CreateQuizInput
  ) {
    return this.quizService.create(quiz);
  }


  @ResolveField()
  async questions(@Parent() quiz: Quiz) {
    if (quiz.questions) {
      return quiz.questions;
    }
    return this.questionService.findAll(quiz.id);
  }
}
