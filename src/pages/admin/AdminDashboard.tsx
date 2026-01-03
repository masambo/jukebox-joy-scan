import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Disc3, Music2, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    bars: 0,
    albums: 0,
    songs: 0,
    managers: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [barsRes, albumsRes, songsRes, managersRes] = await Promise.all([
      supabase.from('bars').select('id', { count: 'exact', head: true }),
      supabase.from('albums').select('id', { count: 'exact', head: true }),
      supabase.from('songs').select('id', { count: 'exact', head: true }),
      supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('role', 'bar_manager'),
    ]);

    setStats({
      bars: barsRes.count || 0,
      albums: albumsRes.count || 0,
      songs: songsRes.count || 0,
      managers: managersRes.count || 0,
    });
  };

  const statCards = [
    { title: 'Total Bars', value: stats.bars, icon: Building2, color: 'text-primary' },
    { title: 'Albums', value: stats.albums, icon: Disc3, color: 'text-secondary' },
    { title: 'Songs', value: stats.songs, icon: Music2, color: 'text-accent' },
    { title: 'Bar Managers', value: stats.managers, icon: Users, color: 'text-chart-4' },
  ];

  return (
    <AdminLayout>
      <div className="p-3 sm:p-4 md:p-6">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold mb-4 sm:mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {statCards.map((stat) => (
            <Card key={stat.title} className="glass">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground text-sm">
                Use the sidebar to navigate to different sections:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li><strong>Bars</strong> - Add and manage bar locations</li>
                <li><strong>Albums</strong> - Upload albums and scan track lists with AI</li>
                <li><strong>Users</strong> - Create bar manager accounts</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>AI Album Scanner</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Take a photo of any album track listing and our AI will automatically 
                extract all song titles and track numbers. No more manual entry!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
