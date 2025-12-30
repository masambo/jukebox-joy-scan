import React from 'react';
import { ManagerLayout } from '@/components/manager/ManagerLayout';
import { useManagerBar } from '@/hooks/useManagerBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Disc3, Music2, ListMusic, QrCode, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

export default function ManagerDashboard() {
  const { bar, loading } = useManagerBar();
  const [stats, setStats] = useState({ albums: 0, songs: 0, playlists: 0 });

  useEffect(() => {
    if (bar) {
      fetchStats();
    }
  }, [bar]);

  const fetchStats = async () => {
    if (!bar) return;

    const [albumsRes, songsRes, playlistsRes] = await Promise.all([
      supabase.from('albums').select('id', { count: 'exact', head: true }).eq('bar_id', bar.id),
      supabase.from('songs').select('id, albums!inner(bar_id)', { count: 'exact', head: true }).eq('albums.bar_id', bar.id),
      supabase.from('playlists').select('id', { count: 'exact', head: true }).eq('bar_id', bar.id),
    ]);

    setStats({
      albums: albumsRes.count || 0,
      songs: songsRes.count || 0,
      playlists: playlistsRes.count || 0,
    });
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
                You are not assigned to any bar yet. Please contact your administrator.
              </p>
            </CardContent>
          </Card>
        </div>
      </ManagerLayout>
    );
  }

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/bar/${bar.slug}`)}`;

  const statCards = [
    { title: 'Albums', value: stats.albums, icon: Disc3, color: 'text-primary' },
    { title: 'Songs', value: stats.songs, icon: Music2, color: 'text-secondary' },
    { title: 'Playlists', value: stats.playlists, icon: ListMusic, color: 'text-accent' },
  ];

  return (
    <ManagerLayout barName={bar.name}>
      <div className="p-6">
        <h1 className="text-3xl font-heading font-bold mb-2">{bar.name}</h1>
        <p className="text-muted-foreground mb-6">{bar.address || 'No address set'}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Your Bar's QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <img 
                src={qrCodeUrl} 
                alt="Bar QR Code" 
                className="w-48 h-48 rounded-lg bg-white p-2"
              />
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Print this QR code and place it in your bar. Customers can scan it to browse your jukebox catalog.
              </p>
              <a 
                href={`${window.location.origin}/bar/${bar.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm mt-2"
              >
                {window.location.origin}/bar/{bar.slug}
              </a>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground text-sm mb-4">
                Use the sidebar to navigate:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li><strong>Customize</strong> - Update your bar's appearance</li>
                <li><strong>Albums</strong> - Add albums and scan track lists with AI</li>
                <li><strong>Playlists</strong> - Create themed playlists for customers</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </ManagerLayout>
  );
}
