import { JsonValue } from '@prisma/client/runtime/library';

export interface Template {
  id: string;
  title: string;
  description: string;
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
  questionOptions: string[];
  validations: string[];
  questionOrder: number;
  pageNumber: number;
  isRequired: boolean;
}

export interface Styling {
  PageColor: string;
  PageImage?: string;
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
  isSinglePage: boolean;
  noOfPages: number;
  styling: JsonValue | null;
  privateSharingToken: string | null;
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
    validations: string[];
    questionAnswer: string | null;
    questionOrder: number;
    isRequired: boolean;
    isHidden: boolean;
  }[];
}
