import { Test, TestingModule } from "@nestjs/testing";
import { QuizService } from "./quiz.service";
import { getDataSourceToken, getRepositoryToken } from "@nestjs/typeorm";
import { Quiz } from "../model/quiz.entity";
import { HttpException } from "@nestjs/common";
import { QuestionType } from "../model/question.entity";
import { CreateAnswerInput, CreateQuestionInput } from "../../quiz/resolvers/quiz.input";
import { shouldAskForProject } from "@nestjs/cli/lib/utils/project-utils";

describe('QuizService', () => {
  let service: QuizService;

  const find = jest.fn(() => [])
  const findOneBy = jest.fn(() => {})

  const startTransaction = jest.fn();
  const commitTransaction = jest.fn();
  const rollbackTransaction = jest.fn();

  // Define a manager object with create and save methods as mock functions
  const manager = {
    create: jest.fn(() => ({})),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        {
          provide: getRepositoryToken(Quiz),
          useValue: {
            find,
            findOneBy
          }
        },
        {
          provide: getDataSourceToken(),
          useValue: {
            createQueryRunner: () => ({
              startTransaction,
              commitTransaction,
              rollbackTransaction,
              manager
            })
          }
        }
      ],
    }).compile();

    service = module.get<QuizService>(QuizService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  
  describe("input validation", () => {
    const openEndedQuestion: CreateQuestionInput  = {description: "Question?", type: QuestionType.OpenEnded, points: 2, answers: [] };
    const singleChoiceQuestion: CreateQuestionInput = {description: "Single choice?", type: QuestionType.SingleChoice, points: 1, answers: []};
    const multipleChoiceQuestion: CreateQuestionInput = {description: "Single choice?", type: QuestionType.MultipleChoice, points: 1, answers: []};
    const orderingQuestion: CreateQuestionInput = {description: "Single choice?", type: QuestionType.Ordering, points: 1, answers: []};
    
    it('should throw HttpException when attempting to create a quiz without questions', async () => {
      await expect(service.create({ name: "", description: "", questions: [] })).rejects.toThrow(HttpException);
    })
    it('should throw HttpException when attempting to create an OpenEnded question with more or less than 1 answer', async () => {
      const answers: CreateAnswerInput[] = [ 
        {description: "Answer 1"},
        {description: "Answer 2"}
      ];
      
      await expect(service.create({ name: "", description: "", questions: [{...openEndedQuestion, answers}] })).rejects.toThrow(HttpException);
      await expect(service.create({ name: "", description: "", questions: [{...openEndedQuestion, answers: []}] })).rejects.toThrow(HttpException);
    })
    it('should throw HttpException when attempting to create an OpenEnded question with answer containing "order" or "correct" fields', async () => {
      const answer1 = {description: "Answer 1", correct: true};
      const answer2 = {description: "Answer 2", order: 0};
      

      await expect(service.create({ name: "", description: "", questions: [{...openEndedQuestion, answers: [answer1] }] })).rejects.toThrow(HttpException);
      await expect(service.create({ name: "", description: "", questions: [{...openEndedQuestion, answers: [answer2] }] })).rejects.toThrow(HttpException);
    })
    it('should throw HttpException when creating a question with less than two answers (of type other than OpenEnded)', async () => {
      const answers1 = []
      const answers2 = [{description: "answer!", correct: true}]

      await expect(service.create({ name: "", description: "", questions: [{...singleChoiceQuestion, answers: answers1 }] })).rejects.toThrow(HttpException);
      await expect(service.create({ name: "", description: "", questions: [{...multipleChoiceQuestion, answers: answers2 }] })).rejects.toThrow(HttpException);
    });
    it('should throw HttpException when creating a question with no correct answers (SingleChoice/MultipleChoice)', async () => {
      const answers = [{description: "answer!", correct: false}, {description: "answer 2!", correct: false}];

      await expect(service.create({ name: "", description: "", questions: [{...multipleChoiceQuestion, answers: answers }] })).rejects.toThrow(HttpException);
    });
    it('should throw HttpException when creating a question with more than one correct answer (SingleChoice)', async () => {
      const answers = [{description: "answer!", correct: true}, {description: "answer 2!", correct: true}];

      await expect(service.create({ name: "", description: "", questions: [{...singleChoiceQuestion, answers: answers }] })).rejects.toThrow(HttpException);
    });
    it('should throw HttpException when an answer with both \'order\' and \'correct\' is provided', async () => {
      const answers = [{description: "answer!", correct: true, order: 0}, {description: "answer2 !",  order: 2}];
      
      await expect(service.create({ name: "", description: "", questions: [{...orderingQuestion,  answers: answers }] })).rejects.toThrow(HttpException);
    });
    it('should throw HttpException when an answer with no order is provided (Ordering)', async () => {
      const answers = [{description: "answer!",  order: 0}, {description: "answer2 !"}];

      await expect(service.create({ name: "", description: "", questions: [{...orderingQuestion,  answers: answers }] })).rejects.toThrow(HttpException);
    });
    it('should throw HttpException when more than one answer with the same order is provided (Ordering)', async () => {
      const answers = [{description: "answer!",  order: 0}, {description: "answer2 !", order: 0}];

      await expect(service.create({ name: "", description: "", questions: [{...orderingQuestion,  answers: answers }] })).rejects.toThrow(HttpException);
    });


    it('shouldn\'t throw on correct OpenEnded question input', async () => {

      const correctAnswer = {description: "Correct answer"};
      await expect(service.create({ name: "", description: "", questions: [{...openEndedQuestion, answers: [correctAnswer] }] })).resolves.not.toThrow()
    });
    it('shouldn\'t throw on correct SingleChoice question input', async () => {

      const correctAnswer = {description: "Correct answer", correct:  true};
      const wrongAnswer1 = {description: "Wrong answer 1", correct:  false};
      const wrongAnswer2 = {description: "Wrong answer 2", correct:  false};
      
      await expect(service.create({ name: "", description: "", questions: [{...singleChoiceQuestion, answers: [correctAnswer, wrongAnswer1] }] })).resolves.not.toThrow()
      await expect(service.create({ name: "", description: "", questions: [{...singleChoiceQuestion, answers: [correctAnswer, wrongAnswer1, wrongAnswer2] }] })).resolves.not.toThrow()
    });
    it('shouldn\'t throw on correct MultipleChoice question input', async () => {

      const correctAnswer = {description: "Correct answer 1", correct:  true};
      const correctAnswer2 = {description: "Correct answer 2", correct:  true};
      const wrongAnswer1 = {description: "Wrong answer 1", correct:  false};
      const wrongAnswer2 = {description: "Wrong answer 2", correct:  false};
      
      await expect(service.create({ name: "", description: "", questions: [{...multipleChoiceQuestion, answers: [correctAnswer, wrongAnswer1, wrongAnswer2] }] })).resolves.not.toThrow()
      await expect(service.create({ name: "", description: "", questions: [{...multipleChoiceQuestion, answers: [correctAnswer, correctAnswer2, wrongAnswer1, wrongAnswer2] }] })).resolves.not.toThrow()
    });
    it('shouldn\'t throw on correct Ordering question input', async () => {

      const q1 = {description: "Correct answer 1", order: 1  };
      const q2 = {description: "Correct answer 2", order: 2};
      const q3 = {description: "Wrong answer 1", order:  3};
      const q4 = {description: "Wrong answer 2", order:  4};

      await expect(service.create({ name: "", description: "", questions: [{...orderingQuestion, answers: [q1, q2, q3, q4] }] })).resolves.not.toThrow()
      await expect(service.create({ name: "", description: "", questions: [{...orderingQuestion, answers: [q1, q2, q4] }] })).resolves.not.toThrow()
    });
    
    
  });
});
