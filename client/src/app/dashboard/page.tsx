'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formsApi } from '@/lib/api';
import { FormListItem } from '@/types';
import { toast } from 'sonner';
import { Plus, FileText, Users, TrendingUp, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/auth';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [forms, setForms] = useState<FormListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalForms: 0,
    totalSubmissions: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await formsApi.getAll(1, 5);
        setForms(response.forms);
        setStats({
          totalForms: response.pagination.total,
          totalSubmissions: response.forms.reduce(
            (acc: number, form: FormListItem) => acc + form.submissionCount,
            0
          ),
        });
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-2">
          Here&apos;s what&apos;s happening with your forms today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalForms}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {stats.totalForms > 0
                  ? Math.round((stats.totalSubmissions / stats.totalForms) * 100) / 100
                  : 0}
                <span className="text-sm font-normal text-muted-foreground"> avg</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
          <CardDescription>Get started with creating a new form</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/dashboard/create">
              <Button variant="outline" className="w-full h-auto py-6 flex flex-col gap-2">
                <Plus className="h-6 w-6" />
                <span>Create New Form</span>
              </Button>
            </Link>
            <Link href="/dashboard/forms">
              <Button variant="outline" className="w-full h-auto py-6 flex flex-col gap-2">
                <FileText className="h-6 w-6" />
                <span>View All Forms</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Forms */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Forms</CardTitle>
            <CardDescription>Your recently created forms</CardDescription>
          </div>
          <Link href="/dashboard/forms">
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : forms.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium">No forms yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first AI-powered form to get started
              </p>
              <Link href="/dashboard/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Form
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {forms.map((form) => (
                <div
                  key={form.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <h4 className="font-medium">{form.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {form.submissionCount} submissions • Created{' '}
                      {new Date(form.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link href={`/dashboard/forms/${form.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
