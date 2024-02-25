import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Quiz } from "../model/quiz.entity";
import { DeepPartial, Repository, TypeORMError } from "typeorm";

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>
  ) {
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

  create(quizObject: Omit<Quiz, "id" | "questions">): Quiz {
    try {
      return this.quizRepository.create(quizObject);
    } catch (e) {
      throw new TypeORMError(`Failed to create new question (${JSON.stringify(quizObject)}): ${e.message}`);
    }
  }

  async update(id: string, quizObject: DeepPartial<Omit<Quiz, "id" | "questions">>): Promise<Quiz> {
    try {
      await this.quizRepository.update(id, quizObject);
      /**A find one method will never be needed in this service.*/
      return await this.quizRepository.findOneBy({ id });
    } catch (e) {
      throw new TypeORMError(`Failed to update question (ID ${id}, ${JSON.stringify(quizObject)}): ${e.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.quizRepository.delete(id);
    } catch (e) {
      throw new TypeORMError(`Failed to delete question (ID ${id}): ${e.message}`);
    }
  }
}
