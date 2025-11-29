# 🚀 Quick Start Guide - FormGen AI

Complete guide to setting up and testing all features of FormGen AI locally.

## 📋 Prerequisites

Before you start, ensure you have:
- **Node.js** v18+ installed
- **MongoDB Atlas** account and connection string
- **Google Gemini API** key
- **Pinecone** API key (optional but recommended)
- **Cloudinary** credentials (optional)

## 🔧 Initial Setup

### 1. Clone the Repository
```powershell
git clone https://github.com/SHIVATANDAV64/Intern_Task.git
cd Intern_Task
```

### 2. Backend Configuration

Navigate to server directory and create `.env`:
```powershell
cd server
Copy-Item .env.example .env  # or manually create .env
```

Add required environment variables to `server/.env`:
```env
# Core Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/formgen?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-key-min-32-characters-long-random-string

# AI & Embeddings
GEMINI_API_KEY=AIzaSy...your-gemini-api-key
EMBEDDING_PROVIDER=pinecone
EMBEDDING_MODEL=llama-text-embed-v2
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX=form-embeddings
PINECONE_TOP_K=5

# Media Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=60

# Email Notifications (OPTIONAL)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@formgen.ai
FRONTEND_URL=http://localhost:3000
```

**Note:** Email notifications work without SMTP config (logs only). Configure SMTP for actual email delivery.


### 3. Frontend Configuration

Navigate to client directory and create `.env.local`:
```powershell
cd ../client
Copy-Item .env.example .env.local  # or manually create .env.local
```

Add to `client/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Install Dependencies

```powershell
# Install root dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..

# Install frontend dependencies
cd client
npm install
cd ..
```

### 5. Start Development Servers

**Option A: Run Both Together (Recommended)**
```powershell
npm run dev
```

**Option B: Run Separately**

Terminal 1 (Backend):
```powershell
cd server
npm run dev
```

Terminal 2 (Frontend):
```powershell
cd client
npm run dev
```

### 6. Access Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

---

## ✨ Testing All Features (13+ Features)

### Feature 1: User Authentication ✅

**Test Sign Up:**
1. Navigate to http://localhost:3000/register
2. Enter email and password (password must be at least 6 characters)
3. Click "Sign Up"
4. Redirects to login

**Test Login:**
1. Go to http://localhost:3000/login
2. Enter your credentials
3. Click "Login"
4. Redirects to dashboard with your forms

**Verify JWT Token:**
1. Check browser localStorage for `auth_token`
2. All subsequent API calls include Authorization header

---

### Feature 2: Dashboard & Submissions ✅

**Test Dashboard:**
1. After login, view your dashboard at http://localhost:3000/dashboard
2. See all your created forms with submission counts
3. Click on any form to view its submissions
4. Each submission shows responses, timestamps, and file URLs
5. Filter/sort by date, status, and form

---

### Feature 3: AI Form Generation ✅

**Test Form Generation:**
1. Click "Create Form" in dashboard
2. Enter a prompt like: `"Create a job application form with name, email, phone, and experience level"`
3. Click "Generate with AI"
4. Wait for AI to generate the form schema (uses Gemini API)
5. Review the generated fields, types, and validation rules
6. Click "Create" to save the form

**Prompts to Try:**
- "Build a customer feedback survey with satisfaction rating, comments, and recommendation"
- "Design a contact form with name, email, subject, message, and file attachment"
- "Create a product order form with item selection, quantity, and delivery address"
- "Generate a registration form for an event with name, email, company, and dietary preferences"
- "Make a technical assessment form with name, experience, and code sample upload"

**Observe:**
- AI generates appropriate field types based on context
- Validation rules are automatically applied (email validation, required fields, etc.)
- Form descriptions are created from your prompt

---

### Feature 4: Context-Aware Memory (Semantic Search) ✅

**How It Works:**
1. When you generate a form, the system creates a vector embedding of the form summary
2. This embedding is stored in Pinecone database
3. Next time you create a form, the AI retrieves Top-5 most similar forms from your history
4. The AI uses these similar forms as context to generate more consistent styles

**Observe:**
1. Generate several forms with similar themes (e.g., multiple surveys)
2. Create a new survey form
3. Check server logs to see retrieved context forms
4. Notice the generated form follows similar structure and field naming conventions

---

### Feature 5: Public Form Rendering ✅

**Test Public Form:**
1. In dashboard, click the share icon on any form
2. Copy the public link (format: `http://localhost:3000/form/{id}`)
3. Open the link in an incognito/private window (no login needed)
4. Fill out the form with test data
5. Upload an image/file if the form has file field
6. Submit the form

**Observe:**
- Form renders with all field types (text, email, number, select, checkbox, date, file, etc.)
- Client-side validation prevents submission with invalid data
- Image preview shows before submission
- Success message appears after submission
- No authentication required for public forms

---

### Feature 6: Form Templates ✅

**Browse Template Gallery:**
1. Navigate to http://localhost:3000/dashboard/templates
2. View all public templates marked as templates
3. See template cards with:
   - Template title and description
   - Purpose badge (colored label)
   - Submission count
   - Preview of first 5 fields

**Mark Form as Template:**
```powershell
# Using API (with your token):
POST http://localhost:5000/api/forms/{formId}/mark-template
Authorization: Bearer {your-token}
```

**Use Template (Duplicate):**
1. Click "Use Template" on any template
2. Form is duplicated to your account with "(Copy)" suffix
3. Original submission count is reset to 0
4. You can now edit and customize the template

---

### Feature 7: Form Duplication ✅

**Test via UI:**
1. In dashboard, click "Duplicate" button on any form
2. New form created with "(Copy)" suffix
3. All settings, fields, and logic copied
4. Submission count reset to 0

**Test via API:**
```powershell
POST http://localhost:5000/api/forms/{formId}/duplicate
Authorization: Bearer {your-token}
```

**Expected Response:**
```json
{
  \"id\": \"new-form-id\",
  \"title\": \"Original Title (Copy)\",
  \"sourceFormId\": \"original-form-id\",
  \"submissionCount\": 0
}
```

---

### Feature 8: Email Notifications ✅

**Setup Email Configuration (Gmail - Recommended):**

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account → Security → App passwords
   - Select \"Mail\" and \"Other (custom name)\"
   - Generate the 16-character password
3. Update `server/.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=noreply@formgen.ai
FRONTEND_URL=http://localhost:3000
```

4. Restart backend server

**Enable Email Notifications via API:**
```json
PUT http://localhost:5000/api/forms/{formId}
Authorization: Bearer {your-token}
Content-Type: application/json

{
  \"emailNotifications\": {
    \"enabled\": true,
    \"recipients\": [\"your-email@gmail.com\", \"another@email.com\"],
    \"subject\": \"New Submission: New Form Response\",
    \"includeResponses\": true
  }
}
```

**Test Email Delivery:**
1. Get public form link: `http://localhost:3000/form/{formId}`
2. Submit the form with test data
3. Wait 2-3 seconds for async email delivery
4. Check your email inbox for notification
5. Email contains form responses in formatted HTML
6. Check server logs for delivery status: \"Email sent successfully\"

**Without SMTP (Console Logging):**
- If SMTP not configured, emails are logged to console
- Still functional for testing, just not delivered

---

### Feature 9: Webhooks ✅

**Setup Test Webhook (Using webhook.site):**

1. Visit https://webhook.site
2. Copy your unique webhook URL (e.g., `https://webhook.site/a1b2c3d4...`)
3. Add webhook via API:
```json
POST http://localhost:5000/api/forms/{formId}/webhooks
Authorization: Bearer {your-token}
Content-Type: application/json

{
  \"url\": \"https://webhook.site/your-unique-url\",
  \"secret\": \"my-secret-key\",
  \"events\": [\"submission.created\"]
}
```

**Test Webhook with Test Endpoint:**
```powershell
POST http://localhost:5000/api/forms/{formId}/webhooks/{webhookId}/test
Authorization: Bearer {your-token}
```

Check webhook.site for the test payload that arrives.

**Test Webhook with Real Form Submission:**
1. Submit the form at `http://localhost:3000/form/{formId}`
2. Check webhook.site - payload should arrive within seconds
3. Webhook automatically retries on failure (3 attempts with backoff)

**Webhook Payload Example:**
```json
{
  \"event\": \"submission.created\",
  \"formId\": \"64a5b2c3f1e8d9a4b5c6d7e8\",
  \"submissionId\": \"64a5b2c3f1e8d9a4b5c6d7e9\",
  \"timestamp\": \"2025-11-29T10:30:00.000Z\",
  \"signature\": \"sha256=...\",
  \"data\": {
    \"responses\": {
      \"name\": \"John Doe\",
      \"email\": \"john@example.com\",
      \"experience\": \"5 years\"
    },
    \"imageUrls\": {
      \"resume\": \"https://cloudinary.com/...jpg\"
    }
  }
}
```

**Verify Webhook Signature (Node.js Example):**
```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSig = 'sha256=' + 
    crypto.createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
  
  return signature === expectedSig;
}

// In your webhook handler
const isValid = verifyWebhook(req.body, req.headers['x-formgen-signature'], 'my-secret-key');
if (isValid) {
  console.log('✅ Webhook signature verified!');
} else {
  console.log('❌ Invalid signature');
}
```

**View Webhook Delivery Logs:**
```powershell
GET http://localhost:5000/api/forms/{formId}/webhook-logs
Authorization: Bearer {your-token}
```

Response shows all webhook attempts with:
- Success/failure status
- HTTP response code
- Error messages (if failed)
- Timestamp and retry attempt number

---

### Feature 10: Webhook Management ✅

**List Webhooks for Form:**
```powershell
GET http://localhost:5000/api/forms/{formId}
Authorization: Bearer {your-token}

# Response includes webhooks array
```

**Update Webhook:**
```json
PUT http://localhost:5000/api/forms/{formId}/webhooks/{webhookId}
Authorization: Bearer {your-token}
Content-Type: application/json

{
  \"url\": \"https://new-webhook-url.com/hook\",
  \"secret\": \"new-secret\",
  \"events\": [\"submission.created\"],
  \"enabled\": true
}
```

**Delete Webhook:**
```powershell
DELETE http://localhost:5000/api/forms/{formId}/webhooks/{webhookId}
Authorization: Bearer {your-token}
```

---

### Feature 11: Conditional Logic Engine ✅

**Add Conditional Rules to Form:**
```json
PUT http://localhost:5000/api/forms/{formId}
Authorization: Bearer {your-token}
Content-Type: application/json

{
  \"conditionalRules\": [
    {
      \"id\": \"rule-1\",
      \"fieldId\": \"employment_status\",
      \"condition\": \"equals\",
      \"value\": \"employed\",
      \"action\": \"show\",
      \"targetFieldIds\": [\"company_name\", \"job_title\"]
    },
    {
      \"id\": \"rule-2\",
      \"fieldId\": \"country\",
      \"condition\": \"equals\",
      \"value\": \"USA\",
      \"action\": \"require\",
      \"targetFieldIds\": [\"state\", \"zip_code\"]
    },
    {
      \"id\": \"rule-3\",
      \"fieldId\": \"experience_years\",
      \"condition\": \"greaterThan\",
      \"value\": 5,
      \"action\": \"show\",
      \"targetFieldIds\": [\"leadership_experience\"]
    }
  ]
}
```

**Supported Conditions:**
- `equals` - Field value exactly matches string/number
- `notEquals` - Field value does not equal
- `contains` - Field value contains substring
- `greaterThan` - Numeric field value > comparison value
- `lessThan` - Numeric field value < comparison value

**Supported Actions:**
- `show` - Display target fields if condition is true
- `hide` - Hide target fields if condition is true
- `require` - Make target fields mandatory if condition is true
- `unrequire` - Make target fields optional if condition is true

**Test Conditional Logic:**
1. Submit form with different field values
2. Backend validates rules and processes accordingly
3. Client-side evaluation (via conditionalLogicEngine) shows/hides fields instantly
4. Server-side validation ensures rules are respected on submission

**Circular Dependency Detection:**
- System automatically validates that rules don't create infinite loops
- Error returned if circular dependencies detected

---

### Feature 12: File Upload & Cloudinary Integration ✅

**Test File Upload:**
1. Create a form with file upload field
2. Go to public form link
3. Select an image or document file
4. See preview of image before submission
5. Submit the form
6. File is uploaded to Cloudinary and URL stored
7. Submission response includes image URLs

**View File URLs in Submission:**
```powershell
GET http://localhost:5000/api/submissions/{submissionId}
Authorization: Bearer {your-token}

# Response includes imageUrls object with file URLs
```

---

### Feature 13: Form Validation & Error Handling ✅

**Test Validation Rules:**
1. Create a form with various validation rules
2. Try submitting with invalid data:
   - Missing required fields
   - Invalid email format
   - Numbers outside min/max range
   - Text below minLength
   - Text exceeding maxLength
3. Client-side validation prevents submission
4. Error messages display for each invalid field

**Test Error Scenarios:**
- Submit form with missing required fields
- Upload oversized file (Cloudinary limit)
- Submit to deleted form (404 error)
- Network error during submission
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
