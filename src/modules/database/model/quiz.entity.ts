import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Question } from "./question.entity";

@ObjectType()
@Entity('quizzes')
export class Quiz {
  @Field(type => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;
  
  @Field()
  @Column({length: 1024})
  name: string;
  
  @Field()
  @Column({length: 2048})
  description: string;
  
  @Field(type => [Question])
  questions: Question[];
}