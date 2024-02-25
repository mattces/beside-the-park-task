import { Injectable } from '@nestjs/common';
import { Answer } from "../model/answer.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Question } from "../model/question.entity";
import { Repository } from "typeorm";

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>
  ) {
  }

  async findAll(quizId: string): Promise<Question[]> {
    return await this.questionRepository.findBy({quiz: {id: quizId}}).catch(
      e =>  { throw new Error(`Failed to questions for quiz ${quizId}: ${e.message}`); }
    );
  }
}
