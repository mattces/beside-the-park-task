import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Answer } from "../model/answer.entity";
import { Repository } from "typeorm";

@Injectable()
export class AnswerService {
  constructor(
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>
  ) {
  }
  async findAll(questionId: string): Promise<Answer[]> {
    return await this.answerRepository.findBy({question: {id: questionId}})
  }
}
