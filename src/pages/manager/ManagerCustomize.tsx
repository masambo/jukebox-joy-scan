import React, { useState } from 'react';
import { ManagerLayout } from '@/components/manager/ManagerLayout';
import { useManagerBar } from '@/hooks/useManagerBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Save, Palette } from 'lucide-react';

export default function ManagerCustomize() {
  const { bar, loading, refetch } = useManagerBar();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    primary_color: '#8B5CF6',
    secondary_color: '#D946EF',
  });

  React.useEffect(() => {
    if (bar) {
      setFormData({
        description: bar.description || '',
        primary_color: bar.primary_color || '#8B5CF6',
        secondary_color: bar.secondary_color || '#D946EF',
      });
    }
  }, [bar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bar) return;

    setSaving(true);
    const { error } = await supabase
      .from('bars')
      .update({
        description: formData.description,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
      })
      .eq('id', bar.id);

    setSaving(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Bar customization saved!');
      refetch();
    }
  };

  if (loading) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ManagerLayout>
    );
  }

  if (!bar) {
    return (
      <ManagerLayout>
        <div className="p-6">
          <Card className="glass">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                You are not assigned to any bar yet.
              </p>
            </CardContent>
          </Card>
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout barName={bar.name}>
      <div className="p-6">
        <h1 className="text-3xl font-heading font-bold mb-6">Customize Your Bar</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance Settings
              </CardTitle>
              <CardDescription>
                Customize how your bar appears to customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell customers about your bar..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary_color"
                        type="color"
                        value={formData.primary_color}
                        onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.primary_color}
                        onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary_color">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondary_color"
                        type="color"
                        value={formData.secondary_color}
                        onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.secondary_color}
                        onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                How your bar will appear to customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="rounded-lg p-6 text-center"
                style={{ 
                  background: `linear-gradient(135deg, ${formData.primary_color}20, ${formData.secondary_color}20)`,
                  borderColor: formData.primary_color,
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
              >
                <h3 
                  className="text-2xl font-heading font-bold mb-2"
                  style={{ color: formData.primary_color }}
                >
                  {bar.name}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {formData.description || 'No description yet'}
                </p>
                <div className="flex justify-center gap-2 mt-4">
                  <div 
                    className="w-8 h-8 rounded-full" 
                    style={{ backgroundColor: formData.primary_color }}
                    title="Primary Color"
                  />
                  <div 
                    className="w-8 h-8 rounded-full" 
                    style={{ backgroundColor: formData.secondary_color }}
                    title="Secondary Color"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ManagerLayout>
  );
}
