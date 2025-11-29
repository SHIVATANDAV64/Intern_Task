import mongoose, { Document, Schema } from 'mongoose';

export interface ISubmission extends Document {
  _id: mongoose.Types.ObjectId;
  formId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // Form owner's ID
  responses: Record<string, string | number | boolean | string[]>;
  imageUrls: Record<string, string>; // Field name -> Cloudinary URL
  submittedAt: Date;
  metadata: {
    userAgent?: string;
    ipAddress?: string;
  };
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: 'Form',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    responses: {
      type: Schema.Types.Mixed,
      required: true,
    },
    imageUrls: {
      type: Schema.Types.Mixed,
      default: {},
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      userAgent: String,
      ipAddress: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
SubmissionSchema.index({ formId: 1, submittedAt: -1 });
SubmissionSchema.index({ userId: 1, submittedAt: -1 });

export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);
