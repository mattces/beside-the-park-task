import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Quiz } from "../model/quiz.entity";
import { Repository } from "typeorm";

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>
  ) {}
  
  async findAll(): Promise<Quiz[]> {
    return await this.quizRepository.find().catch(
      e =>  { throw new Error(`Failed to fetch quizzes: ${e.message}`); }
    );
  }
  async findOneById(id: string): Promise<Quiz | null> {
    return await this.quizRepository.findOneBy({id}).catch(
      e =>  { throw new Error(`Failed to fetch quiz ${id}: ${e.message}`); }
    );
  }
}
