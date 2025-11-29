'use client';

import { useState } from 'react';
import { Palette, Type, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { FormTheme } from '@/types';

interface ThemeSettingsProps {
  formId: string;
  theme?: FormTheme;
  onUpdate: () => void;
}

export function ThemeSettings({ formId, theme, onUpdate }: ThemeSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [primaryColor, setPrimaryColor] = useState(theme?.primaryColor || '#000000');
  const [secondaryColor, setSecondaryColor] = useState(theme?.secondaryColor || '#ffffff');
  const [fontFamily, setFontFamily] = useState(theme?.fontFamily || 'inter');
  const [logoUrl, setLogoUrl] = useState(theme?.logoUrl || '');

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await api.put(`/forms/${formId}`, {
        theme: {
          primaryColor,
          secondaryColor,
          fontFamily,
          logoUrl,
        },
      });
      toast.success('Theme updated successfully');
      onUpdate();
    } catch {
      toast.error('Failed to update theme');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Settings
        </CardTitle>
        <CardDescription>
          Customize the look and feel of your public form.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex gap-2">
              <Input
                id="primaryColor"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="secondaryColor">Background Color</Label>
            <div className="flex gap-2">
              <Input
                id="secondaryColor"
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fontFamily" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Font Family
          </Label>
          <Select value={fontFamily} onValueChange={setFontFamily}>
            <SelectTrigger>
              <SelectValue placeholder="Select a font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inter">Inter (Default)</SelectItem>
              <SelectItem value="serif">Serif</SelectItem>
              <SelectItem value="mono">Monospace</SelectItem>
              <SelectItem value="comic">Comic Sans</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="logoUrl" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Logo URL
          </Label>
          <Input
            id="logoUrl"
            placeholder="https://example.com/logo.png"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Provide a direct link to your logo image.
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Theme'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
