import { LogicAction, LogicCondition, Prisma } from '@prisma/client';

export interface Template {
  id: string;
  title: string;
  description: string;
  logoUrl: string | null;
  noOfPages: number;
  createdAt: Date;
  updatedAt: Date;
  questions: TemplateQuestion[];
  styling?: Styling;
}

export interface TemplateQuestion {
  id: string;
  templateId: string;
  questionText: string;
  questionType: string;
  validations: Prisma.JsonValue;
  questionOrder: number;
  questionAnswer: string | null;
  pageNumber: number;
  condition: LogicCondition | null;
  action: LogicAction | null;
  conditionalLogic?: ConditionalLogic[] | undefined;
  options?: QuestionOption[];
  questionOptions?: string[];
}

export interface QuestionOption {
  id?: string;
  questionId?: string;
  optionText: string;
}

export interface ConditionalLogic {
  id?: string;
  templateId?: string;
  formVersionId?: string;
  questionId?: string;
  operator: string;
  value: string;
  action_questionId: string;
}

export interface Styling {
  pageColor: string;
  pageImage?: string;
  formColor: string;
  fontColor: string;
  fontFamily: string;
  fontSize: number;
}

export interface TemplateOutput {
  id: string;
  title: string;
  description: string;
  logoUrl: string | null;
  noOfPages: number;
  styling: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
  questions: {
    id: string;
    formId: string | null;
    templateId: string | null;
    pageNumber: number;
    questionType: string;
    questionText: string;
    questionOptions: string[];
    validations: Prisma.JsonValue;
    questionAnswer: string | null;
    questionOrder: number;
  }[];
}