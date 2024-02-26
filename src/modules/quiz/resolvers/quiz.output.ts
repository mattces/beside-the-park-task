import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Score {
  @Field(type => Int)
  scored: number;
  @Field(type => Int)
  outOf: number;
}