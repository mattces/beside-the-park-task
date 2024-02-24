import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('quizzes')
export class QuizEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  
  @Column({length: 1024})
  name: string;
  @Column({length: 2048})
  description: string;
}