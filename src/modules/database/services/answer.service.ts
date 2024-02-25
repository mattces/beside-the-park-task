import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Answer } from "../model/answer.entity";
import { DeepPartial, Repository, TypeORMError } from "typeorm";
import { Quiz } from "../model/quiz.entity";
import { json } from "express";
import { AwaitExpression } from "ts-morph";

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
      throw new TypeORMError(`Failed to fetch answers for question (ID ${questionId}): ${e.message}`);
    }
  }

  create(answerObject: Omit<Answer, "id">): Answer {
    try {
      return this.answerRepository.create(answerObject);
    } catch (e) {
      throw new TypeORMError(`Failed to create new answer (${JSON.stringify(answerObject)}): ${e.message}`);
    }
  }
  async update(id: string, answerObject: DeepPartial<Omit<Answer, "id">>): Promise<Answer> {
      try {
        await this.answerRepository.update(id, answerObject);
        /**A find one method will never be needed in this service.*/
        return await this.answerRepository.findOneBy({id});
      }
      catch (e) {
        throw new TypeORMError(`Failed to update answer (ID ${id}, ${JSON.stringify(answerObject)}): ${e.message}`);
      } 
  }
  
  async delete(id: string): Promise<void> {
    try {
        await this.answerRepository.delete(id);
    }
    catch (e) {
      throw new TypeORMError(`Failed to delete answer (ID ${id}): ${e.message}`);
    } 
  }
  
} 
