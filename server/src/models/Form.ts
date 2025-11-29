import mongoose, { Document, Schema } from 'mongoose';

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

export interface IFormField {
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
  accept?: string; // For file inputs (e.g., "image/*")
}

export interface IFormSchema {
  title: string;
  description?: string;
  fields: IFormField[];
  pages?: IFormPage[]; // For multi-page forms
}

export interface IFormPage {
  id: string;
  title: string;
  fields: IFormField[];
}

export interface IEmailNotification {
  enabled: boolean;
  recipients: string[];
  subject: string;
  includeResponses: boolean;
}

export interface IWebhook {
  id: string;
  url: string;
  secret: string;
  events: string[]; // ['submission.created', 'submission.updated']
  enabled: boolean;
}

export interface IFormTheme {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  logoUrl?: string;
  customCSS?: string;
}

export interface IConditionalRule {
  id: string;
  fieldId: string; // Trigger field
  condition: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
  action: 'show' | 'hide' | 'require' | 'unrequire';
  targetFieldIds: string[];
}

export interface IForm extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  prompt: string;
  formSchema: IFormSchema;
  summary: string; // AI-generated summary for semantic search
  purpose: string; // Categorized purpose (e.g., "job application", "survey")
  fieldTypes: string[]; // Array of field types for quick filtering
  isPublic: boolean;
  submissionCount: number;
  isTemplate: boolean; // Mark form as template for library
  sourceFormId?: mongoose.Types.ObjectId; // Track duplication lineage
  emailNotifications?: IEmailNotification;
  webhooks?: IWebhook[];
  theme?: IFormTheme;
  conditionalRules?: IConditionalRule[];
  createdAt: Date;
  updatedAt: Date;
}

const FormFieldSchema = new Schema<IFormField>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    label: { type: String, required: true },
    type: { 
      type: String, 
      required: true,
      enum: ['text', 'email', 'number', 'textarea', 'select', 'checkbox', 'radio', 'date', 'file', 'image', 'url', 'phone']
    },
    placeholder: String,
    required: { type: Boolean, default: false },
    validation: {
      min: Number,
      max: Number,
      minLength: Number,
      maxLength: Number,
      pattern: String,
      message: String,
    },
    options: [{
      label: String,
      value: String,
    }],
    accept: String,
  },
  { _id: false }
);

const FormPageSchema = new Schema<IFormPage>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    fields: [FormFieldSchema],
  },
  { _id: false }
);

const FormSchemaDefinition = new Schema<IFormSchema>(
  {
    title: { type: String, required: true },
    description: String,
    fields: [FormFieldSchema],
    pages: [FormPageSchema],
  },
  { _id: false }
);

const EmailNotificationSchema = new Schema<IEmailNotification>(
  {
    enabled: { type: Boolean, default: false },
    recipients: [String],
    subject: String,
    includeResponses: { type: Boolean, default: true },
  },
  { _id: false }
);

const WebhookSchema = new Schema<IWebhook>(
  {
    id: { type: String, required: true },
    url: { type: String, required: true },
    secret: String,
    events: [String],
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const FormThemeSchema = new Schema<IFormTheme>(
  {
    primaryColor: String,
    secondaryColor: String,
    fontFamily: String,
    logoUrl: String,
    customCSS: String,
  },
  { _id: false }
);

const ConditionalRuleSchema = new Schema<IConditionalRule>(
  {
    id: { type: String, required: true },
    fieldId: { type: String, required: true },
    condition: {
      type: String,
      enum: ['equals', 'notEquals', 'contains', 'greaterThan', 'lessThan'],
      required: true,
    },
    value: Schema.Types.Mixed,
    action: {
      type: String,
      enum: ['show', 'hide', 'require', 'unrequire'],
      required: true,
    },
    targetFieldIds: [String],
  },
  { _id: false }
);

const FormSchema = new Schema<IForm>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    prompt: {
      type: String,
      required: true,
    },
    formSchema: {
      type: FormSchemaDefinition,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
      index: true,
    },
    fieldTypes: [{
      type: String,
    }],
    isPublic: {
      type: Boolean,
      default: true,
    },
    submissionCount: {
      type: Number,
      default: 0,
    },
    isTemplate: {
      type: Boolean,
      default: false,
      index: true,
    },
    sourceFormId: {
      type: Schema.Types.ObjectId,
      ref: 'Form',
    },
    emailNotifications: EmailNotificationSchema,
    webhooks: [WebhookSchema],
    theme: FormThemeSchema,
    conditionalRules: [ConditionalRuleSchema],
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
FormSchema.index({ userId: 1, createdAt: -1 });
FormSchema.index({ userId: 1, purpose: 1 });
FormSchema.index({ isPublic: 1 });
FormSchema.index({ isTemplate: 1, isPublic: 1 });

// Text index for basic text search fallback
FormSchema.index({ title: 'text', description: 'text', summary: 'text' });

export const Form = mongoose.model<IForm>('Form', FormSchema);
