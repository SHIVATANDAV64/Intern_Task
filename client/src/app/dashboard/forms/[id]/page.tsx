'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Copy, ExternalLink, Users, FileText, Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { formsApi } from '@/lib/api';
import { Form, Submission } from '@/types';

export default function FormDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [form, setForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await formsApi.getById(id);
        setForm(response.form);
      } catch {
        toast.error('Failed to load form');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchSubmissions = async () => {
      try {
        const response = await formsApi.getSubmissions(id);
        setSubmissions(response.submissions);
      } catch {
        // Silently fail for submissions
      } finally {
        setSubmissionsLoading(false);
      }
    };

    fetchForm();
    fetchSubmissions();
  }, [id]);

  const copyShareLink = () => {
    const link = `${window.location.origin}/form/${id}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  const exportSubmissions = () => {
    if (submissions.length === 0) {
      toast.error('No submissions to export');
      return;
    }

    // Create CSV content
    const headers = Object.keys(submissions[0].responses);
    const csvContent = [
      headers.join(','),
      ...submissions.map((sub) =>
        headers.map((h) => `"${String(sub.responses[h] || '').replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form?.title || 'form'}-submissions.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Submissions exported!');
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold">Form not found</h2>
        <p className="text-muted-foreground mt-2">
          This form may have been deleted or you don&apos;t have access.
        </p>
        <Link href="/dashboard/forms" className="mt-4 inline-block">
          <Button>Back to Forms</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/forms">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{form.schema.title}</h1>
            {form.schema.description && (
              <p className="text-muted-foreground mt-1">{form.schema.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={copyShareLink}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Link
          </Button>
          <Link href={`/form/${id}`} target="_blank">
            <Button variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Preview
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{form.submissionCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Form Fields</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{form.schema.fields.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={form.isPublic ? 'default' : 'secondary'}>
              {form.isPublic ? 'Public' : 'Private'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="submissions">
        <TabsList>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="schema">Form Schema</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Submissions</h2>
            <Button variant="outline" onClick={exportSubmissions} disabled={submissions.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {submissionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="py-4">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : submissions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Users className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No submissions yet</h3>
                <p className="text-muted-foreground text-center max-w-sm mt-2">
                  Share your form link to start collecting responses
                </p>
                <Button onClick={copyShareLink} className="mt-4">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Share Link
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission, index) => (
                <Card key={submission.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        Submission #{submissions.length - index}
                      </CardTitle>
                      <span className="text-sm text-muted-foreground">
                        {new Date(submission.submittedAt).toLocaleString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {form.schema.fields.map((field) => (
                        <div key={field.id} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                          <span className="text-sm font-medium min-w-[150px]">
                            {field.label}:
                          </span>
                          <span className="text-sm text-muted-foreground flex-1">
                            {field.type === 'image' || field.type === 'file' ? (
                              submission.imageUrls[field.id] ? (
                                <a
                                  href={submission.imageUrls[field.id]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  View File
                                </a>
                              ) : (
                                'No file uploaded'
                              )
                            ) : (
                              String(submission.responses[field.name] || '-')
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="schema">
          <Card>
            <CardHeader>
              <CardTitle>Form Schema</CardTitle>
              <CardDescription>
                The JSON schema that defines this form&apos;s structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {form.schema.fields.map((field, index) => (
                  <div key={field.id}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{field.type}</Badge>
                      <span className="font-medium">{field.label}</span>
                      {field.required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Field name: {field.name}
                      {field.placeholder && ` • Placeholder: ${field.placeholder}`}
                    </p>
                    {index < form.schema.fields.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
