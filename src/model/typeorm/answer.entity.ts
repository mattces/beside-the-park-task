import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { QuestionEntity } from "./question.entity";

@Entity('answers')
export class AnswerEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  
  @Column({length: 1024})
  description: string;
  @Column({nullable: true})
  order: number;
  
  @ManyToOne(() => QuestionEntity, { eager: true, nullable: false })
  @JoinColumn({ name: "question", referencedColumnName: "id" })
  question: QuestionEntity;
}