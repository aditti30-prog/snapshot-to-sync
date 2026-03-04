import { Camera, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import mascot from '@/assets/mascot.png';

interface HeaderProps {
  isLoggedIn?: boolean;
  userName?: string;
  userAvatar?: string;
  onLogout?: () => void;
}

const Header = ({ isLoggedIn, userName, userAvatar, onLogout }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <button
          onClick={() => navigate(isLoggedIn ? '/dashboard' : '/')}
          className="flex items-center gap-2 transition-transform hover:scale-105"
        >
          <img src={mascot} alt="Snap2Calendar mascot" className="h-9 w-9 rounded-lg" />
          <span className="font-display text-xl font-800 text-foreground">
            Snap<span className="text-primary">2</span>Calendar
          </span>
        </button>

        {isLoggedIn && (
          <div className="flex items-center gap-3">
            {location.pathname !== '/upload' && (
              <Button
                onClick={() => navigate('/upload')}
                size="sm"
                className="gap-2 rounded-full bg-primary font-display font-700 text-primary-foreground hover:bg-primary/90"
              >
                <Camera className="h-4 w-4" />
                New Snap
              </Button>
            )}
            <div className="flex items-center gap-2">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="h-8 w-8 rounded-full ring-2 ring-primary/30" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-display text-sm font-700 text-primary-foreground">
                  {userName?.charAt(0) ?? '?'}
                </div>
              )}
              <button
                onClick={onLogout}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
