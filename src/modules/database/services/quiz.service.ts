import { Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { Quiz } from "../model/quiz.entity";
import { DataSource, DeepPartial, QueryRunner, Repository, TypeORMError } from "typeorm";
import { CreateQuizInput } from "../../quiz/resolvers/quiz.input";
import { Answer } from "../model/answer.entity";
import { Question } from "../model/question.entity";
import { AnswerService } from "./answer.service";
import { QuizModule } from "../../quiz/quiz.module";

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

      for (const questionInput of quizInput.questions) {

        const question = this.queryRunner.manager.create(Question, { ...questionInput, quiz: quiz });
        await this.queryRunner.manager.save(Question, question);

        const answers: Answer[] = [];
        for (const answerInput of questionInput.answers) {
          const answer = this.queryRunner.manager.create(Answer, { ...answerInput, question: question });
          await this.queryRunner.manager.save(Answer, answer);

          answers.push(answer);
        }
        question.answers = answers;
        questions.push(question);
      }

      await this.queryRunner.commitTransaction();

      quiz.questions = questions;
      return quiz;
    } catch (e) {
      await this.queryRunner.rollbackTransaction();
      throw new TypeORMError(`Failed to create new quiz (${JSON.stringify(quizInput)}): ${e.message}`);
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
