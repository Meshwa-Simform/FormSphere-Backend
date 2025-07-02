import { Prisma } from '@prisma/client';
export interface Form {
  id?: string;
  userId?: string;
  title: string;
  description: string;
  logoUrl?: string;
  isSinglePage: boolean;
  noOfPages: number;
  questions: Question[];
  styling?: Styling;
  privateSharingToken?: string;
  conditionalLogic?: ConditionalLogic;
  createdAt: Date;
  updatedAt: Date;
  ConditionalLogic: string[];
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
    id: string;
    formId: string | null;
    templateId: string | null;
    validations: Prisma.JsonValue;
    pageNumber: number;
    questionType: string;
    questionText: string;
    questionOptions: string[];
    questionAnswer: string | null;
    questionOrder: number;
    isRequired: boolean;
    isHidden: boolean;
    action: string | null; // e.g., "show", "hide"
    condition: string | null;
  }>;
  id: string;
  userId: string | null;
  title: string;
  description: string;
  logoUrl: string | null;
  isSinglePage: boolean;
  noOfPages: number;
  styling: {
    pageColor: string;
    pageImage: string | null;
    formColor: string;
    fontColor: string;
    fontFamily: string;
    fontSize: number;
  } | null;
  privateSharingToken: string | null;
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
  id?: string;
  formId?: string;
  templateId?: string;
  validations: Prisma.JsonValue;
  pageNumber: number;
  questionType: string;
  questionText: string;
  questionOptions: string[];
  questionAnswer?: string;
  questionOrder: number;
  isRequired: boolean;
  isHidden: boolean;
  action: string | null; // e.g., "show", "hide"
  condition: string | null;
  conditionalLogic?: ConditionalLogic[];
}

export interface ConditionalLogic {
  id?: string;
  formId?: string;
  questionId?: string;
  operator: string;
  value: string;
  action_questionId: string[];
}
