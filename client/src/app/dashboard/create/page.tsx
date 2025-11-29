'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Sparkles, Loader2, ArrowLeft, Copy, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formsApi } from '@/lib/api';
import { Form } from '@/types';

const examplePrompts = [
  "I need a signup form with name, email, age, and profile picture.",
  "Create an internship hiring form with resume upload and GitHub link.",
  "Build a customer feedback form with rating, comments, and contact info.",
  "Make a job application form with personal details, work experience, and resume upload.",
  "Design an event registration form with attendee info, dietary requirements, and t-shirt size.",
];

export default function CreateFormPage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedForm, setGeneratedForm] = useState<Form | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await formsApi.generate(prompt);
      setGeneratedForm(response.form);
      toast.success('Form generated successfully!');
    } catch {
      toast.error('Failed to generate form. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyShareLink = () => {
    if (generatedForm) {
      const link = `${window.location.origin}/form/${generatedForm.id}`;
      navigator.clipboard.writeText(link);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Create New Form
          </h1>
          <p className="text-muted-foreground mt-1">
            Describe your form in natural language and let AI do the magic
          </p>
        </div>
      </div>

      {/* Prompt Input */}
      <Card>
        <CardHeader>
          <CardTitle>Describe Your Form</CardTitle>
          <CardDescription>
            Tell us what kind of form you need. Be specific about the fields, validation, and purpose.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="e.g., I need a signup form with name, email, age, and profile picture upload..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !prompt.trim()}
            className="w-full sm:w-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Form
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Example Prompts */}
      <Card>
        <CardHeader>
          <CardTitle>Example Prompts</CardTitle>
          <CardDescription>
            Click on any example to use it as your prompt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => setPrompt(example)}
                className="text-left p-3 rounded-lg border bg-muted/50 hover:bg-muted transition-colors text-sm"
              >
                &quot;{example}&quot;
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generated Form Preview */}
      {generatedForm && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-primary">Form Generated! 🎉</CardTitle>
            <CardDescription>
              Your form has been created and is ready to share
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted">
              <h3 className="font-semibold text-lg">{generatedForm.schema.title}</h3>
              {generatedForm.schema.description && (
                <p className="text-muted-foreground mt-1">{generatedForm.schema.description}</p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                {generatedForm.schema.fields.length} fields
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={copyShareLink} variant="outline" className="gap-2">
                <Copy className="h-4 w-4" />
                Copy Share Link
              </Button>
              <Link href={`/form/${generatedForm.id}`} target="_blank">
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <ExternalLink className="h-4 w-4" />
                  Preview Form
                </Button>
              </Link>
              <Link href={`/dashboard/forms/${generatedForm.id}`}>
                <Button className="gap-2 w-full sm:w-auto">
                  View Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
