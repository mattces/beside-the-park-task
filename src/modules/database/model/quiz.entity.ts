import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Field, ID, ObjectType } from "@nestjs/graphql";

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
}