import { Args, ID, Resolver, Query } from "@nestjs/graphql";
import { Quiz } from "../../database/model/quiz.entity";

@Resolver(of => Quiz)
export class QuizResolver {
  @Query(returns => Quiz, {nullable: true})
  async quiz(@Args('id', { type: () => ID }) id: string): Promise<Quiz | null> {
    return null 
  }
  @Query(returns => [Quiz])
  async quizzes() {
    return [] as Quiz[]
  }
}
