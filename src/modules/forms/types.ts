import { LogicAction, LogicCondition, Prisma } from '@prisma/client';
export interface FormInput {
  id?: string;
  userId?: string;
  title: string;
  description: string;
  logoUrl?: string;
  noOfPages: number;
  questions: Question[];
  styling?: Styling;
  status?: string;
  accessType?: string;
  conditionalLogic?: ConditionalLogic;
  createdAt: Date;
  updatedAt: Date;
  ConditionalLogic: string[];
}

export interface FormVersion {
  id: string | null;
  formId: string | null;
  title: string;
  description: string;
  logoUrl: string | null;
  noOfPages: number;
  questions: Question[];
  styling: Styling | Prisma.JsonValue | null;
  status?: string;
  accessType?: string;
  conditionalLogic?: ConditionalLogic[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Form {
  id: string | null;
  userId: string | null;
  formVersion: FormVersion[];
  createdAt: Date;
  updatedAt: Date;
  ConditionalLogic?: ConditionalLogic[];
}

export interface FormOutput {
  questions: Array<{
    ConditionalLogic: Array<{
      id: string;
      formId: string;
      questionId: string;
      operator: string;
      value: string;
      action_questionId: string[];
    }>;
    id: string | null;
    formId: string | null;
    templateId: string | null;
    validations: Prisma.JsonValue;
    pageNumber: number;
    questionType: string;
    questionText: string;
    questionOptions: string[];
    questionAnswer: string | null;
    questionOrder: number;
    action: string | null; // e.g., "show", "hide"
    condition: string | null;
  }>;
  id: string;
  userId: string | null;
  title: string;
  description: string;
  logoUrl: string | null;
  noOfPages: number;
  styling: Styling | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Styling {
  pageColor: string;
  pageImage?: string;
  formColor: string;
  fontColor: string;
  fontFamily: string;
  fontSize: number;
}

export interface Question {
  id?: string | undefined;
  formVersionId?: string | undefined;
  validations: Prisma.JsonValue;
  pageNumber: number;
  questionType: string;
  questionText: string;
  questionAnswer?: string | null;
  questionOrder: number;
  action: LogicAction | null; // e.g., "show", "hide"
  condition: LogicCondition | null;
  conditionalLogic?: ConditionalLogic[] | undefined;
  createdAt: Date;
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
  formId?: string;
  formVersionId?: string;
  questionId?: string;
  operator: string;
  value: string;
  action_questionId: string;
}
