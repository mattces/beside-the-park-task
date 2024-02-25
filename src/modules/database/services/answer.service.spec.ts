import { Test, TestingModule } from '@nestjs/testing';
import { AnswerService } from './answer.service';
import { getRepositoryToken } from "@nestjs/typeorm";
import { Answer } from "../model/answer.entity";

describe('AnswerService', () => {
  let service: AnswerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnswerService,
        {
          provide: getRepositoryToken(Answer),
          useValue: {}
        }
      ],
    }).compile();

    service = module.get<AnswerService>(AnswerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
