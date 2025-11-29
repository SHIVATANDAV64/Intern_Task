'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { EmailNotification } from '@/types';

interface EmailSettingsProps {
  formId: string;
  emailNotifications?: EmailNotification;
  onUpdate: () => void;
}

export function EmailSettings({ formId, emailNotifications, onUpdate }: EmailSettingsProps) {
  const [enabled, setEnabled] = useState(emailNotifications?.enabled || false);
  const [recipients, setRecipients] = useState<string[]>(emailNotifications?.recipients || []);
  const [newRecipient, setNewRecipient] = useState('');
  const [subject, setSubject] = useState(emailNotifications?.subject || '');
  const [includeResponses, setIncludeResponses] = useState(emailNotifications?.includeResponses ?? true);
  const [saving, setSaving] = useState(false);

  const addRecipient = () => {
    if (!newRecipient) return;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newRecipient)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (recipients.includes(newRecipient)) {
      toast.error('This email is already in the list');
      return;
    }

    setRecipients([...recipients, newRecipient]);
    setNewRecipient('');
  };

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/forms/${formId}`, {
        emailNotifications: {
          enabled,
          recipients,
          subject: subject || 'New form submission',
          includeResponses,
        },
      });
      toast.success('Email settings saved!');
      onUpdate();
    } catch {
      toast.error('Failed to save email settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Notifications
        </CardTitle>
        <CardDescription>
          Receive email alerts when someone submits your form
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="email-enabled"
            checked={enabled}
            onCheckedChange={(checked) => setEnabled(checked as boolean)}
          />
          <label htmlFor="email-enabled" className="text-sm font-medium">
            Enable email notifications
          </label>
        </div>

        {enabled && (
          <>
            <div>
              <Label htmlFor="email-recipients">Recipients</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="email-recipients"
                  type="email"
                  placeholder="email@example.com"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
                />
                <Button onClick={addRecipient} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {recipients.map((email) => (
                  <Badge key={email} variant="secondary" className="cursor-pointer">
                    {email}
                    <button
                      onClick={() => removeRecipient(email)}
                      className="ml-2 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                {recipients.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Add at least one email recipient
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email-subject">Email Subject</Label>
              <Input
                id="email-subject"
                placeholder="New submission for your form"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-responses"
                checked={includeResponses}
                onCheckedChange={(checked) => setIncludeResponses(checked as boolean)}
              />
              <label htmlFor="include-responses" className="text-sm">
                Include submission data in email
              </label>
            </div>
          </>
        )}

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? 'Saving...' : 'Save Email Settings'}
        </Button>
      </CardContent>
    </Card>
  );
}
