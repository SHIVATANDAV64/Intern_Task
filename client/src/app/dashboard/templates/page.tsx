'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Form } from '@/types';

interface TemplatesResponse {
  templates: Form[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [using, setUsing] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: 'job-application', label: 'Job Application' },
    { id: 'survey', label: 'Survey' },
    { id: 'registration', label: 'Registration' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'contact', label: 'Contact' },
  ];

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedCategory]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(selectedCategory && { category: selectedCategory }),
      });
      
      const response = await api.get<TemplatesResponse>(
        `/forms/templates/list?${query.toString()}`
      );
      setTemplates(response.data.templates);
      setTotalPages(response.data.pagination.pages);
    } catch {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (templateId: string) => {
    try {
      setUsing(templateId);
      const response = await api.post<{ form: { id: string } }>(
        `/forms/${templateId}/duplicate`
      );
      toast.success('Template duplicated successfully!');
      router.push(`/dashboard/forms/${response.data.form.id}`);
    } catch {
      toast.error('Failed to use template');
      setUsing(null);
    }
  };

  const getPurposeColor = (purpose: string) => {
    const colors: Record<string, string> = {
      'job-application': 'bg-blue-100 text-blue-800',
      'survey': 'bg-green-100 text-green-800',
      'registration': 'bg-purple-100 text-purple-800',
      'feedback': 'bg-orange-100 text-orange-800',
      'contact': 'bg-pink-100 text-pink-800',
    };
    return colors[purpose] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Form Templates</h1>
        <p className="text-gray-600 mb-6">
          Start with a professionally designed template and customize it to your needs
        </p>

        <div className="flex flex-wrap gap-2">
          <Button 
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            size="sm"
            className="rounded-full"
          >
            All
          </Button>
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat.id)}
              size="sm"
              className="rounded-full"
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No templates available yet</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-xl">{template.title}</CardTitle>
                    <Badge className={getPurposeColor(template.purpose)}>
                      {template.purpose}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {template.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {template.schema.fields.slice(0, 5).map((field) => (
                        <Badge key={field.id} variant="outline" className="text-xs">
                          {field.label}
                        </Badge>
                      ))}
                      {template.schema.fields.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.schema.fields.length - 5} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{template.schema.fields.length} fields</span>
                      <span>{template.submissionCount} submissions</span>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => handleUseTemplate(template.id)}
                      disabled={using === template.id}
                    >
                      {using === template.id ? 'Using Template...' : 'Use Template'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <div className="flex items-center px-4">
                Page {page} of {totalPages}
              </div>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
