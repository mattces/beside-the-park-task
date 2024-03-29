import { Field, ID, InputType, Int } from "@nestjs/graphql";
import { Question, QuestionType } from "../../database/model/question.entity";
import { IsNotEmpty, ValidateIf } from "class-validator";
import { Answer } from "../../database/model/answer.entity";

@InputType()
export class CreateQuizInput {
  @Field()
  @IsNotEmpty()
  name: string;
  
  @Field()
  @IsNotEmpty()
  description: string;

  @Field(type => [CreateQuestionInput])
  @IsNotEmpty()
  questions: CreateQuestionInput[];
}

@InputType()
export class CreateQuestionInput {
  @Field()
  @IsNotEmpty()
  description: string;
  
  @Field(type => Int)
  @IsNotEmpty()
  points: number;
  
  @Field(type => QuestionType)
  @IsNotEmpty()
  type: QuestionType;
  
  @Field(type => [CreateAnswerInput])
  @IsNotEmpty()
  answers: CreateAnswerInput[];
}

/**
 * Either order is null or correct is, never both.
 */
@InputType()
export class CreateAnswerInput {
  @Field()
  @IsNotEmpty()
  description: string;
  
  @Field({nullable: true})
  order?: number;

  @Field({nullable: true})
  correct?: boolean;
}

@InputType()
export class SubmitAnswersForQuestionInput {
  @Field(type => [String])
  answerDescriptions: string[]
}

