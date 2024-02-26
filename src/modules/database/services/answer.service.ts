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
} 
