import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { QuizEntity } from "./quiz.entity";

@Entity('questions')
export class QuestionEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  
  @Column({length: 2048})
  description: string;
  @Column()
  points: number;
  
  /*TODO: Set up a question type enum property here after creating a QuestionType enum with GraphQL*/

  @ManyToOne(() => QuizEntity, { eager: true, nullable: false })
  @JoinColumn({ name: "quiz", referencedColumnName: "id" })
  quiz: QuizEntity;
}