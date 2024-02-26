import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { QuestionService } from "../../database/services/question.service";
import { AnswerService } from "../../database/services/answer.service";
import { Answer } from "../../database/model/answer.entity";
import { Question, QuestionType } from "../../database/model/question.entity";
import { Score } from "../resolvers/quiz.output";

@Injectable()
export class ScoreService {
  constructor(private readonly questionService: QuestionService, private readonly answerService: AnswerService) {}
  
  private checkSingleChoiceAnswer(question: Question, submittedAnswers: string[]): number {
    if (submittedAnswers.length > 1) {
      throw new HttpException("Only one answer can be submitted for a single choice question.", HttpStatus.BAD_REQUEST);
    }

    let answer: Answer;
    if ((answer = question.answers.find(answer => answer.description == submittedAnswers[0]))) {
      if (answer.correct) {
        return question.points;
      }
    } else {
      throw new HttpException(`Submitted answer ${submittedAnswers[0]} not in the question's "${question.description}" answer list.`, HttpStatus.BAD_REQUEST);
    }
    
    return 0;
  } 
  private checkMultipleChoiceAnswer(question: Question, submittedAnswers: string[]) {
    const correctQuestionsCount = question.answers.reduce((total, question) => {
      if (question.correct) {
        return total + 1;
      }
      return total;
    }, 0);

    let correct = 0;
    let incorrect = 0;

    for (const answerDescription of submittedAnswers) {
      let answer: Answer;
      if ((answer = question.answers.find(answer => answer.description == answerDescription))) {
        if (answer.correct) {
          correct++;
        } else {
          incorrect++;
        }
      } else {
        throw new HttpException(`Submitted answer ${answerDescription} not in the question's "${question.description}" answer list.`, HttpStatus.BAD_REQUEST);
      }
    }

    return ((Math.max(correct - incorrect, 0)) / correctQuestionsCount) * question.points;
  }
  private checkOrderingAnswer(question: Question, submittedAnswers: string[]) {
    const lastOrder = -1;

    if (submittedAnswers.length < question.answers.length) {
      throw new HttpException(`Too few answers. All of the answers of question "${question.description}" must be submitted, in some order.`, HttpStatus.BAD_REQUEST);
    }
    if (submittedAnswers.length > question.answers.length) {
      throw new HttpException(`Too many answers. All of the answers of question "${question.description}" must be submitted, in some order.`, HttpStatus.BAD_REQUEST);
    }
    for (const answerDescription of submittedAnswers) {
      let answer: Answer;
      if ((answer = question.answers.find(answer => answer.description == answerDescription))) {
        if (answer.order < lastOrder) {
            return 0;
        }
      } else {
        throw new HttpException(`Submitted answer ${answerDescription} not in the question's "${question.description}" answer list.`, HttpStatus.BAD_REQUEST);
      }
    }
    return question.points;
  }
  private checkOpenEndedAnswer(questions: Question, submittedAnswers: string[]) {
    if (submittedAnswers.length > 1) {  
      throw new HttpException("Only one answer can be submitted for a open ended question.", HttpStatus.BAD_REQUEST);
    }
    
    const punctuationPattern =/[^\s\w\d]gi/

    const submittedAnswer = submittedAnswers[0].replace(punctuationPattern, "").toLowerCase().split(/\s/);
    const correctAnswer = questions.answers[0].description.replace(punctuationPattern, "").toLowerCase().split(/\s/);

    if (submittedAnswer.length != correctAnswer.length) {
      return 0;
    }

    for (let i = 0; i < submittedAnswer.length; i++) {
      if (correctAnswer[i] != submittedAnswer[i])  {
        return 0;
      }
    }
    
    return questions.points;
  }
  
  async getScore(quizId: string, answers: string[][]): Promise<Score> {
    const questions = await this.questionService.findAll(quizId);
    
    if (questions.length != answers.length) {
      throw new HttpException("The number of answers must be equal to the number of questions.", HttpStatus.BAD_REQUEST);
    }


    let scored = 0;
    const outOf = questions.reduce((totalPoints, question) => {
      return totalPoints + question.points;
    }, 0);


    for (let i = 0; i < questions.length; i++) {
      questions[i].answers = await this.answerService.findAll(questions[i].id);
      const answerDescriptions = answers[i];

      if (answerDescriptions.length == 0) {
        throw new HttpException(`No answers were submitted for question "${questions[i].description}".`, HttpStatus.BAD_REQUEST);
      }

      switch (questions[i].type) {
        case QuestionType.SingleChoice:
          scored += this.checkSingleChoiceAnswer(questions[i], answerDescriptions); 
          break;

        case QuestionType.MultipleChoice:
          scored += this.checkMultipleChoiceAnswer(questions[i], answerDescriptions);
          break;

        case QuestionType.Ordering:
          scored += this.checkOrderingAnswer(questions[i], answerDescriptions);
          break;
        case QuestionType.OpenEnded:
          scored += this.checkOpenEndedAnswer(questions[i], answerDescriptions);
          break;
      }
    }
    return {scored, outOf}
  }

}
