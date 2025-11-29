'use client';

import { useState } from 'react';
import { Plus, Trash2, TestTube, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Webhook } from '@/types';

interface WebhookSettingsProps {
  formId: string;
  webhooks: Webhook[];
  onUpdate: () => void;
}

export function WebhookSettings({ formId, webhooks = [], onUpdate }: WebhookSettingsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    url: '',
    secret: '',
    events: ['submission.created'] as string[],
  });
  const [testing, setTesting] = useState<string | null>(null);

  const handleAddWebhook = async () => {
    if (!newWebhook.url) {
      toast.error('Please enter a webhook URL');
      return;
    }

    try {
      await api.post(`/forms/${formId}/webhooks`, newWebhook);
      toast.success('Webhook added successfully!');
      setIsAdding(false);
      setNewWebhook({ url: '', secret: '', events: ['submission.created'] });
      onUpdate();
    } catch {
      toast.error('Failed to add webhook');
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    try {
      await api.delete(`/forms/${formId}/webhooks/${webhookId}`);
      toast.success('Webhook deleted');
      onUpdate();
    } catch {
      toast.error('Failed to delete webhook');
    }
  };

  const handleTestWebhook = async (webhook: Webhook) => {
    setTesting(webhook.id);
    try {
      const response = await api.post<{ success: boolean; message: string }>(
        `/forms/${formId}/webhooks/${webhook.id}/test`
      );
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch {
      toast.error('Failed to test webhook');
    } finally {
      setTesting(null);
    }
  };

  const toggleWebhookEnabled = async (webhook: Webhook) => {
    try {
      await api.put(`/forms/${formId}/webhooks/${webhook.id}`, {
        enabled: !webhook.enabled,
      });
      toast.success(`Webhook ${webhook.enabled ? 'disabled' : 'enabled'}`);
      onUpdate();
    } catch {
      toast.error('Failed to update webhook');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Webhooks</CardTitle>
            <CardDescription>
              Receive HTTP POST requests when form events occur
            </CardDescription>
          </div>
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Webhook
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Webhook</DialogTitle>
                <DialogDescription>
                  Configure a webhook endpoint to receive form submission notifications
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://your-app.com/webhook"
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="webhook-secret">Secret (Optional)</Label>
                  <Input
                    id="webhook-secret"
                    type="password"
                    placeholder="Used for signature verification"
                    value={newWebhook.secret}
                    onChange={(e) => setNewWebhook({ ...newWebhook, secret: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Events</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="event-created"
                      checked={newWebhook.events.includes('submission.created')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewWebhook({
                            ...newWebhook,
                            events: [...newWebhook.events, 'submission.created'],
                          });
                        } else {
                          setNewWebhook({
                            ...newWebhook,
                            events: newWebhook.events.filter((e) => e !== 'submission.created'),
                          });
                        }
                      }}
                    />
                    <label htmlFor="event-created" className="text-sm">
                      Submission Created
                    </label>
                  </div>
                </div>
                <Button onClick={handleAddWebhook} className="w-full">
                  Add Webhook
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {webhooks.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No webhooks configured. Add one to get started.
          </p>
        ) : (
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <div
                key={webhook.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-sm font-mono">{webhook.url}</code>
                    <Badge variant={webhook.enabled ? 'default' : 'secondary'}>
                      {webhook.enabled ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex gap-2 text-xs text-gray-500">
                    {webhook.events.map((event) => (
                      <span key={event}>{event}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestWebhook(webhook)}
                    disabled={testing === webhook.id}
                  >
                    <TestTube className="h-4 w-4 mr-1" />
                    {testing === webhook.id ? 'Testing...' : 'Test'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleWebhookEnabled(webhook)}
                  >
                    {webhook.enabled ? (
                      <X className="h-4 w-4" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteWebhook(webhook.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
