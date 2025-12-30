import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Music, 
  Palette, 
  Disc3, 
  ListMusic,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ManagerLayoutProps {
  children: React.ReactNode;
  barName?: string;
}

const navItems = [
  { href: '/manager', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/manager/customize', label: 'Customize', icon: Palette },
  { href: '/manager/albums', label: 'Albums', icon: Disc3 },
  { href: '/manager/playlists', label: 'Playlists', icon: ListMusic },
];

export function ManagerLayout({ children, barName }: ManagerLayoutProps) {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <Link to="/manager" className="flex items-center gap-2">
            <Music className="h-8 w-8 text-primary" />
            <span className="text-xl font-heading font-bold">Namjukes</span>
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Bar Manager</p>
          {barName && (
            <p className="text-sm text-primary font-medium mt-2 truncate">{barName}</p>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                location.pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="text-sm text-muted-foreground mb-2 truncate">
            {user?.email}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSignOut}
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
