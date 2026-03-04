import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';
import { CreatedEvent, getCandyColor } from '@/lib/types';

interface MiniCalendarProps {
  events: CreatedEvent[];
}

const dotColorMap: Record<string, string> = {
  'candy-coral': 'bg-candy-coral',
  'candy-mint': 'bg-candy-mint',
  'candy-purple': 'bg-candy-purple',
  'candy-yellow': 'bg-candy-yellow',
  'candy-blue': 'bg-candy-blue',
  'candy-pink': 'bg-candy-pink',
  'candy-orange': 'bg-candy-orange',
  'candy-teal': 'bg-candy-teal',
};

const MiniCalendar = ({ events }: MiniCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CreatedEvent[]>();
    events.forEach((ev) => {
      const key = format(parseISO(ev.start), 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    });
    return map;
  }, [events]);

  return (
    <div className="rounded-2xl bg-card p-4 shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="rounded-full p-1 hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <h3 className="font-display text-sm font-700 text-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="rounded-full p-1 hover:bg-muted"
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="p-1 text-xs font-600 text-muted-foreground">
            {d}
          </div>
        ))}
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDay.get(key) || [];
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);

          return (
            <div
              key={key}
              className={`relative flex flex-col items-center rounded-lg p-1 text-xs ${
                !inMonth ? 'text-muted-foreground/30' : today
                  ? 'bg-primary/10 font-700 text-primary'
                  : 'text-foreground'
              }`}
            >
              <span>{format(day, 'd')}</span>
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayEvents.slice(0, 3).map((ev, i) => (
                    <div
                      key={i}
                      className={`h-1 w-1 rounded-full ${
                        dotColorMap[getCandyColor(ev.colorIndex)] || 'bg-primary'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar;
