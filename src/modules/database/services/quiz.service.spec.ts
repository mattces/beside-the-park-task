import { Test, TestingModule } from '@nestjs/testing';
import { QuizService } from './quiz.service';
import { getRepositoryToken } from "@nestjs/typeorm";
import { Quiz } from "../model/quiz.entity";

describe('QuizService', () => {
  let service: QuizService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        {
          provide: getRepositoryToken(Quiz),
          useValue: {}
        }
      ],
    }).compile();

    service = module.get<QuizService>(QuizService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
