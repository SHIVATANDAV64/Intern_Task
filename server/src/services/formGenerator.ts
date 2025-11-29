import { getGeminiClient } from '../config/gemini';
import { getPineconeIndex } from '../config/pinecone';
import { Form, IForm, IFormSchema } from '../models';
import { v4 as uuidv4 } from 'uuid';

interface FormContext {
  purpose: string;
  fields: string[];
  title: string;
  summary: string;
}

interface GeneratedForm {
  schema: IFormSchema;
  summary: string;
  purpose: string;
  fieldTypes: string[];
}

/**
 * Semantic Memory Retrieval System
 * 
 * This class handles the context-aware memory layer for the AI form generator.
 * It uses Pinecone for semantic search to find relevant past forms.
 * 
 * Architecture:
 * 1. When a user creates a form, we generate an embedding of the form's summary
 * 2. This embedding is stored in Pinecone with metadata (userId, formId, purpose, etc.)
 * 3. When generating a new form, we:
 *    a. Convert the user's prompt to an embedding
 *    b. Query Pinecone for the top-K most similar past forms (default: 5)
 *    c. Retrieve only the relevant form patterns from MongoDB
 *    d. Pass this trimmed context to the LLM
 * 
 * Scalability:
 * - Vector search is O(log n) with ANN algorithms, making it efficient for millions of forms
 * - We limit context to top-K forms (3-10) to stay within LLM token limits
 * - Metadata filtering allows user-scoped searches without full scans
 */
export class SemanticMemoryService {
  private embeddingModel = process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';
  private topK = Number(process.env.PINECONE_TOP_K || 5); // Number of relevant forms to retrieve
  private cache = new Map<string, { ts: number; results: FormContext[] }>();
  private cacheTTL = 30 * 1000; // 30s TTL

  /**
   * Generate embedding for text using Gemini's embedding model
   */
  async generateEmbedding(text: string): Promise<number[]> {
    // If switching to Pinecone-hosted embedding model
    if (process.env.EMBEDDING_PROVIDER === 'pinecone') {
      const model = process.env.EMBEDDING_MODEL || 'llama-text-embed-v2';
      const apiKey = process.env.PINECONE_API_KEY;
      if (!apiKey) throw new Error('PINECONE_API_KEY is required for Pinecone embeddings');
      const resp = await fetch('https://api.pinecone.io/inference/v1/embed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': apiKey,
        },
        body: JSON.stringify({ model, inputs: [text] }),
      });
      if (!resp.ok) {
        const body = await resp.text();
        throw new Error(`Pinecone embedding request failed: ${resp.status} ${body}`);
      }
      const data = await resp.json() as { data?: { values?: number[] }[]; embeddings?: { values?: number[] }[] };
      // Pinecone inference responses may use data[0].values or embeddings[0].values depending on version
      const values = data?.data?.[0]?.values || data?.embeddings?.[0]?.values;
      if (!values) throw new Error('Malformed Pinecone embedding response');
      return values;
    }
    // Default Gemini embedding path
    const client = getGeminiClient();
    const response = await client.models.embedContent({
      model: this.embeddingModel,
      contents: [{ role: 'user', parts: [{ text }] }],
    });
    if (!response.embeddings || response.embeddings.length === 0) throw new Error('Failed to generate embedding');
    return response.embeddings[0].values || [];
  }

  /**
   * Store form embedding in Pinecone for future retrieval
   */
  async storeFormEmbedding(
    formId: string,
    userId: string,
    summary: string,
    purpose: string,
    fieldTypes: string[]
  ): Promise<void> {
    try {
      const embedding = await this.generateEmbedding(summary);
      const index = await getPineconeIndex();

      await index.upsert([
        {
          id: formId,
          values: embedding,
          metadata: {
            userId,
            purpose,
            fieldTypes: fieldTypes.join(','),
            summary: summary.substring(0, 500), // Limit metadata size
          },
        },
      ]);

      console.log(`✅ Stored embedding for form ${formId}`);
    } catch (error) {
      console.error('Error storing form embedding:', error);
      // Don't throw - embedding storage failure shouldn't break form creation
    }
  }

  /**
   * Retrieve relevant past forms using semantic search
   * 
   * This is the core of the context-aware memory system:
   * 1. Convert the prompt to an embedding
   * 2. Query Pinecone for similar forms (filtered by userId)
   * 3. Return only the top-K most relevant form patterns
   */
  async retrieveRelevantForms(
    userId: string,
    prompt: string
  ): Promise<FormContext[]> {
    try {
      const cacheKey = `${userId}::${prompt.trim().toLowerCase()}`;
      const now = Date.now();
      const cached = this.cache.get(cacheKey);
      if (cached && (now - cached.ts) < this.cacheTTL) {
        return cached.results;
      }
      const queryEmbedding = await this.generateEmbedding(prompt);
      const index = await getPineconeIndex();

      // Query Pinecone with user filter
      const results = await index.query({
        vector: queryEmbedding,
        topK: this.topK,
        filter: { userId: { $eq: userId } },
        includeMetadata: true,
      });

      if (!results.matches || results.matches.length === 0) {
        const empty: FormContext[] = [];
        this.cache.set(cacheKey, { ts: now, results: empty });
        return empty;
      }

      // Extract form IDs and fetch full form data
      const formIds = results.matches
        .filter(match => match.score && match.score > 0.5) // Only relevant matches
        .map(match => match.id);

      if (formIds.length === 0) {
        const empty: FormContext[] = [];
        this.cache.set(cacheKey, { ts: now, results: empty });
        return empty;
      }

      // Fetch forms from MongoDB
      const forms = await Form.find({ _id: { $in: formIds } })
        .select('title summary purpose formSchema.fields')
        .lean();

      // Transform to context format
      const ctx = forms.map((form) => ({
        purpose: form.purpose,
        fields: form.formSchema.fields.map((f: { name: string }) => f.name),
        title: form.title,
        summary: form.summary,
      }));
      this.cache.set(cacheKey, { ts: now, results: ctx });
      return ctx;
    } catch (error) {
      console.error('Error retrieving relevant forms:', error);
      return [];
    }
  }

  /**
   * Fallback: Text-based search when Pinecone is unavailable
   */
  async fallbackTextSearch(
    userId: string,
    prompt: string
  ): Promise<FormContext[]> {
    const keywords = prompt.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    
    const forms = await Form.find({
      userId,
      $text: { $search: keywords.join(' ') },
    })
      .select('title summary purpose formSchema.fields')
      .limit(this.topK)
      .lean();

    return forms.map((form) => ({
      purpose: form.purpose,
      fields: form.formSchema.fields.map((f: { name: string }) => f.name),
      title: form.title,
      summary: form.summary,
    }));
  }
}

/**
 * AI Form Generator Service
 * 
 * Handles the generation of form schemas from natural language prompts.
 * Uses semantic memory retrieval to provide context-aware suggestions.
 */
export class FormGeneratorService {
  private memoryService: SemanticMemoryService;
  private model = process.env.GEMINI_GENERATION_MODEL || 'gemini-2.0-flash';

  constructor() {
    this.memoryService = new SemanticMemoryService();
  }

  /**
   * Generate a form schema from a natural language prompt
   * 
   * Process:
   * 1. Retrieve relevant past forms using semantic search
   * 2. Construct a context-aware prompt for the LLM
   * 3. Generate the form schema
   * 4. Parse and validate the response
   */
  async generateForm(userId: string, prompt: string): Promise<GeneratedForm> {
    // Step 1: Retrieve relevant context (max 5 past forms)
    let relevantForms: FormContext[] = [];
    
    try {
      relevantForms = await this.memoryService.retrieveRelevantForms(userId, prompt);
    } catch {
      // Fallback to text search if semantic search fails
      relevantForms = await this.memoryService.fallbackTextSearch(userId, prompt);
    }

    // Step 2: Build the context-aware prompt
    const systemPrompt = this.buildSystemPrompt(relevantForms);
    
    // Step 3: Generate form using Gemini
    const client = getGeminiClient();
    
    const response = await client.models.generateContent({
      model: this.model,
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Request: "${prompt}"` }] }
      ],
      config: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    const responseText = response.text || '';
    
    // Step 4: Parse the JSON response
    const formData = this.parseFormResponse(responseText, prompt);
    
    return formData;
  }

  /**
   * Build the system prompt with relevant context
   * 
   * This dynamically constructs the prompt based on retrieved forms.
   * Only relevant forms are included to stay within token limits.
   */
  private buildSystemPrompt(relevantForms: FormContext[]): string {
    let contextSection = '';
    
    if (relevantForms.length > 0) {
      const formattedForms = relevantForms.map(form => 
        JSON.stringify({
          purpose: form.purpose,
          fields: form.fields,
        })
      ).join(',\n  ');
      
      contextSection = `
Here is relevant user form history for reference:
[
  ${formattedForms}
]

Use these patterns to inform field ordering, naming conventions, and validation logic where applicable.
`;
    }

    return `You are an intelligent form schema generator. Your task is to convert natural language descriptions into structured JSON form schemas.
${contextSection}
IMPORTANT: Respond ONLY with valid JSON. No markdown, no explanation, just the JSON object.

The JSON schema must follow this exact structure:
{
  "schema": {
    "title": "Form Title",
    "description": "Form description",
    "fields": [
      {
        "id": "unique-field-id",
        "name": "fieldName",
        "label": "Field Label",
        "type": "text|email|number|textarea|select|checkbox|radio|date|file|image|url|phone",
        "placeholder": "Optional placeholder text",
        "required": true|false,
        "validation": {
          "min": null,
          "max": null,
          "minLength": null,
          "maxLength": null,
          "pattern": null,
          "message": "Custom error message"
        },
        "options": [{"label": "Option", "value": "option"}],
        "accept": "image/*"
      }
    ]
  },
  "summary": "A brief 1-2 sentence summary of this form's purpose",
  "purpose": "category like: job-application, survey, registration, feedback, medical, education, event, contact, order, other"
}

Field type guidelines:
- Use "email" for email addresses
- Use "phone" for phone numbers
- Use "url" for URLs, links, GitHub profiles, portfolios
- Use "image" for profile pictures, photos (set accept: "image/*")
- Use "file" for documents like resumes (set accept: "application/pdf,.doc,.docx")
- Use "select" or "radio" when there are predefined options
- Use "checkbox" for boolean yes/no or multi-select
- Use "textarea" for long text like descriptions, bio
- Use "date" for dates

Always include appropriate validation for required fields.
Generate unique IDs using short descriptive names (e.g., "field-name", "field-email").`;
  }

  /**
   * Parse and validate the LLM response
   */
  private parseFormResponse(responseText: string, originalPrompt: string): GeneratedForm {
    // Try to extract JSON from the response
    let jsonStr = responseText;
    
    // Remove markdown code blocks if present
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    // Clean up the string
    jsonStr = jsonStr.trim();
    
    try {
      const parsed = JSON.parse(jsonStr);
      
      // Validate required fields
      if (!parsed.schema || !parsed.schema.fields || !Array.isArray(parsed.schema.fields)) {
        throw new Error('Invalid schema structure');
      }

      // Ensure all fields have IDs
      parsed.schema.fields = parsed.schema.fields.map((field: Record<string, unknown>, index: number) => ({
        ...field,
        id: field.id || `field-${index}-${uuidv4().slice(0, 8)}`,
      }));

      // Extract field types
      const fieldTypes = [...new Set(parsed.schema.fields.map((f: { type: string }) => f.type))] as string[];

      return {
        schema: parsed.schema,
        summary: parsed.summary || `Form generated from: ${originalPrompt.substring(0, 100)}`,
        purpose: parsed.purpose || 'other',
        fieldTypes,
      };
    } catch (error) {
      console.error('Failed to parse form response:', error);
      console.error('Response text:', responseText);
      
      // Return a basic fallback form
      return this.createFallbackForm(originalPrompt);
    }
  }

  /**
   * Create a fallback form when parsing fails
   */
  private createFallbackForm(prompt: string): GeneratedForm {
    return {
      schema: {
        title: 'Generated Form',
        description: prompt,
        fields: [
          {
            id: 'field-name',
            name: 'name',
            label: 'Name',
            type: 'text',
            placeholder: 'Enter your name',
            required: true,
          },
          {
            id: 'field-email',
            name: 'email',
            label: 'Email',
            type: 'email',
            placeholder: 'Enter your email',
            required: true,
          },
        ],
      },
      summary: `Fallback form for: ${prompt.substring(0, 100)}`,
      purpose: 'other',
      fieldTypes: ['text', 'email'],
    };
  }

  /**
   * Store form embedding after successful creation
   */
  async storeFormEmbedding(form: IForm): Promise<void> {
    await this.memoryService.storeFormEmbedding(
      form._id.toString(),
      form.userId.toString(),
      form.summary,
      form.purpose,
      form.fieldTypes
    );
  }
}

export const formGeneratorService = new FormGeneratorService();
export const semanticMemoryService = new SemanticMemoryService();
