import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Answer } from "../model/answer.entity";
import { Repository, TypeORMError } from "typeorm";

@Injectable()
export class AnswerService {
  constructor(
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>
  ) {
  }

  async findAll(questionId: string): Promise<Answer[]> {
    try {
      return await this.answerRepository.findBy({ question: { id: questionId } });
    } catch (e) {
      throw new TypeORMError(`Failed to questions for question (ID ${questionId}): ${e.message}`);
    }
  }
} 
