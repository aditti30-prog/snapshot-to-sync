import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Clock, MapPin, Calendar, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { MOCK_EVENTS } from '@/lib/mock-data';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import { getCandyColor } from '@/lib/types';

const colorMap: Record<string, string> = {
  'candy-coral': 'bg-candy-coral',
  'candy-mint': 'bg-candy-mint',
  'candy-purple': 'bg-candy-purple',
  'candy-yellow': 'bg-candy-yellow',
  'candy-blue': 'bg-candy-blue',
  'candy-pink': 'bg-candy-pink',
  'candy-orange': 'bg-candy-orange',
  'candy-teal': 'bg-candy-teal',
};

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = MOCK_EVENTS.find((e) => e.id === id);

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Header isLoggedIn userName="Demo User" onLogout={() => navigate('/')} />
        <div className="flex flex-col items-center py-20">
          <p className="font-display text-xl font-700">Event not found</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4 rounded-full">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const startDate = parseISO(event.start);
  const endDate = parseISO(event.end);
  const duration = differenceInMinutes(endDate, startDate);
  const candyColor = getCandyColor(event.colorIndex);
  const bgClass = colorMap[candyColor] || 'bg-candy-coral';

  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn userName="Demo User" onLogout={() => navigate('/')} />

      <main className="container mx-auto max-w-lg px-4 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl bg-card shadow-lg"
        >
          <div className={`h-3 ${bgClass}`} />
          <div className="p-6">
            <h1 className="font-display text-2xl font-800 text-foreground">{event.title}</h1>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 text-foreground">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(startDate, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-3 text-foreground">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(startDate, 'h:mm a')} – {format(endDate, 'h:mm a')}
                  <span className="ml-2 text-sm text-muted-foreground">({duration} min)</span>
                </span>
              </div>
              {event.location && (
                <div className="flex items-center gap-3 text-foreground">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{event.location}</span>
                </div>
              )}
              {event.notes && (
                <div className="mt-2 rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
                  {event.notes}
                </div>
              )}
            </div>

            <div className="mt-4 rounded-xl bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              Timezone: {event.timezone}
            </div>

            {event.screenshotUrl && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-600 text-muted-foreground">Source screenshot:</p>
                <img
                  src={event.screenshotUrl}
                  alt="Source"
                  className="rounded-xl border border-border"
                />
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {event.googleLink && (
                <Button
                  variant="outline"
                  onClick={() => window.open(event.googleLink, '_blank')}
                  className="gap-2 rounded-full font-display font-600"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in Google Calendar
                </Button>
              )}
              <Button
                onClick={() => navigate('/upload')}
                className="gap-2 rounded-full bg-primary font-display font-600 text-primary-foreground"
              >
                <Camera className="h-4 w-4" />
                New Snap
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default EventDetails;
