import { Test, TestingModule } from "@nestjs/testing";
import { ScoreService } from "./score.service";
import { QuestionService } from "../../database/services/question.service";
import { AnswerService } from "../../database/services/answer.service";
import { Question, QuestionType } from "../../database/model/question.entity";
import { HttpException } from "@nestjs/common";
import { Answer } from "../../database/model/answer.entity";
import { AwaitExpression } from "ts-morph";

describe("ScoreService", () => {
  let service: ScoreService;


  const questionServiceMock = { findAll: jest.fn(() => []) };
  const answerServiceMock = { findAll: jest.fn(() => []) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoreService,
        {
          provide: QuestionService,
          useValue: questionServiceMock
        },
        {
          provide: AnswerService,
          useValue: answerServiceMock
        }

      ]
    }).compile();


    service = module.get<ScoreService>(ScoreService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("input validation", () => {
    it("should throw HttpException when the number of questions is different from the number of submitted answers", async () => {
      questionServiceMock.findAll.mockReturnValueOnce([
        {
          description: "Question 1",
          points: 2
        },
        {
          description: "Question 2",
          points: 3
        }
      ] as Partial<Question>[]);

      await expect(service.getScore("12345", [["Answer 1"], ["Answer 2"], ["Answer 3"]])).rejects.toThrow(HttpException);
    });

    it("should throw HttpException when no answers were provided for a question", async () => {
      questionServiceMock.findAll.mockReturnValueOnce([
        {
          description: "Question 1",
          points: 2
        },
        {
          description: "Question 2",
          points: 3
        }
      ] as Partial<Question>[]);

      await expect(service.getScore("12345", [[], ["Answer 2"]])).rejects.toThrow();
    });

    it("should throw HttpException if answer is not in the question's answer list (SingleChoice/MultipleChoice/Ordering)", async () => {
      questionServiceMock.findAll.mockReturnValueOnce([
        {
          description: "Question 1",
          points: 2,
          type: QuestionType.SingleChoice
        }
      ] as Partial<Question>[]);

      answerServiceMock.findAll.mockReturnValueOnce(
        [
          {
            description: "Answer 1",
            correct: true
          },
          {
            description: "Answer 2",
            correct: false
          }
        ] as Partial<Answer>[]
      );

      await expect(service.getScore("12345", [["Answer 3"]])).rejects.toThrow();


      questionServiceMock.findAll.mockReturnValueOnce([
        {
          description: "Question 2",
          points: 2,
          type: QuestionType.MultipleChoice
        }
      ] as Partial<Question>[]);

      answerServiceMock.findAll.mockReturnValueOnce(
        [
          {
            description: "Answer 1",
            correct: true
          },
          {
            description: "Answer 2",
            correct: false
          },
          {
            description: "Answer 3",
            correct: true
          }
        ] as Partial<Answer>[]
      );

      await expect(service.getScore("12345", [["Answer 4"]])).rejects.toThrow(HttpException);

      questionServiceMock.findAll.mockReturnValueOnce([
        {
          description: "Question 2",
          points: 2,
          type: QuestionType.Ordering
        }
      ] as Partial<Question>[]);

      answerServiceMock.findAll.mockReturnValueOnce(
        [
          {
            description: "Answer 1",
            order: 4
          },
          {
            description: "Answer 2",
            order: 2
          },
          {
            description: "Answer 3",
            order: 0
          }
        ] as Partial<Answer>[]
      );

      await expect(service.getScore("12345", [["Answer 1", "Answer 2", "Answer 4"]])).rejects.toThrow(HttpException);
    });

    it("should throw HttpException if more than one answer is submitted (SingleChoice/OpenEnded)", async () => {
      const singleChoiceQuestions = [
        {
          description: "Question 1",
          type: QuestionType.SingleChoice,
          points: 2
        }
      ] as Partial<Question>[];
      const openEndedQuestions = [
        {
          description: "Question 1",
          type: QuestionType.OpenEnded,
          points: 2
        }
      ] as Partial<Question>[];

      questionServiceMock.findAll.mockReturnValueOnce(singleChoiceQuestions);

      await expect(service.getScore("12345", [["Answer 1", "Answer 2"]])).rejects.toThrow();

      questionServiceMock.findAll.mockReturnValueOnce(openEndedQuestions);

      await expect(service.getScore("12345", [["Answer 2", "Answer 3"]])).rejects.toThrow();

    });

    it("should throw HttpException if not all of the question's answers were submitted (Ordering)", async () => {

      questionServiceMock.findAll.mockReturnValueOnce([
        {
          description: "Question 1",
          type: QuestionType.Ordering,
          points: 2
        }
      ] as Partial<Question>[]);

      answerServiceMock.findAll.mockReturnValueOnce(
        [
          {
            description: "Answer 1",
            order: 4
          },
          {
            description: "Answer 2",
            order: 2
          },
          {
            description: "Answer 3",
            order: 0
          }
        ] as Partial<Answer>[]
      );

      await expect(service.getScore("12345", [["Answer 1", "Answer 2"]])).rejects.toThrow(HttpException);
    });

  });
});
