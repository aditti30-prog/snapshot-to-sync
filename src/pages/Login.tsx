import { motion } from 'framer-motion';
import { Camera, Calendar, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import mascot from '@/assets/mascot.png';
import ConfettiBackground from '@/components/ConfettiBackground';

const Login = () => {
  const handleGoogleLogin = () => {
    // TODO: implement actual Google OAuth
    // For now, navigate to dashboard with mock auth
    window.location.href = '/dashboard';
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      <ConfettiBackground count={30} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 flex max-w-md flex-col items-center text-center"
      >
        <motion.img
          src={mascot}
          alt="Snap2Calendar mascot"
          className="mb-6 h-32 w-32 drop-shadow-lg"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        <h1 className="font-display text-5xl font-900 leading-tight text-foreground">
          Snap<span className="text-primary">2</span>Calendar
        </h1>

        <p className="mt-3 text-lg text-muted-foreground">
          Screenshot a conversation. Get a calendar event. That easy.
        </p>

        <div className="mt-8 flex flex-col gap-3 text-left">
          {[
            { icon: Camera, text: 'Upload a screenshot of plans', color: 'text-candy-coral' },
            { icon: Sparkles, text: 'AI extracts the event details', color: 'text-candy-purple' },
            { icon: Calendar, text: 'One-click Google Calendar event', color: 'text-candy-mint' },
          ].map(({ icon: Icon, text, color }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.15 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <span className="text-sm text-foreground">{text}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-10"
        >
          <Button
            onClick={handleGoogleLogin}
            size="lg"
            className="gap-3 rounded-full bg-foreground px-8 font-display text-base font-700 text-background shadow-lg transition-all hover:scale-105 hover:bg-foreground/90 hover:shadow-xl"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </Button>
        </motion.div>

        <p className="mt-4 text-xs text-muted-foreground/60">
          We only access your Google Calendar to create events
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
