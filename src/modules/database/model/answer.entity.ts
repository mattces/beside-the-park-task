import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Question } from "./question.entity";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";


@ObjectType()
@Entity('answers')
export class Answer {
  @Field(type => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field(type => String)
  @Column({length: 1024})
  description: string;
  @Field(type => Int)
  @Column({nullable: true})
  order: number;
  
  
  @Field(type=> [Question])
  questions: Question[]
  
  @ManyToOne(() => Question, { eager: true, nullable: false })
  @JoinColumn({ name: "question", referencedColumnName: "id" })
  question: Question;
}