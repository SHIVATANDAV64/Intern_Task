# Quick Start Guide - Testing New Features

## Prerequisites
Ensure you have the existing environment variables configured in `server/.env` and `client/.env.local`.

## New Environment Variables (Optional)

### Email Notifications
Add to `server/.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@formgen.ai
FRONTEND_URL=http://localhost:3000
```

**Note:** Email notifications will work without SMTP config (logs only). Configure SMTP for actual email delivery.

## Installation Steps

### 1. Install Backend Dependencies
```powershell
cd server
npm install
```

### 2. Install Frontend Dependencies
```powershell
cd client
npm install
```
*(Already completed - @dnd-kit packages installed)*

### 3. Start Backend Server
```powershell
cd server
npm run dev
```
Server runs on: http://localhost:5000

### 4. Start Frontend Server
```powershell
cd client
npm run dev
```
Frontend runs on: http://localhost:3000

---

## Testing the Features

### 1. Form Templates
1. Create a few forms via AI generation
2. Mark one as template:
   ```
   POST http://localhost:5000/api/forms/{formId}/mark-template
   Authorization: Bearer {your-token}
   ```
3. Visit: http://localhost:3000/dashboard/templates
4. Click "Use Template" to duplicate

### 2. Form Duplication
1. Go to any form details page
2. Look for "Duplicate" button (needs UI integration)
3. Or use API:
   ```
   POST http://localhost:5000/api/forms/{formId}/duplicate
   Authorization: Bearer {your-token}
   ```

### 3. Email Notifications

**Test with Logs (No SMTP):**
1. Create a form
2. Update form with email settings:
   ```json
   PUT http://localhost:5000/api/forms/{formId}
   {
     "emailNotifications": {
       "enabled": true,
       "recipients": ["test@example.com"],
       "subject": "New Submission!",
       "includeResponses": true
     }
   }
   ```
3. Submit the form via public link
4. Check server logs for email output

**Test with Real Email (SMTP Configured):**
1. Add SMTP environment variables
2. Restart server
3. Follow steps above
4. Check inbox for email

### 4. Webhooks

**Setup Test Webhook:**
1. Visit https://webhook.site to get a test URL
2. Add webhook to form:
   ```json
   POST http://localhost:5000/api/forms/{formId}/webhooks
   {
     "url": "https://webhook.site/your-unique-id",
     "secret": "my-secret-key",
     "events": ["submission.created"]
   }
   ```
3. Test webhook:
   ```
   POST http://localhost:5000/api/forms/{formId}/webhooks/{webhookId}/test
   ```
4. Submit form and check webhook.site for payload

**Verify Signature:**
```javascript
const crypto = require('crypto');

const payload = { /* webhook payload */ };
const signature = req.headers['x-formgen-signature'];
const secret = 'my-secret-key';

const hmac = crypto.createHmac('sha256', secret);
hmac.update(JSON.stringify(payload));
const expectedSignature = 'sha256=' + hmac.digest('hex');

if (signature === expectedSignature) {
  console.log('Signature verified!');
}
```

### 5. Conditional Logic

**Add Rules to Form:**
```json
PUT http://localhost:5000/api/forms/{formId}
{
  "conditionalRules": [
    {
      "id": "rule-1",
      "fieldId": "role",
      "condition": "equals",
      "value": "Developer",
      "action": "show",
      "targetFieldIds": ["github_url"]
    }
  ]
}
```

**Evaluate Rules:**
```javascript
// In your form renderer
import { conditionalLogicEngine } from '@/services/conditionalLogicEngine';

const result = conditionalLogicEngine.evaluate(
  form.conditionalRules,
  currentResponses,
  allFieldIds
);

// result.visibleFields - Array of field IDs to show
// result.hiddenFields - Array of field IDs to hide
// result.requiredFields - Array of field IDs to make required
```

---

## API Testing with Postman/Thunder Client

### Import Collection
Create a new collection with these endpoints:

#### Forms
```
POST   /api/forms/generate               # Generate form with AI
GET    /api/forms                        # List user's forms
GET    /api/forms/:id                    # Get form details
PUT    /api/forms/:id                    # Update form
DELETE /api/forms/:id                    # Delete form
POST   /api/forms/:id/duplicate          # Duplicate form
GET    /api/forms/templates/list         # List templates
POST   /api/forms/:id/mark-template      # Toggle template status
```

#### Webhooks
```
POST   /api/forms/:id/webhooks           # Add webhook
PUT    /api/forms/:id/webhooks/:webhookId     # Update webhook
DELETE /api/forms/:id/webhooks/:webhookId     # Delete webhook
POST   /api/forms/:id/webhooks/:webhookId/test # Test webhook
GET    /api/forms/:id/webhook-logs       # View logs
```

#### Submissions
```
POST   /api/submissions/:formId          # Submit form
GET    /api/submissions/:id              # Get submission
```

---

## Common Issues & Solutions

### Issue: "Email service not configured"
**Solution:** This is normal if SMTP is not configured. Emails will be logged to console. Add SMTP environment variables for real email delivery.

### Issue: Webhook delivery fails
**Solution:** 
- Check webhook URL is accessible from server
- Verify URL returns 2xx status code
- Check webhook logs: `GET /api/forms/:id/webhook-logs`
- Try test endpoint first

### Issue: Template page shows "No templates available"
**Solution:** Mark at least one form as template:
```
POST /api/forms/{formId}/mark-template
```

### Issue: Form duplication creates empty form
**Solution:** Check original form exists and is accessible (public or owner)

---

## Integrating UI Components

### Add EmailSettings to Form Details
```tsx
import { EmailSettings } from '@/components/EmailSettings';

// In your form details page:
<EmailSettings
  formId={form.id}
  emailNotifications={form.emailNotifications}
  onUpdate={fetchForm}
/>
```

### Add WebhookSettings to Form Details
```tsx
import { WebhookSettings } from '@/components/WebhookSettings';

// In your form details page:
<WebhookSettings
  formId={form.id}
  webhooks={form.webhooks || []}
  onUpdate={fetchForm}
/>
```

---

## Next Steps

1. **Integrate Settings UI:**
   - Add a "Settings" tab to form details page
   - Mount EmailSettings and WebhookSettings components
   - Test end-to-end flow

2. **Add Navigation:**
   - Add "Templates" link to dashboard sidebar
   - Add "Duplicate" button to form cards

3. **Test Conditional Logic:**
   - Create form with dependent fields
   - Add conditional rules via API
   - Implement frontend evaluation (see conditionalLogicEngine.ts)

4. **Implement Drag-and-Drop:**
   - Follow @dnd-kit documentation
   - Add to form creator field list
   - Persist order on save

---

## Monitoring

### Check Server Logs
```powershell
# Backend logs show:
- Email notification attempts
- Webhook delivery status
- Form duplication events
- Conditional logic validation
```

### Check Browser Console
```javascript
// Frontend logs show:
- API request/response
- Component render cycles
- Form validation errors
```

### Check Database
```javascript
// MongoDB collections:
db.forms.find({ isTemplate: true })  // View templates
db.webhooklogs.find({ formId: ObjectId('...') })  // View webhook logs
```

---

## Performance Tips

1. **Email & Webhook Delivery:**
   - Both are async and non-blocking
   - Check logs if delivery seems delayed
   - Configure retries in webhookService.ts

2. **Template Gallery:**
   - Paginated by default (12 per page)
   - Add Redis caching for production

3. **Conditional Logic:**
   - Client-side evaluation is instant
   - Server-side validation on submit

---

## Security Checklist

- [x] Webhook signature verification implemented
- [x] Email recipient validation
- [x] Rate limiting on form generation
- [x] Authentication required for sensitive endpoints
- [x] Input validation on all new endpoints
- [x] Circular dependency check for conditional logic
- [ ] Add CORS whitelist for webhook callbacks (optional)
- [ ] Add webhook URL validation (block internal IPs)

---

## Support

For issues or questions about the implementation:
1. Check IMPLEMENTATION.md for detailed documentation
2. Review inline code comments in service files
3. Check server logs for error messages
4. Verify environment variables are set correctly

Happy testing! 🚀
