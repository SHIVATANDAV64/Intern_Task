// Field types supported by the form generator
export type FieldType = 
  | 'text' 
  | 'email' 
  | 'number' 
  | 'textarea' 
  | 'select' 
  | 'checkbox' 
  | 'radio' 
  | 'date' 
  | 'file' 
  | 'image'
  | 'url'
  | 'phone';

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    message?: string;
  };
  options?: Array<{ label: string; value: string }>;
  accept?: string;
}

export interface FormPage {
  id: string;
  title: string;
  fields: FormField[];
}

export interface FormSchema {
  title: string;
  description?: string;
  fields: FormField[];
  pages?: FormPage[]; // For multi-page forms
}

export interface EmailNotification {
  enabled: boolean;
  recipients: string[];
  subject: string;
  includeResponses: boolean;
}

export interface Webhook {
  id: string;
  url: string;
  secret: string;
  events: string[];
  enabled: boolean;
}

export interface FormTheme {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  logoUrl?: string;
  customCSS?: string;
}

export interface ConditionalRule {
  id: string;
  fieldId: string;
  condition: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  value: string | number | boolean | string[];
  action: 'show' | 'hide' | 'require' | 'unrequire';
  targetFieldIds: string[];
}

export interface Form {
  id: string;
  title: string;
  description: string;
  schema: FormSchema;
  purpose: string;
  submissionCount: number;
  isPublic: boolean;
  shareLink: string;
  createdAt: string;
  isOwner?: boolean;
  isTemplate?: boolean;
  sourceFormId?: string;
  emailNotifications?: EmailNotification;
  webhooks?: Webhook[];
  theme?: FormTheme;
  conditionalRules?: ConditionalRule[];
}

export interface FormListItem {
  id: string;
  title: string;
  description: string;
  purpose: string;
  submissionCount: number;
  isPublic: boolean;
  shareLink: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  responses: Record<string, string | number | boolean | string[]>;
  imageUrls: Record<string, string>;
  submittedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface FormsResponse {
  forms: FormListItem[];
  pagination: PaginationInfo;
}

export interface SubmissionsResponse {
  submissions: Submission[];
  pagination: PaginationInfo;
}
