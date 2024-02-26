import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { Quiz } from "../model/quiz.entity";
import { DataSource, DeepPartial, QueryRunner, Repository, TypeORMError } from "typeorm";
import { CreateQuizInput } from "../../quiz/resolvers/quiz.input";
import { Answer } from "../model/answer.entity";
import { Question, QuestionType } from "../model/question.entity";

@Injectable()
export class QuizService {

  private queryRunner: QueryRunner;

  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @InjectDataSource()
    private readonly dataSource: DataSource
  ) {
    this.queryRunner = dataSource.createQueryRunner();
  }

  async findAll(): Promise<Quiz[]> {
    try {
      return await this.quizRepository.find();
    } catch (e) {
      throw new TypeORMError(`Failed to fetch quizzes: ${e.message}`);
    }
  }

  async findOneById(id: string): Promise<Quiz | null> {
    try {
      return await this.quizRepository.findOneBy({ id });
    } catch (e) {
      throw new TypeORMError(`Failed to fetch quiz (ID ${id}): ${e.message}`);
    }
  }

  async create(quizInput: CreateQuizInput): Promise<Quiz> {
    try {
      await this.queryRunner.startTransaction();

      const quiz = this.queryRunner.manager.create(Quiz, quizInput);
      await this.queryRunner.manager.save(Quiz, quiz);

      const questions: Question[] = [];
      let questionOrder = 0;
      
      if (quizInput.questions.length == 0) {
        throw new HttpException(`Quiz must have at least one question. (${JSON.stringify(quizInput)})`, HttpStatus.BAD_REQUEST);
      }

      
      for (const questionInput of quizInput.questions) {
        if (questionInput.type == QuestionType.OpenEnded) {
          if (questionInput.answers.length != 1) {
            throw new HttpException(`"OpenEnded" type question must have exactly one answer. (${JSON.stringify(questionInput)}).`, HttpStatus.BAD_REQUEST);
          }
        } else if (questionInput.answers.length < 2) {
          throw new HttpException(`Question must have at least two answers. (${JSON.stringify(questionInput)}).`, HttpStatus.BAD_REQUEST);
        }
        
        const correctAnswersCount = questionInput.answers.filter(ans => ans.correct).length;
        
        if (correctAnswersCount == 0 && questionInput.type ==  QuestionType.MultipleChoice) {
          throw new HttpException(`"MultipleChoice" type question must have at least one correct answer. (${JSON.stringify(questionInput)}).`, HttpStatus.BAD_REQUEST);
        }
        if (correctAnswersCount != 1 && questionInput.type ==  QuestionType.SingleChoice) {
          throw new HttpException(`"SingleChoice" type question must have at exactly one correct answer. (${JSON.stringify(questionInput)}).`, HttpStatus.BAD_REQUEST);
        }
        
        const question = this.queryRunner.manager.create(Question, { ...questionInput, quiz: quiz,  order: questionOrder  });
        await this.queryRunner.manager.save(Question, question);
        

        const answers: Answer[] = [];
        const orders= new Set<number>();
        for (const answerInput of questionInput.answers) {
          if (questionInput.type == QuestionType.OpenEnded) {
            if (answerInput.correct != null || answerInput.order != null) {
              throw new HttpException(`"OpenEnded" type question answers cannot have 'correct', 'order' properties. (${JSON.stringify(answerInput)}).`, HttpStatus.BAD_REQUEST);
            }
          }
          else if (answerInput.correct != null && answerInput.order != null) {
            throw new HttpException(`Answer cannot have both 'order' and 'correct' properties. (${JSON.stringify(answerInput)}).`, HttpStatus.BAD_REQUEST);
          } 
          if (questionInput.type == QuestionType.Ordering) {
            if (answerInput.order == null)
            {
              throw new HttpException(`"Ordering" type question answer must have 'order' property. (${JSON.stringify(answerInput)}).`, HttpStatus.BAD_REQUEST);
            } else {
              if (orders.has(answerInput.order)) {
                throw new HttpException(`"Ordering" type question answer must have unique 'order'. (${JSON.stringify(answerInput)}).`, HttpStatus.BAD_REQUEST);
              }
              orders.add(answerInput.order);
            }
            
          }
          
          const answer = this.queryRunner.manager.create(Answer, { ...answerInput, question: question});
          await this.queryRunner.manager.save(Answer, answer);

          answers.push(answer);
        }
        question.answers = answers;
        questions.push(question);
        
        questionOrder++;
      }

      await this.queryRunner.commitTransaction();

      quiz.questions = questions;
      return quiz;
    } catch (e) {
      await this.queryRunner.rollbackTransaction();
      if (e instanceof HttpException) {
        throw e;
      }
      else {
        throw new TypeORMError(`Failed to create new quiz (${JSON.stringify(quizInput)}): ${e.message}`);
      }
    }
  }

  async update(id: string, quizObject: DeepPartial<Omit<Quiz, "id" | "questions">>): Promise<Quiz> {
    try {
      await this.quizRepository.update(id, quizObject);
      return await this.findOneById(id);
    } catch (e) {
      throw new TypeORMError(`Failed to update quiz (ID ${id}, ${JSON.stringify(quizObject)}): ${e.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.quizRepository.delete(id);
    } catch (e) {
      throw new TypeORMError(`Failed to delete quiz (ID ${id}): ${e.message}`);
    }
  }
}
