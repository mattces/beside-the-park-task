import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Question } from "../model/question.entity";
import { DeepPartial, Repository, TypeORMError } from "typeorm";

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>
  ) {
  }

  async findAll(quizId: string): Promise<Question[]> {
    try {
      return await this.questionRepository.find({where: { quiz: { id: quizId } }, order: {order: 'ASC'}}, );
    } catch (e) {
      throw new TypeORMError(`Failed to fetch questions for quiz ${quizId}: ${e.message}`);
    }
  }

}
