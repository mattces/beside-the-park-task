import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Question } from "./question.entity";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";


@ObjectType()
@Entity('answers')
export class Answer {
  @Field(type => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column({length: 1024})
  description: string;
  @Field(type => Int, {nullable: true})
  @Column({nullable: true})
  order: number;
  
  @Field({nullable: true})
  @Column({nullable: true})
  correct: boolean;
  
  @ManyToOne(() => Question, { eager: true, nullable: false })
  @JoinColumn({ name: "question", referencedColumnName: "id" })
  question: Question;
}