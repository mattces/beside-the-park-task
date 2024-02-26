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

  describe("logic", () => {
    it("should correctly calculate points for SingleChoice question", async () => {
      const questions = [
        {
          description: "Question 1",
          type: QuestionType.SingleChoice,
          points: 2
        },
        {
          description: "Question 2",
          type: QuestionType.SingleChoice,
          points: 4
        }
      ] as Partial<Question>[];

      const answers =
        [
          {
            description: "Answer 1",
            correct: false
          },
          {
            description: "Answer 2",
            correct: true
          },
          {
            description: "Answer 3",
            correct: false
          }
        ] as Partial<Answer>[];
      
      questionServiceMock.findAll.mockReturnValue(questions);
      answerServiceMock.findAll.mockReturnValue(answers);
      
      await expect(service.getScore("12345", [["Answer 2"], ["Answer 2"]])).resolves.toHaveProperty('scored', 6);
      await expect(service.getScore("12345", [["Answer 1"], ["Answer 2"]])).resolves.toHaveProperty('scored', 4);
      await expect(service.getScore("12345", [["Answer 2"], ["Answer 1"]])).resolves.toHaveProperty('scored', 2);
      await expect(service.getScore("12345", [["Answer 3"], ["Answer 3"]])).resolves.toHaveProperty('scored', 0);
    });

    it("should correctly calculate points for MultipleChoice question", async () => {
      const questions = [
        {
          description: "Question 1",
          type: QuestionType.MultipleChoice,
          points: 7
        }
      ] as Partial<Question>[];

      const answers =
        [
          {
            description: "Answer 1",
            correct: true
          },
          {
            description: "Answer 2",
            correct: true
          },
          {
            description: "Answer 3",
            correct: false
          },
          {
            description: "Answer 4",
            correct: false
          },
          {
            description: "Answer 5",
            correct: false
          }
        ] as Partial<Answer>[];
      
      const correctAnswersCount = answers.reduce((total, answer) => {
        if (answer.correct) {
          return ++total;
        }
        return total;
      }, 0);

      questionServiceMock.findAll.mockReturnValue(questions);
      answerServiceMock.findAll.mockReturnValue(answers);

      await expect(service.getScore("12345", [["Answer 2", "Answer 3"]])).resolves.toHaveProperty('scored', 0);
      await expect(service.getScore("12345", [["Answer 2", "Answer 1"]])).resolves.toHaveProperty('scored', 2/correctAnswersCount * questions[0].points);
      await expect(service.getScore("12345", [["Answer 2", "Answer 5", "Answer 4", "Answer 1"]])).resolves.toHaveProperty('scored', 0);
      await expect(service.getScore("12345", [["Answer 4"]])).resolves.toHaveProperty('scored', 0);
    });

    it("should correctly calculate points for Ordering question", async () => {
      const questions = [
        {
          description: "Question 1",
          type: QuestionType.Ordering,
          points: 7
        }
      ] as Partial<Question>[];

      const answers =
        [
          {
            description: "Answer 1",
            order: 1
          },
          {
            description: "Answer 2",
            order: 2
          },
          {
            description: "Answer 3",
            order: 3
          },
          {
            description: "Answer 4",
            order: 4
          },
          {
            description: "Answer 5",
            order: 5
          }
        ] as Partial<Answer>[];


      questionServiceMock.findAll.mockReturnValue(questions);
      answerServiceMock.findAll.mockReturnValue(answers);

      await expect(service.getScore("12345", [["Answer 1", "Answer 2", "Answer 3", "Answer 4", "Answer 5"]])).resolves.toHaveProperty('scored', 7);
      await expect(service.getScore("12345", [["Answer 2", "Answer 1", "Answer 3", "Answer 4", "Answer 5"]])).resolves.toHaveProperty('scored', 0);
    });

    it("should correctly calculate points for OpenEnded question", async () => {
      const questions = [
        {
          description: "Who started the napoleonic wars?",
          type: QuestionType.OpenEnded,
          points: 7
        }
      ] as Partial<Question>[];

      const answers =
        [
          {
            description: "Napoleon Bonaparte",
          },
        ] as Partial<Answer>[];


      questionServiceMock.findAll.mockReturnValue(questions);
      answerServiceMock.findAll.mockReturnValue(answers);

      await expect(service.getScore("12345", [["NAPOLEON, BONAPARTE"]])).resolves.toHaveProperty('scored', 7);
      await expect(service.getScore("12345", [["naplen bonapart"]])).resolves.toHaveProperty('scored', 0);
      await expect(service.getScore("12345", [["napoleon                bonaparte"]])).resolves.toHaveProperty('scored', 7);
      await expect(service.getScore("12345", [["napoleon!                bonaparte!"]])).resolves.toHaveProperty('scored', 7);
      await expect(service.getScore("12345", [["Napolen Bonaparte"]])).resolves.toHaveProperty('scored', 0);
    });
  });
});
