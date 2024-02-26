import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { Question } from "../../database/model/question.entity";
import { AnswerService } from "../../database/services/answer.service";

@Resolver(of => Question)
export class QuestionResolver {
  constructor(
    private readonly answerService: AnswerService
  ) {
  }
  @ResolveField()
  async answers(@Parent() question: Question){
    if (question.answers) {
      return question.answers;
    }
    return await this.answerService.findAll(question.id)
      .then(answers => 
        answers.map(answer => {
          //Hide answer correctness/order
          delete answer.order;
          delete answer.correct;
            
          return answer;
        }
      ));
  }
}
