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
    return await this.quizRepository.find()
  }
  async findOneById(id: string): Promise<Quiz> {
    return await this.quizRepository.findOneBy({id});
  }
  
}
