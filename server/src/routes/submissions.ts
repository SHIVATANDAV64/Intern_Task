import { Router, Request, Response } from 'express';
import { body, validationResult, param } from 'express-validator';
import { Form, Submission, User } from '../models';
import { uploadDocument, uploadToCloudinary } from '../config/cloudinary';
import { emailService } from '../services/emailService';
import { webhookService } from '../services/webhookService';

const router = Router();

/**
 * @route   POST /api/submissions/:formId
 * @desc    Submit a response to a form
 * @access  Public
 */
router.post(
  '/:formId',
  uploadDocument.array('files', 10), // Max 10 files
  [param('formId').isMongoId().withMessage('Invalid form ID')],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
        return;
      }

      const form = await Form.findById(req.params.formId);

      if (!form) {
        res.status(404).json({ message: 'Form not found' });
        return;
      }

      if (!form.isPublic) {
        res.status(403).json({ message: 'This form is not accepting responses' });
        return;
      }

      // Parse responses from body
      let responses: Record<string, string | number | boolean | string[]> = {};
      
      if (req.body.responses) {
        const parsed = typeof req.body.responses === 'string' 
          ? JSON.parse(req.body.responses) 
          : req.body.responses;
        responses = parsed as Record<string, string | number | boolean | string[]>;
      }

      // Handle file uploads
      const imageUrls: Record<string, string> = {};
      const files = req.files as Express.Multer.File[];

      if (files && files.length > 0) {
        for (const file of files) {
          try {
            const result = await uploadToCloudinary(
              file.buffer,
              `formgen/submissions/${form._id}`,
              file.mimetype.startsWith('image/') ? 'image' : 'raw'
            );
            // Use the fieldname as key (e.g., "field-profile-picture")
            imageUrls[file.fieldname] = result.url;
          } catch (uploadError) {
            console.error('File upload error:', uploadError);
          }
        }
      }

      // Validate required fields
      const missingFields: string[] = [];
      for (const field of form.formSchema.fields) {
        if (field.required) {
          const hasResponse = responses[field.name] !== undefined && responses[field.name] !== '';
          const hasFile = field.type === 'image' || field.type === 'file' 
            ? imageUrls[field.id] !== undefined 
            : false;
          
          if (!hasResponse && !hasFile) {
            missingFields.push(field.label);
          }
        }
      }

      if (missingFields.length > 0) {
        res.status(400).json({ 
          message: 'Missing required fields', 
          fields: missingFields 
        });
        return;
      }

      // Create submission
      const submission = await Submission.create({
        formId: form._id,
        userId: form.userId,
        responses,
        imageUrls,
        metadata: {
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip || req.socket.remoteAddress,
        },
      });

      // Increment submission count
      await Form.findByIdAndUpdate(form._id, {
        $inc: { submissionCount: 1 },
      });

      // Send email notification (async, non-blocking)
      if (form.emailNotifications?.enabled) {
        User.findById(form.userId)
          .then(user => {
            if (user) {
              emailService.sendSubmissionNotification(form, submission, user.email)
                .catch(err => console.error('Email notification error:', err));
            }
          })
          .catch(err => console.error('User lookup error:', err));
      }

      // Deliver webhooks (async, non-blocking)
      if (form.webhooks && form.webhooks.length > 0) {
        const webhookPayload = {
          event: 'submission.created',
          formId: form._id.toString(),
          submissionId: submission._id.toString(),
          timestamp: submission.submittedAt,
          data: {
            responses: submission.responses,
            imageUrls: submission.imageUrls,
          },
        };
        
        webhookService.deliverWebhooks(
          form._id,
          'submission.created',
          form.webhooks,
          webhookPayload
        ).catch(err => console.error('Webhook delivery error:', err));
      }

      res.status(201).json({
        message: 'Form submitted successfully',
        submissionId: submission._id,
      });
    } catch (error) {
      console.error('Submission error:', error);
      res.status(500).json({ message: 'Failed to submit form' });
    }
  }
);

/**
 * @route   GET /api/submissions/:id
 * @desc    Get a specific submission by ID
 * @access  Private (form owner only - checked via form ownership)
 */
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid submission ID')],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
        return;
      }

      const submission = await Submission.findById(req.params.id)
        .populate('formId', 'title schema');

      if (!submission) {
        res.status(404).json({ message: 'Submission not found' });
        return;
      }

      res.json({
        submission: {
          id: submission._id,
          responses: submission.responses,
          imageUrls: submission.imageUrls,
          submittedAt: submission.submittedAt,
          form: submission.formId,
        },
      });
    } catch (error) {
      console.error('Get submission error:', error);
      res.status(500).json({ message: 'Failed to fetch submission' });
    }
  }
);

export default router;
