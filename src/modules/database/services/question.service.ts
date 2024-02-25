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

  create(questionObject: Omit<Question, "id" | "answers">): Question {
    try {
      return this.questionRepository.create(questionObject);
    } catch (e) {
      throw new TypeORMError(`Failed to create new question (${JSON.stringify(questionObject)}): ${e.message}`);
    }
  }

  async update(id: string, questionObject: DeepPartial<Omit<Question, "id" | "answers">>): Promise<Question> {
    try {
      await this.questionRepository.update(id, questionObject);
      /**A find one method will never be needed in this service.*/
      return await this.questionRepository.findOneBy({ id });
    } catch (e) {
      throw new TypeORMError(`Failed to update question (ID ${id}, ${JSON.stringify(questionObject)}): ${e.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.questionRepository.delete(id);
    } catch (e) {
      throw new TypeORMError(`Failed to delete question (ID ${id}): ${e.message}`);
    }
  }
}
