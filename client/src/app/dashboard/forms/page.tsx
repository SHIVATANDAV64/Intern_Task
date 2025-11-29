'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Plus, FileText, Copy, Trash2, ExternalLink, MoreVertical } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formsApi } from '@/lib/api';
import { FormListItem } from '@/types';

export default function FormsPage() {
  const [forms, setForms] = useState<FormListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchForms = async () => {
    try {
      const response = await formsApi.getAll(1, 50);
      setForms(response.forms);
    } catch {
      toast.error('Failed to load forms');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const copyShareLink = (formId: string) => {
    const link = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  const handleDelete = async () => {
    if (!formToDelete) return;

    setIsDeleting(true);
    try {
      await formsApi.delete(formToDelete);
      setForms(forms.filter((f) => f.id !== formToDelete));
      toast.success('Form deleted successfully');
    } catch {
      toast.error('Failed to delete form');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setFormToDelete(null);
    }
  };

  const getPurposeBadgeColor = (purpose: string) => {
    const colors: Record<string, string> = {
      'job-application': 'bg-blue-500',
      survey: 'bg-green-500',
      registration: 'bg-purple-500',
      feedback: 'bg-yellow-500',
      medical: 'bg-red-500',
      education: 'bg-indigo-500',
      event: 'bg-pink-500',
      contact: 'bg-cyan-500',
      order: 'bg-orange-500',
    };
    return colors[purpose] || 'bg-gray-500';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Forms</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all your created forms
          </p>
        </div>
        <Link href="/dashboard/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Form
          </Button>
        </Link>
      </div>

      {/* Forms Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : forms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No forms yet</h3>
            <p className="text-muted-foreground text-center max-w-sm mt-2">
              Create your first AI-powered form to start collecting responses
            </p>
            <Link href="/dashboard/create" className="mt-4">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Form
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <Card key={form.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{form.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {form.description || 'No description'}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => copyShareLink(form.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/form/${form.id}`} target="_blank">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Preview
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setFormToDelete(form.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm">
                  <Badge
                    variant="secondary"
                    className={`${getPurposeBadgeColor(form.purpose)} text-white`}
                  >
                    {form.purpose.replace('-', ' ')}
                  </Badge>
                  <span className="text-muted-foreground">
                    {form.submissionCount} submissions
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Link href={`/dashboard/forms/${form.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Form</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this form? This action cannot be undone
              and all submissions will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
