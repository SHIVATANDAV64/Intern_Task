'use client';

import { useState } from 'react';
import { GitBranch, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { ConditionalRule, FormField } from '@/types';

interface LogicSettingsProps {
  formId: string;
  fields: FormField[];
  rules?: ConditionalRule[];
  onUpdate: () => void;
}

export function LogicSettings({ formId, fields, rules = [], onUpdate }: LogicSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [localRules, setLocalRules] = useState<ConditionalRule[]>(rules);

  const addRule = () => {
    const newRule: ConditionalRule = {
      id: crypto.randomUUID(),
      fieldId: fields[0]?.id || '',
      condition: 'equals',
      value: '',
      action: 'show',
      targetFieldIds: [],
    };
    setLocalRules([...localRules, newRule]);
  };

  const removeRule = (id: string) => {
    setLocalRules(localRules.filter(r => r.id !== id));
  };

  const updateRule = (id: string, updates: Partial<ConditionalRule>) => {
    setLocalRules(localRules.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await api.put(`/forms/${formId}`, {
        conditionalRules: localRules,
      });
      toast.success('Logic rules updated successfully');
      onUpdate();
    } catch {
      toast.error('Failed to update logic rules');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Conditional Logic
        </CardTitle>
        <CardDescription>
          Create rules to show/hide fields based on user input.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {localRules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            <p>No conditional rules defined.</p>
            <Button variant="outline" onClick={addRule} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Rule
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {localRules.map((rule, index) => (
              <div key={rule.id} className="p-4 border rounded-lg space-y-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Rule #{index + 1}</h4>
                  <Button variant="ghost" size="sm" onClick={() => removeRule(rule.id)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>If Field</Label>
                    <Select 
                      value={rule.fieldId} 
                      onValueChange={(val) => updateRule(rule.id, { fieldId: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {fields.map(f => (
                          <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Condition</Label>
                    <Select 
                      value={rule.condition} 
                      onValueChange={(val: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan') => updateRule(rule.id, { condition: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="notEquals">Does not equal</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                        <SelectItem value="greaterThan">Greater than</SelectItem>
                        <SelectItem value="lessThan">Less than</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input 
                      value={String(rule.value)} 
                      onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                      placeholder="Value to match"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Then Action</Label>
                    <Select 
                      value={rule.action} 
                      onValueChange={(val: 'show' | 'hide' | 'require' | 'unrequire') => updateRule(rule.id, { action: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="show">Show Fields</SelectItem>
                        <SelectItem value="hide">Hide Fields</SelectItem>
                        <SelectItem value="require">Make Required</SelectItem>
                        <SelectItem value="unrequire">Make Optional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Target Fields</Label>
                    <div className="border rounded-md p-2 max-h-32 overflow-y-auto space-y-2 bg-background">
                      {fields.map(f => (
                        <div key={f.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`${rule.id}-${f.id}`}
                            checked={rule.targetFieldIds.includes(f.id)}
                            onCheckedChange={(checked) => {
                              const newTargets = checked 
                                ? [...rule.targetFieldIds, f.id]
                                : rule.targetFieldIds.filter(id => id !== f.id);
                              updateRule(rule.id, { targetFieldIds: newTargets });
                            }}
                          />
                          <label 
                            htmlFor={`${rule.id}-${f.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {f.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <Button variant="outline" onClick={addRule}>
                <Plus className="mr-2 h-4 w-4" />
                Add Another Rule
              </Button>
              <Button onClick={handleSave} disabled={isLoading} className="ml-auto">
                {isLoading ? 'Saving...' : 'Save Logic'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
