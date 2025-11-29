'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { Sparkles, Loader2, Check, Upload, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formsApi, submissionsApi } from '@/lib/api';
import { Form, FormField } from '@/types';

export default function PublicFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [form, setForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { file: File; preview?: string }>>({});

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm();

  const watchedValues = watch();
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set());
  const [requiredFields, setRequiredFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!form) return;

    const allFieldIds = new Set(form.schema.fields.map(f => f.id));
    const newVisible = new Set(allFieldIds);
    const newRequired = new Set(form.schema.fields.filter(f => f.required).map(f => f.id));

    if (form.conditionalRules) {
      form.conditionalRules.forEach(rule => {
        const triggerField = form.schema.fields.find(f => f.id === rule.fieldId);
        if (!triggerField) return;

        const triggerValue = watchedValues[triggerField.name];
        let conditionMet = false;

        switch (rule.condition) {
          case 'equals':
            conditionMet = String(triggerValue) === String(rule.value);
            break;
          case 'notEquals':
            conditionMet = String(triggerValue) !== String(rule.value);
            break;
          case 'contains':
            conditionMet = String(triggerValue).includes(String(rule.value));
            break;
          case 'greaterThan':
            conditionMet = Number(triggerValue) > Number(rule.value);
            break;
          case 'lessThan':
            conditionMet = Number(triggerValue) < Number(rule.value);
            break;
        }

        if (conditionMet) {
          rule.targetFieldIds.forEach(targetId => {
            if (rule.action === 'show') {
              // Logic: If action is show, we assume fields are hidden by default if a rule targets them? 
              // Or simpler: If condition met, ensure it's visible.
              // But usually "Show" implies "Hide otherwise".
              // For simplicity in this implementation:
              // We start with all visible. If a rule says "Show X", it implies X might be hidden.
              // Let's stick to a simpler interpretation:
              // If action is HIDE, we remove from visible.
              // If action is SHOW, we add to visible (if it was removed).
            } else if (rule.action === 'hide') {
              newVisible.delete(targetId);
            } else if (rule.action === 'require') {
              newRequired.add(targetId);
            } else if (rule.action === 'unrequire') {
              newRequired.delete(targetId);
            }
          });
        } else {
           // If condition NOT met, and rule was "Show", maybe we should hide?
           // This simple engine might need more robust logic (like the backend one), 
           // but for now let's implement the direct actions.
           if (rule.action === 'show') {
             rule.targetFieldIds.forEach(id => newVisible.delete(id));
           }
        }
      });
    }

    setVisibleFields(newVisible);
    setRequiredFields(newRequired);
  }, [form, watchedValues]);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await formsApi.getById(id);
        setForm(response.form);
      } catch {
        toast.error('Form not found');
      } finally {
        setIsLoading(false);
      }
    };

    fetchForm();
  }, [id]);

  const handleFileChange = (fieldId: string, file: File | null) => {
    if (file) {
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
      setUploadedFiles((prev) => ({
        ...prev,
        [fieldId]: { file, preview },
      }));
    } else {
      setUploadedFiles((prev) => {
        const newFiles = { ...prev };
        if (newFiles[fieldId]?.preview) {
          URL.revokeObjectURL(newFiles[fieldId].preview!);
        }
        delete newFiles[fieldId];
        return newFiles;
      });
    }
  };

  const onSubmit = async (data: Record<string, unknown>) => {
    // Validate required file/image fields
    if (form) {
      for (const field of form.schema.fields) {
        if ((field.type === 'file' || field.type === 'image') && field.required) {
          if (!uploadedFiles[field.id]) {
            toast.error(`${field.label} is required`);
            return;
          }
        }
      }
    }

    setIsSubmitting(true);
    try {
      // Create FormData for submission
      const formData = new FormData();
      
      // Add file field IDs to responses so server knows which fields have files
      const responsesWithFileInfo = { ...data };
      const fileFieldMapping: Record<string, string> = {};
      
      // Add files and track their field IDs
      for (const [fieldId, { file }] of Object.entries(uploadedFiles)) {
        // Create a unique filename that includes the fieldId
        const uniqueFilename = `${fieldId}___${file.name}`;
        formData.append('files', file, uniqueFilename);
        fileFieldMapping[fieldId] = uniqueFilename;
      }
      
      // Include file field mapping in responses
      formData.append('responses', JSON.stringify(responsesWithFileInfo));
      formData.append('fileFieldMapping', JSON.stringify(fileFieldMapping));

      await submissionsApi.submit(id, formData);
      setIsSubmitted(true);
      toast.success('Form submitted successfully!');
    } catch {
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const fieldError = errors[field.name];

    // For file/image fields, don't use register since they're handled separately
    const isFileField = field.type === 'file' || field.type === 'image';
    
    const commonProps = {
      id: field.id,
      placeholder: field.placeholder,
      ...(isFileField ? {} : register(field.name, {
        required: field.required ? `${field.label} is required` : false,
        ...(field.validation?.minLength && {
          minLength: {
            value: field.validation.minLength,
            message: field.validation.message || `Minimum ${field.validation.minLength} characters`,
          },
        }),
        ...(field.validation?.maxLength && {
          maxLength: {
            value: field.validation.maxLength,
            message: field.validation.message || `Maximum ${field.validation.maxLength} characters`,
          },
        }),
        ...(field.validation?.pattern && {
          pattern: {
            value: new RegExp(field.validation.pattern),
            message: field.validation.message || 'Invalid format',
          },
        }),
        ...(field.type === 'email' && {
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
          },
        }),
        ...(field.type === 'url' && {
          pattern: {
            value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
            message: 'Invalid URL',
          },
        }),
      })),
    };

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            rows={4}
            className={fieldError ? 'border-destructive' : ''}
          />
        );

      case 'select':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{ required: field.required ? `${field.label} is required` : false }}
            render={({ field: controllerField }) => (
              <Select onValueChange={controllerField.onChange} value={controllerField.value}>
                <SelectTrigger className={fieldError ? 'border-destructive' : ''}>
                  <SelectValue placeholder={field.placeholder || 'Select an option'} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        );

      case 'checkbox':
        if (field.options && field.options.length > 1) {
          // Multiple checkboxes
          return (
            <div className="space-y-2">
              {field.options.map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`${field.id}-${option.value}`}
                    {...register(`${field.name}.${option.value}`)}
                  />
                  <Label htmlFor={`${field.id}-${option.value}`} className="font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          );
        }
        // Single checkbox
        return (
          <div className="flex items-center gap-2">
            <Controller
              name={field.name}
              control={control}
              render={({ field: controllerField }) => (
                <Checkbox
                  id={field.id}
                  checked={controllerField.value}
                  onCheckedChange={controllerField.onChange}
                />
              )}
            />
            <Label htmlFor={field.id} className="font-normal">
              {field.placeholder || 'Yes'}
            </Label>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  id={`${field.id}-${option.value}`}
                  value={option.value}
                  {...register(field.name, {
                    required: field.required ? `${field.label} is required` : false,
                  })}
                  className="h-4 w-4"
                />
                <Label htmlFor={`${field.id}-${option.value}`} className="font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'image':
      case 'file':
        const uploadedFile = uploadedFiles[field.id];
        return (
          <div className="space-y-2">
            {uploadedFile ? (
              <div className="flex items-center gap-4 p-3 rounded-lg border bg-muted/50">
                {uploadedFile.preview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={uploadedFile.preview}
                    alt="Preview"
                    className="h-16 w-16 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{uploadedFile.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(uploadedFile.file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleFileChange(field.id, null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label
                htmlFor={field.id}
                className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  Click to upload {field.type === 'image' ? 'image' : 'file'}
                </span>
                <input
                  id={field.id}
                  type="file"
                  accept={field.accept || (field.type === 'image' ? 'image/*' : '*')}
                  className="hidden"
                  onChange={(e) => handleFileChange(field.id, e.target.files?.[0] || null)}
                />
              </label>
            )}
          </div>
        );

      case 'date':
        return (
          <Input
            {...commonProps}
            type="date"
            className={fieldError ? 'border-destructive' : ''}
          />
        );

      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
            min={field.validation?.min}
            max={field.validation?.max}
            className={fieldError ? 'border-destructive' : ''}
          />
        );

      case 'email':
        return (
          <Input
            {...commonProps}
            type="email"
            className={fieldError ? 'border-destructive' : ''}
          />
        );

      case 'phone':
        return (
          <Input
            {...commonProps}
            type="tel"
            className={fieldError ? 'border-destructive' : ''}
          />
        );

      case 'url':
        return (
          <Input
            {...commonProps}
            type="url"
            className={fieldError ? 'border-destructive' : ''}
          />
        );

      default:
        return (
          <Input
            {...commonProps}
            type="text"
            className={fieldError ? 'border-destructive' : ''}
          />
        );
    }

    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Form Not Found</CardTitle>
            <CardDescription>
              This form may have been deleted or is no longer available.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button>Go to Homepage</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundColor: form?.theme?.secondaryColor || 'hsl(var(--muted))',
          fontFamily: form?.theme?.fontFamily === 'serif' ? 'serif' : 
                     form?.theme?.fontFamily === 'mono' ? 'monospace' : 
                     form?.theme?.fontFamily === 'comic' ? '"Comic Sans MS", cursive, sans-serif' : 
                     'inherit'
        }}
      >
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div 
              className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: `${form?.theme?.primaryColor || '#10b981'}20` }}
            >
              <Check 
                className="h-8 w-8" 
                style={{ color: form?.theme?.primaryColor || '#10b981' }}
              />
            </div>
            <CardTitle>Thank You!</CardTitle>
            <CardDescription>
              Your response has been submitted successfully.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button variant="outline">Go to Homepage</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen py-8 px-4 transition-colors duration-300"
      style={{
        backgroundColor: form.theme?.secondaryColor || 'hsl(var(--muted))',
        fontFamily: form.theme?.fontFamily === 'serif' ? 'serif' : 
                   form.theme?.fontFamily === 'mono' ? 'monospace' : 
                   form.theme?.fontFamily === 'comic' ? '"Comic Sans MS", cursive, sans-serif' : 
                   'inherit'
      }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            {form.theme?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.theme.logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
            ) : (
              <>
                <Sparkles className="h-5 w-5" style={{ color: form.theme?.primaryColor }} />
                <span className="font-medium">FormGen AI</span>
              </>
            )}
          </Link>
        </div>

        {/* Form Card */}
        <Card className="border-t-4" style={{ borderTopColor: form.theme?.primaryColor || 'hsl(var(--primary))' }}>
          <CardHeader>
            <CardTitle className="text-2xl">{form.schema.title}</CardTitle>
            {form.schema.description && (
              <CardDescription>{form.schema.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {form.schema.fields.map((field) => {
                if (!visibleFields.has(field.id)) return null;
                const isRequired = requiredFields.has(field.id);
                
                return (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>
                    {field.label}
                    {isRequired && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {renderField({ ...field, required: isRequired })}
                  {errors[field.name] && (
                    <p className="text-sm text-destructive">
                      {errors[field.name]?.message as string}
                    </p>
                  )}
                </div>
              )})}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
                style={{ 
                  backgroundColor: form.theme?.primaryColor,
                  color: form.theme?.primaryColor ? '#ffffff' : undefined
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Powered by{' '}
          <Link 
            href="/" 
            className="hover:underline"
            style={{ color: form.theme?.primaryColor || 'hsl(var(--primary))' }}
          >
            FormGen AI
          </Link>
        </p>
      </div>
    </div>
  );
}
