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


@Resolver(of => Quiz)
export class QuizResolver {
  constructor(
    private readonly quizService: QuizService,
    private readonly questionService: QuestionService,
    private readonly answerService: AnswerService
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
    const questions = await this.questionService.findAll(quizId);
    const maxScore = questions.reduce((totalPoints, question) => {
      return totalPoints + question.points;
    }, 0);

    if (questions.length != answers.length) {
      throw new HttpException("The number of answers must be equal to the number of questions.", HttpStatus.BAD_REQUEST);
    }


    let score = 0;
    let currentAnswer: Answer; 
    
    for (let i = 0; i < questions.length; i++) {
      const allAnswers = await this.answerService.findAll(questions[i].id);
      const answerDescriptions = answers[i].answerDescriptions;

      if (answerDescriptions.length == 0) {
        throw new HttpException(`No answers were submitted for question '${questions[i].description}'.`, HttpStatus.BAD_REQUEST);
      }

      switch (questions[i].type) {
        case QuestionType.SingleChoice:
          if (answerDescriptions.length > 1) {
            throw new HttpException("Only one answer can be submitted for a single choice question.", HttpStatus.BAD_REQUEST);
          }

          if ((currentAnswer = allAnswers.find(answer => answer.description == answerDescriptions[0]))) {
            if (currentAnswer.correct) {
              score += questions[i].points;
            }
          } else {
            throw new HttpException(`Submitted answer ${answerDescriptions} not in the question's ${questions[i].description} answer list.`, HttpStatus.BAD_REQUEST);
          }
          break;

        case QuestionType.MultipleChoice:
          const correctQuestionsCount = allAnswers.reduce((total, question) => {
            if (question.correct) {
              return total + 1;
            }
            return total;
          }, 0);

          let correct = 0;
          let incorrect = 0;

          for (const answerDescription of answerDescriptions) {
            let answer: Answer;
            if ((answer = allAnswers.find(answer => answer.description == answerDescription))) {
              if (answer.correct) {
                correct++;
              } else {
                incorrect++;
              }
            } else {
              throw new HttpException(`Submitted answer ${answerDescription} not in the question's ${questions[i].description} answer list.`, HttpStatus.BAD_REQUEST);
            }
          }

          score += ((Math.max(correct - incorrect, 0)) / correctQuestionsCount) * questions[i].points;
          break;

        case QuestionType.Ordering:

          const lastOrder = -1;
          let wrong = false;

          for (const answerDescription of answerDescriptions) {
            if ((currentAnswer = allAnswers.find(answer => answer.description == answerDescription))) {
              if (currentAnswer.order < lastOrder) {
                wrong = true;
                break;
              }
            } else {
              throw new HttpException(`Submitted answer ${answerDescription} not in the question's ${questions[i].description} answer list.`, HttpStatus.BAD_REQUEST);
            }
          }
          
          if (wrong) {
            break;
          }
          score += questions[i].points;
          break;
        case QuestionType.OpenEnded:
          if (answerDescriptions.length > 1) {
            throw new HttpException("Only one answer can be submitted for a open ended question.", HttpStatus.BAD_REQUEST);
          }

          const punctuationPattern =/[^\s\w\d]gi/
          
          const submittedAnswer = answerDescriptions[0].replace(punctuationPattern, "").toLowerCase().split(/\s/);
          const correctAnswer = questions[i].answers[0].description.replace(punctuationPattern, "").toLowerCase().split(/\s/);
          
          if (submittedAnswer.length != correctAnswer.length) {
            break;
          }
          
          let different = false;
          for (let i = 0; i < submittedAnswer.length; i++) {
            if (correctAnswer[i] != submittedAnswer[i])  {
              different = true;
              break;
            }
          } 
          
          if (different) {
            break;
          }
          score += questions[i].points;
          
          break;
      }
    }
    return { scored: score, outOf: maxScore };
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
