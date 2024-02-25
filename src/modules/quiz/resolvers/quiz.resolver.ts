import { Args, ID, Resolver, Query, Mutation, ResolveField, Parent } from "@nestjs/graphql";
import { Quiz } from "../../database/model/quiz.entity";
import { QuizService } from "../../database/services/quiz.service";
import { CreateQuizInput } from "./quiz.input";
import { QuestionService } from "../../database/services/question.service";


@Resolver(of => Quiz)
export class QuizResolver {
  constructor(
    private readonly quizService: QuizService,
    private readonly questionService: QuestionService
  ) {
  }

  @Query(returns => Quiz, {nullable: true})
  async quiz(@Args('id', { type: () => ID }) id: string): Promise<Quiz | null> {
    return this.quizService.findOneById(id); 
  }
  @Query(returns => [Quiz])
  async quizzes() {
    return this.quizService.findAll()
  }
  
  @Mutation(returns => Quiz) 
  async createQuiz(
    @Args('quiz', {type: () => CreateQuizInput}) 
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
