import { Field, InputType, Int } from "@nestjs/graphql";
import { QuestionType } from "../../database/model/question.entity";
import { IsNotEmpty, ValidateIf } from "class-validator";

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
  
  @Field()
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
  
  @ValidateIf(o => o.correct == null)
  @IsNotEmpty()
  @Field({nullable: true})
  order: number;

  @ValidateIf(o => o.order == null)
  @IsNotEmpty()
  @Field({nullable: true})
  correct: boolean;
}
