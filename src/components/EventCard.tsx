import { Clock, MapPin, Calendar } from 'lucide-react';
import { CreatedEvent, getCandyColor } from '@/lib/types';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import { motion } from 'framer-motion';

interface EventCardProps {
  event: CreatedEvent;
  onClick?: () => void;
}

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

const EventCard = ({ event, onClick }: EventCardProps) => {
  const candyColor = getCandyColor(event.colorIndex);
  const bgClass = colorMap[candyColor] || 'bg-candy-coral';
  const startDate = parseISO(event.start);
  const endDate = parseISO(event.end);
  const duration = differenceInMinutes(endDate, startDate);

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="group w-full overflow-hidden rounded-2xl bg-card text-left shadow-md transition-shadow hover:shadow-xl"
    >
      <div className={`h-2 ${bgClass}`} />
      <div className="p-4">
        <h3 className="font-display text-lg font-700 text-foreground line-clamp-1">
          {event.title}
        </h3>

        <div className="mt-2 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{format(startDate, 'EEE, MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {format(startDate, 'h:mm a')} – {format(endDate, 'h:mm a')}
              <span className="ml-1 text-xs opacity-70">({duration} min)</span>
            </span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
        </div>

        {event.screenshotUrl && (
          <div className="mt-3 overflow-hidden rounded-lg border border-border">
            <img
              src={event.screenshotUrl}
              alt="Source screenshot"
              className="h-16 w-full object-cover object-top opacity-60 transition-opacity group-hover:opacity-90"
            />
          </div>
        )}
      </div>
    </motion.button>
  );
};

export default EventCard;
