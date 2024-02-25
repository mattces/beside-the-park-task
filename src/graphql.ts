
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum QuestionType {
    SingleChoice = "SingleChoice",
    MultipleChoice = "MultipleChoice",
    OpenEnded = "OpenEnded",
    Ordering = "Ordering"
}

export class SetAnswer {
    id?: Nullable<string>;
    description?: Nullable<string>;
    order?: Nullable<number>;
}

export class SetQuestion {
    id?: Nullable<string>;
    type?: Nullable<QuestionType>;
    description?: Nullable<string>;
    answers?: Nullable<SetAnswer>;
    points?: Nullable<number>;
}

export class SetQuiz {
    id?: Nullable<string>;
    description?: Nullable<string>;
    question?: Nullable<SetQuestion>;
}

export class Answer {
    id: string;
    description: string;
    order?: Nullable<number>;
}

export class Question {
    id: string;
    type: QuestionType;
    description: string;
    answers: Answer[];
    points: number;
}

export class Quiz {
    id: string;
    description: string;
    questions: Question[];
}

export class QuizMiniature {
    id: string;
    description: string;
}

export abstract class IQuery {
    abstract quiz(id: string): Quiz | Promise<Quiz>;

    abstract quizzes(): QuizMiniature[] | Promise<QuizMiniature[]>;
}

export abstract class IMutation {
    abstract setQuiz(quiz?: Nullable<SetQuiz>): Quiz | Promise<Quiz>;
}

type Nullable<T> = T | null;
