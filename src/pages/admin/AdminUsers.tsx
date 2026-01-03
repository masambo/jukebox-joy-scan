import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Loader2 } from 'lucide-react';

interface Bar {
  id: string;
  name: string;
}

interface UserWithRole {
  user_id: string;
  role: string;
  profiles: {
    email: string;
    full_name: string | null;
  } | null;
  bar_assignments?: string[];
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [bars, setBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    barId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [usersRes, barsRes, barManagersRes, profilesRes] = await Promise.all([
      supabase.from('user_roles').select('user_id, role'),
      supabase.from('bars').select('id, name').order('name'),
      supabase.from('bar_managers').select('user_id, bar_id, bars(name)'),
      supabase.from('profiles').select('id, email, full_name'),
    ]);

    if (usersRes.error) toast.error('Failed to load users');
    else {
      const profilesMap = new Map((profilesRes.data || []).map(p => [p.id, p]));
      const usersWithBars = (usersRes.data || []).map((user) => {
        const profile = profilesMap.get(user.user_id);
        const assignments = (barManagersRes.data || [])
          .filter((bm) => bm.user_id === user.user_id)
          .map((bm) => (bm.bars as any)?.name)
          .filter(Boolean);
        return { 
          ...user, 
          bar_assignments: assignments,
          profiles: profile ? { email: profile.email, full_name: profile.full_name } : null
        };
      });
      setUsers(usersWithBars);
    }

    if (barsRes.error) toast.error('Failed to load bars');
    else setBars(barsRes.data || []);

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Email and password are required');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setCreating(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('create-bar-manager', {
        body: {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          barId: formData.barId || null,
        },
      });

      if (response.error) {
        toast.error(response.error.message || 'Failed to create user');
      } else if (response.data.error) {
        toast.error(response.data.error);
      } else {
        toast.success('Bar manager created successfully');
        setDialogOpen(false);
        setFormData({ email: '', password: '', fullName: '', barId: '' });
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to create user');
    }

    setCreating(false);
  };

  const openNewDialog = () => {
    setFormData({ email: '', password: '', fullName: '', barId: '' });
    setDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold">Users</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Bar Manager
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md w-[95vw] sm:w-full">
              <DialogHeader>
                <DialogTitle>Create Bar Manager Account</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Assign to Bar (Optional)</Label>
                  <Select
                    value={formData.barId}
                    onValueChange={(value) => setFormData({ ...formData, barId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a bar" />
                    </SelectTrigger>
                    <SelectContent>
                      {bars.map((bar) => (
                        <SelectItem key={bar.id} value={bar.id}>
                          {bar.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={creating}>
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Account'
                  )}
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
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Assigned Bars</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No users yet. Create your first bar manager!
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell className="font-medium">{user.profiles?.email}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.profiles?.full_name || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.bar_assignments?.length ? user.bar_assignments.join(', ') : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
