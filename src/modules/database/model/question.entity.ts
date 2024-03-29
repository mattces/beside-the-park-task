import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Quiz } from "./quiz.entity";
import { Field, ID, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Answer } from "./answer.entity";

export enum QuestionType {
  SingleChoice,
  MultipleChoice,
  OpenEnded,
  Ordering
}

registerEnumType(QuestionType, {name: 'QuestionType'})

@ObjectType()
@Entity('questions')
export class Question {
  @Field(type => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;
  
  @Column()
  order: number;
  
  @Field()
  @Column({length: 2048})
  description: string;
  
  @Field(type => Int)
  @Column()
  points: number;
  
  @Field()
  @Column()
  type: QuestionType;
  
  @Field(type => [Answer])
  answers: Answer[]

  @ManyToOne(() => Quiz, { eager: true, nullable: false })
  @JoinColumn({ name: "quiz", referencedColumnName: "id" })
  quiz: Quiz;
}