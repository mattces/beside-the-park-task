import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Quiz } from "../model/quiz.entity";
import { Repository, TypeORMError } from "typeorm";

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
}
