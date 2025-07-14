import { Answer as PrismaAnswer, FormQuestion, FormQuestionOption } from '@prisma/client';

export interface Responses {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  formId: string;
  answers: Answer[];
  createdAt: Date;
}

export interface Answer {
  id: string;
  responseId: string;
  questionId: string;
  questionText: string;
  questionType: string;
  questionOptions: string[];
  questionAnswer?: string;
  questionOrder: number;
  responseAnswer: string;
}

export interface inputResponse {
  formId: string;
  answers: InputAnswer[];
}

export interface InputAnswer {
  questionId: string;
  questionText: string;
  questionType: string;
  questionOptions?: string[];
  questionAnswer?: string;
  questionOrder: number;
  responseAnswer: string;
}

export interface ResponseWithAnswers {
  id: string;
  userId: string;
  formId: string;
  createdAt: Date;
  answers: AnswerWithQuestion[];
  user: {
    name: string;
    email: string;
  };
}

export interface AnswerWithQuestion extends PrismaAnswer {
  question: FormQuestion & {
    options: FormQuestionOption[]; // includes optionText and other fields
  };
}