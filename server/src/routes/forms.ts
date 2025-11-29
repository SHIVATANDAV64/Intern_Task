import { Router, Response } from 'express';
import { body, validationResult, param } from 'express-validator';
import { Form, Submission } from '../models';
import { authenticate, AuthRequest } from '../middleware/auth';
import { formGeneratorService } from '../services/formGenerator';
import { generateFormLimiter } from '../middleware/rateLimit';
import { webhookService } from '../services/webhookService';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * @route   POST /api/forms/generate
 * @desc    Generate a new form from natural language prompt
 * @access  Private
 */
router.post(
  '/generate',
  authenticate,
  generateFormLimiter,
  [body('prompt').trim().notEmpty().withMessage('Prompt is required')],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
        return;
      }

      const { prompt } = req.body;
      const userId = req.userId!;

      // Generate form using AI with context-aware memory
      const generatedForm = await formGeneratorService.generateForm(userId, prompt);

      // Save form to database
      const form = await Form.create({
        userId,
        title: generatedForm.schema.title,
        description: generatedForm.schema.description || '',
        prompt,
        formSchema: generatedForm.schema,
        summary: generatedForm.summary,
        purpose: generatedForm.purpose,
        fieldTypes: generatedForm.fieldTypes,
        isPublic: true,
      });

      // Store embedding for future semantic search (async, non-blocking)
      formGeneratorService.storeFormEmbedding(form).catch(console.error);

      res.status(201).json({
        message: 'Form generated successfully',
        form: {
          id: form._id,
          title: form.title,
          description: form.description,
          schema: form.formSchema,
          shareLink: `/form/${form._id}`,
          createdAt: form.createdAt,
        },
      });
    } catch (error) {
      console.error('Form generation error:', error);
      res.status(500).json({ message: 'Failed to generate form' });
    }
  }
);

/**
 * @route   GET /api/forms
 * @desc    Get all forms for the authenticated user
 * @access  Private
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [forms, total] = await Promise.all([
      Form.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title description purpose submissionCount isPublic createdAt'),
      Form.countDocuments({ userId }),
    ]);

    res.json({
      forms: forms.map(form => ({
        id: form._id,
        title: form.title,
        description: form.description,
        purpose: form.purpose,
        submissionCount: form.submissionCount,
        isPublic: form.isPublic,
        shareLink: `/form/${form._id}`,
        createdAt: form.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get forms error:', error);
    res.status(500).json({ message: 'Failed to fetch forms' });
  }
});

/**
 * @route   GET /api/forms/:id
 * @desc    Get a specific form by ID
 * @access  Public (for public forms) / Private (for form owner)
 */
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid form ID')],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
        return;
      }

      const form = await Form.findById(req.params.id);

      if (!form) {
        res.status(404).json({ message: 'Form not found' });
        return;
      }

      // Check if form is public or user is the owner
      const authHeader = req.headers.authorization;
      let isOwner = false;

      if (authHeader) {
        // Try to get user from token
        try {
          const jwt = await import('jsonwebtoken');
          const token = authHeader.split(' ')[1];
          const decoded = jwt.default.verify(
            token, 
            process.env.JWT_SECRET!
          ) as { userId: string };
          isOwner = decoded.userId === form.userId.toString();
        } catch {
          // Token invalid, not owner
        }
      }

      if (!form.isPublic && !isOwner) {
        res.status(403).json({ message: 'This form is not public' });
        return;
      }

      res.json({
        form: {
          id: form._id,
          title: form.title,
          description: form.description,
          schema: form.formSchema,
          isPublic: form.isPublic,
          submissionCount: form.submissionCount,
          createdAt: form.createdAt,
          isOwner,
        },
      });
    } catch (error) {
      console.error('Get form error:', error);
      res.status(500).json({ message: 'Failed to fetch form' });
    }
  }
);

/**
 * @route   PUT /api/forms/:id
 * @desc    Update a form
 * @access  Private (owner only)
 */
router.put(
  '/:id',
  authenticate,
  [param('id').isMongoId().withMessage('Invalid form ID')],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
        return;
      }

      const form = await Form.findOne({
        _id: req.params.id,
        userId: req.userId,
      });

      if (!form) {
        res.status(404).json({ message: 'Form not found' });
        return;
      }

      const { title, description, schema, isPublic } = req.body;

      if (title) form.title = title;
      if (description !== undefined) form.description = description;
      if (schema) form.formSchema = schema;
      if (isPublic !== undefined) form.isPublic = isPublic;

      await form.save();

      res.json({
        message: 'Form updated successfully',
        form: {
          id: form._id,
          title: form.title,
          description: form.description,
          schema: form.formSchema,
          isPublic: form.isPublic,
        },
      });
    } catch (error) {
      console.error('Update form error:', error);
      res.status(500).json({ message: 'Failed to update form' });
    }
  }
);

/**
 * @route   DELETE /api/forms/:id
 * @desc    Delete a form
 * @access  Private (owner only)
 */
router.delete(
  '/:id',
  authenticate,
  [param('id').isMongoId().withMessage('Invalid form ID')],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
        return;
      }

      const form = await Form.findOneAndDelete({
        _id: req.params.id,
        userId: req.userId,
      });

      if (!form) {
        res.status(404).json({ message: 'Form not found' });
        return;
      }

      // Also delete all submissions for this form
      await Submission.deleteMany({ formId: form._id });

      res.json({ message: 'Form deleted successfully' });
    } catch (error) {
      console.error('Delete form error:', error);
      res.status(500).json({ message: 'Failed to delete form' });
    }
  }
);

/**
 * @route   GET /api/forms/:id/submissions
 * @desc    Get submissions for a form
 * @access  Private (owner only)
 */
router.get(
  '/:id/submissions',
  authenticate,
  [param('id').isMongoId().withMessage('Invalid form ID')],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
        return;
      }

      // Verify user owns this form
      const form = await Form.findOne({
        _id: req.params.id,
        userId: req.userId,
      });

      if (!form) {
        res.status(404).json({ message: 'Form not found' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const [submissions, total] = await Promise.all([
        Submission.find({ formId: req.params.id })
          .sort({ submittedAt: -1 })
          .skip(skip)
          .limit(limit),
        Submission.countDocuments({ formId: req.params.id }),
      ]);

      res.json({
        submissions: submissions.map(sub => ({
          id: sub._id,
          responses: sub.responses,
          imageUrls: sub.imageUrls,
          submittedAt: sub.submittedAt,
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Get submissions error:', error);
      res.status(500).json({ message: 'Failed to fetch submissions' });
    }
  }
);

/**
 * @route   POST /api/forms/:id/duplicate
 * @desc    Duplicate an existing form
 * @access  Private
 */
router.post(
  '/:id/duplicate',
  authenticate,
  [param('id').isMongoId().withMessage('Invalid form ID')],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
        return;
      }

      const originalForm = await Form.findById(req.params.id);

      if (!originalForm) {
        res.status(404).json({ message: 'Form not found' });
        return;
      }

      // Check if user has access (owner or public form)
      const isOwner = originalForm.userId.toString() === req.userId;
      if (!originalForm.isPublic && !isOwner) {
        res.status(403).json({ message: 'Cannot duplicate this form' });
        return;
      }

      // Create duplicate form
      const duplicateForm = await Form.create({
        userId: req.userId,
        title: `${originalForm.title} (Copy)`,
        description: originalForm.description,
        prompt: originalForm.prompt,
        formSchema: originalForm.formSchema,
        summary: originalForm.summary,
        purpose: originalForm.purpose,
        fieldTypes: originalForm.fieldTypes,
        isPublic: true,
        sourceFormId: originalForm._id,
        emailNotifications: originalForm.emailNotifications,
        webhooks: [],
        theme: originalForm.theme,
        conditionalRules: originalForm.conditionalRules,
      });

      // Store embedding for semantic search
      formGeneratorService.storeFormEmbedding(duplicateForm).catch(console.error);

      res.status(201).json({
        message: 'Form duplicated successfully',
        form: {
          id: duplicateForm._id,
          title: duplicateForm.title,
          description: duplicateForm.description,
          schema: duplicateForm.formSchema,
          shareLink: `/form/${duplicateForm._id}`,
          createdAt: duplicateForm.createdAt,
        },
      });
    } catch (error) {
      console.error('Form duplication error:', error);
      res.status(500).json({ message: 'Failed to duplicate form' });
    }
  }
);

/**
 * @route   GET /api/forms/templates
 * @desc    Get public template forms
 * @access  Public
 */
router.get('/templates/list', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;
    const category = req.query.category as string;

    const query: any = { isTemplate: true, isPublic: true };
    if (category) {
      query.purpose = category;
    }

    const [templates, total] = await Promise.all([
      Form.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title description purpose fieldTypes submissionCount createdAt theme')
        .populate('userId', 'name'),
      Form.countDocuments(query),
    ]);

    res.json({
      templates: templates.map(form => ({
        id: form._id,
        title: form.title,
        description: form.description,
        purpose: form.purpose,
        fieldTypes: form.fieldTypes,
        submissionCount: form.submissionCount,
        createdAt: form.createdAt,
        theme: form.theme,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ message: 'Failed to fetch templates' });
  }
});

/**
 * @route   POST /api/forms/:id/mark-template
 * @desc    Mark a form as template
 * @access  Private (owner only)
 */
router.post(
  '/:id/mark-template',
  authenticate,
  [param('id').isMongoId().withMessage('Invalid form ID')],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
        return;
      }

      const form = await Form.findOne({
        _id: req.params.id,
        userId: req.userId,
      });

      if (!form) {
        res.status(404).json({ message: 'Form not found' });
        return;
      }

      form.isTemplate = !form.isTemplate;
      await form.save();

      res.json({
        message: `Form ${form.isTemplate ? 'added to' : 'removed from'} templates`,
        isTemplate: form.isTemplate,
      });
    } catch (error) {
      console.error('Mark template error:', error);
      res.status(500).json({ message: 'Failed to update template status' });
    }
  }
);

/**
 * @route   POST /api/forms/:id/webhooks
 * @desc    Add a webhook to a form
 * @access  Private (owner only)
 */
router.post(
  '/:id/webhooks',
  authenticate,
  [
    param('id').isMongoId().withMessage('Invalid form ID'),
    body('url').isURL().withMessage('Valid URL is required'),
    body('events').isArray().withMessage('Events array is required'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
        return;
      }

      const form = await Form.findOne({
        _id: req.params.id,
        userId: req.userId,
      });

      if (!form) {
        res.status(404).json({ message: 'Form not found' });
        return;
      }

      const { url, events, secret } = req.body;
      
      const newWebhook = {
        id: uuidv4(),
        url,
        secret: secret || '',
        events,
        enabled: true,
      };

      if (!form.webhooks) {
        form.webhooks = [];
      }

      form.webhooks.push(newWebhook);
      await form.save();

      res.status(201).json({
        message: 'Webhook added successfully',
        webhook: newWebhook,
      });
    } catch (error) {
      console.error('Add webhook error:', error);
      res.status(500).json({ message: 'Failed to add webhook' });
    }
  }
);

/**
 * @route   PUT /api/forms/:id/webhooks/:webhookId
 * @desc    Update a webhook
 * @access  Private (owner only)
 */
router.put(
  '/:id/webhooks/:webhookId',
  authenticate,
  [param('id').isMongoId().withMessage('Invalid form ID')],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
        return;
      }

      const form = await Form.findOne({
        _id: req.params.id,
        userId: req.userId,
      });

      if (!form) {
        res.status(404).json({ message: 'Form not found' });
        return;
      }

      const webhookIndex = form.webhooks?.findIndex(wh => wh.id === req.params.webhookId);
      
      if (webhookIndex === -1 || webhookIndex === undefined) {
        res.status(404).json({ message: 'Webhook not found' });
        return;
      }

      const { url, events, secret, enabled } = req.body;
      
      if (url) form.webhooks![webhookIndex].url = url;
      if (events) form.webhooks![webhookIndex].events = events;
      if (secret !== undefined) form.webhooks![webhookIndex].secret = secret;
      if (enabled !== undefined) form.webhooks![webhookIndex].enabled = enabled;

      await form.save();

      res.json({
        message: 'Webhook updated successfully',
        webhook: form.webhooks![webhookIndex],
      });
    } catch (error) {
      console.error('Update webhook error:', error);
      res.status(500).json({ message: 'Failed to update webhook' });
    }
  }
);

/**
 * @route   DELETE /api/forms/:id/webhooks/:webhookId
 * @desc    Delete a webhook
 * @access  Private (owner only)
 */
router.delete(
  '/:id/webhooks/:webhookId',
  authenticate,
  [param('id').isMongoId().withMessage('Invalid form ID')],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
        return;
      }

      const form = await Form.findOne({
        _id: req.params.id,
        userId: req.userId,
      });

      if (!form) {
        res.status(404).json({ message: 'Form not found' });
        return;
      }

      if (!form.webhooks) {
        res.status(404).json({ message: 'Webhook not found' });
        return;
      }

      form.webhooks = form.webhooks.filter(wh => wh.id !== req.params.webhookId);
      await form.save();

      res.json({ message: 'Webhook deleted successfully' });
    } catch (error) {
      console.error('Delete webhook error:', error);
      res.status(500).json({ message: 'Failed to delete webhook' });
    }
  }
);

/**
 * @route   POST /api/forms/:id/webhooks/:webhookId/test
 * @desc    Test a webhook
 * @access  Private (owner only)
 */
router.post(
  '/:id/webhooks/:webhookId/test',
  authenticate,
  [param('id').isMongoId().withMessage('Invalid form ID')],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
        return;
      }

      const form = await Form.findOne({
        _id: req.params.id,
        userId: req.userId,
      });

      if (!form) {
        res.status(404).json({ message: 'Form not found' });
        return;
      }

      const webhook = form.webhooks?.find(wh => wh.id === req.params.webhookId);
      
      if (!webhook) {
        res.status(404).json({ message: 'Webhook not found' });
        return;
      }

      const result = await webhookService.testWebhook(webhook.url, webhook.secret);

      res.json(result);
    } catch (error) {
      console.error('Test webhook error:', error);
      res.status(500).json({ message: 'Failed to test webhook' });
    }
  }
);

/**
 * @route   GET /api/forms/:id/webhook-logs
 * @desc    Get webhook delivery logs
 * @access  Private (owner only)
 */
router.get(
  '/:id/webhook-logs',
  authenticate,
  [param('id').isMongoId().withMessage('Invalid form ID')],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
        return;
      }

      const form = await Form.findOne({
        _id: req.params.id,
        userId: req.userId,
      });

      if (!form) {
        res.status(404).json({ message: 'Form not found' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const { logs, total } = await webhookService.getWebhookLogs(form._id, page, limit);

      res.json({
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Get webhook logs error:', error);
      res.status(500).json({ message: 'Failed to fetch webhook logs' });
    }
  }
);

export default router;
