import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, QrCode, Users } from 'lucide-react';
import { getBarUrl } from '@/utils/getBaseUrl';

interface Bar {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  description: string | null;
  address: string | null;
}

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
}

interface BarManager {
  id: string;
  user_id: string;
  bar_id: string;
  profiles?: Profile;
}

export default function AdminBars() {
  const [bars, setBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [managerDialogOpen, setManagerDialogOpen] = useState(false);
  const [selectedBar, setSelectedBar] = useState<Bar | null>(null);
  const [barManagers, setBarManagers] = useState<BarManager[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [editingBar, setEditingBar] = useState<Bar | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    address: '',
    logo_url: '',
    primary_color: '#8B5CF6',
    secondary_color: '#D946EF',
  });

  useEffect(() => {
    fetchBars();
    fetchProfiles();
  }, []);

  const fetchBars = async () => {
    const { data, error } = await supabase.from('bars').select('*').order('name');
    if (error) {
      toast.error('Failed to load bars');
    } else {
      setBars(data || []);
    }
    setLoading(false);
  };

  const fetchProfiles = async () => {
    const { data, error } = await supabase.from('profiles').select('id, email, full_name');
    if (!error && data) {
      setProfiles(data);
    }
  };

  const fetchBarManagers = async (barId: string) => {
    const { data, error } = await supabase
      .from('bar_managers')
      .select('id, user_id, bar_id, profiles:user_id(id, email, full_name)')
      .eq('bar_id', barId);
    
    if (error) {
      toast.error('Failed to load bar managers');
    } else {
      setBarManagers((data as unknown as BarManager[]) || []);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const slug = formData.slug || generateSlug(formData.name);
    const dataToSave = {
      name: formData.name,
      slug,
      description: formData.description || null,
      address: formData.address || null,
      logo_url: formData.logo_url || null,
      primary_color: formData.primary_color,
      secondary_color: formData.secondary_color,
    };
    
    if (editingBar) {
      const { error } = await supabase
        .from('bars')
        .update(dataToSave)
        .eq('id', editingBar.id);
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Bar updated successfully');
        setDialogOpen(false);
        fetchBars();
      }
    } else {
      const { error } = await supabase
        .from('bars')
        .insert([dataToSave]);
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Bar created successfully');
        setDialogOpen(false);
        fetchBars();
      }
    }
  };

  const handleEdit = (bar: Bar) => {
    setEditingBar(bar);
    setFormData({
      name: bar.name,
      slug: bar.slug,
      description: bar.description || '',
      address: bar.address || '',
      logo_url: bar.logo_url || '',
      primary_color: bar.primary_color || '#8B5CF6',
      secondary_color: bar.secondary_color || '#D946EF',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bar?')) return;
    
    const { error } = await supabase.from('bars').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Bar deleted');
      fetchBars();
    }
  };

  const openNewDialog = () => {
    setEditingBar(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      address: '',
      logo_url: '',
      primary_color: '#8B5CF6',
      secondary_color: '#D946EF',
    });
    setDialogOpen(true);
  };

  const openManagerDialog = async (bar: Bar) => {
    setSelectedBar(bar);
    await fetchBarManagers(bar.id);
    setSelectedUserId('');
    setManagerDialogOpen(true);
  };

  const handleAddManager = async () => {
    if (!selectedBar || !selectedUserId) {
      toast.error('Please select a user');
      return;
    }

    // Check if already a manager
    const existing = barManagers.find(m => m.user_id === selectedUserId);
    if (existing) {
      toast.error('User is already a manager for this bar');
      return;
    }

    // Add bar_manager role if not exists
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({ user_id: selectedUserId, role: 'bar_manager' }, { onConflict: 'user_id,role' });

    if (roleError && !roleError.message.includes('duplicate')) {
      console.error('Role error:', roleError);
    }

    // Add to bar_managers
    const { error } = await supabase.from('bar_managers').insert({
      user_id: selectedUserId,
      bar_id: selectedBar.id,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Manager added successfully');
      setSelectedUserId('');
      fetchBarManagers(selectedBar.id);
    }
  };

  const handleRemoveManager = async (managerId: string) => {
    if (!confirm('Remove this manager?')) return;

    const { error } = await supabase.from('bar_managers').delete().eq('id', managerId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Manager removed');
      if (selectedBar) {
        fetchBarManagers(selectedBar.id);
      }
    }
  };

  const getQRCodeUrl = (slug: string) => {
    const barUrl = getBarUrl(slug);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(barUrl)}`;
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-heading font-bold">Bars</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Bar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingBar ? 'Edit Bar' : 'Add New Bar'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Bar Logo</Label>
                  <ImageUpload
                    bucket="bar-assets"
                    folder={editingBar?.id || 'new'}
                    currentUrl={formData.logo_url}
                    onUpload={(url) => setFormData({ ...formData, logo_url: url })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Bar Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder={generateSlug(formData.name) || 'auto-generated'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Primary Color</Label>
                    <Input
                      id="primary_color"
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary_color">Secondary Color</Label>
                    <Input
                      id="secondary_color"
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  {editingBar ? 'Update Bar' : 'Create Bar'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="glass">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>QR Code</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : bars.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No bars yet. Create your first bar!
                    </TableCell>
                  </TableRow>
                ) : (
                  bars.map((bar) => (
                    <TableRow key={bar.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {bar.logo_url ? (
                            <img src={bar.logo_url} alt={bar.name} className="w-8 h-8 rounded object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                              {bar.name.charAt(0)}
                            </div>
                          )}
                          {bar.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{bar.slug}</TableCell>
                      <TableCell className="text-muted-foreground">{bar.address || '-'}</TableCell>
                      <TableCell>
                        <a 
                          href={getQRCodeUrl(bar.slug)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          <QrCode className="h-4 w-4" />
                          View
                        </a>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openManagerDialog(bar)} title="Manage bar managers">
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(bar)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(bar.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Manager Dialog */}
        <Dialog open={managerDialogOpen} onOpenChange={setManagerDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Manage Bar Managers - {selectedBar?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Add Manager */}
              <div className="flex gap-2">
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a user to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles
                      .filter(p => !barManagers.find(m => m.user_id === p.id))
                      .map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.full_name || profile.email}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddManager}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>

              {/* Current Managers */}
              <div className="space-y-2">
                <Label>Current Managers</Label>
                {barManagers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No managers assigned yet</p>
                ) : (
                  <div className="space-y-2">
                    {barManagers.map((manager) => (
                      <div key={manager.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium">{manager.profiles?.full_name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{manager.profiles?.email}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveManager(manager.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
