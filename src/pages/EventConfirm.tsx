import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarPlus, AlertTriangle, CheckCircle2, MapPin, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import ConfettiBackground from '@/components/ConfettiBackground';
import type { EventCandidate } from '@/lib/types';

function ConfidenceBadge({ value }: { value: number }) {
  if (value >= 0.8) return null;
  return (
    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-candy-yellow/20 px-2 py-0.5 text-xs font-600 text-candy-orange">
      <AlertTriangle className="h-3 w-3" />
      {value < 0.5 ? 'Low confidence' : 'Check this'}
    </span>
  );
}

const EventConfirm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { events: EventCandidate[]; screenshotUrl: string } | null;

  const events = state?.events ?? [];
  const screenshotUrl = state?.screenshotUrl;

  const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [forms, setForms] = useState(
    events.map((ev) => ({
      title: ev.title,
      date: ev.start.date,
      time: ev.start.time,
      endDate: ev.end?.date ?? ev.start.date,
      endTime: ev.end?.time ?? '',
      durationMinutes: ev.duration_minutes ?? 30,
      location: ev.location ?? '',
      notes: ev.notes ?? '',
      timezone: ev.timezone ?? browserTz,
      selected: true,
    }))
  );

  const [createdIndex, setCreatedIndex] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const updateForm = (idx: number, patch: Partial<(typeof forms)[0]>) => {
    setForms((prev) => prev.map((f, i) => (i === idx ? { ...f, ...patch } : f)));
  };

  const handleCreate = async (idx: number) => {
    // TODO: call Google Calendar API via edge function
    setCreatedIndex(idx);
    await new Promise((r) => setTimeout(r, 1200));
    setShowSuccess(true);
  };

  if (events.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header isLoggedIn userName="Demo User" onLogout={() => navigate('/')} />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="font-display text-xl font-700 text-foreground">No events to confirm</p>
          <Button onClick={() => navigate('/upload')} className="mt-4 rounded-full bg-primary font-display text-primary-foreground">
            Upload a Screenshot
          </Button>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="relative min-h-screen bg-background">
        <ConfettiBackground count={40} />
        <Header isLoggedIn userName="Demo User" onLogout={() => navigate('/')} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center px-4 py-20 text-center"
        >
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-candy-mint/20">
            <CheckCircle2 className="h-10 w-10 text-candy-mint" />
          </div>
          <h1 className="font-display text-3xl font-800 text-foreground">Event Created! 🎉</h1>
          <p className="mt-2 text-muted-foreground">
            "{forms[createdIndex ?? 0].title}" has been added to your calendar
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              className="rounded-full font-display font-600"
              onClick={() => window.open('#', '_blank')}
            >
              Open in Google Calendar
            </Button>
            <Button
              onClick={() => navigate('/upload')}
              className="rounded-full bg-primary font-display font-600 text-primary-foreground"
            >
              Create Another Event
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="rounded-full font-display font-600"
            >
              Back to Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn userName="Demo User" onLogout={() => navigate('/')} />

      <main className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-display text-2xl font-800 text-foreground">
          Confirm Event{events.length > 1 ? 's' : ''}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review the extracted details and make any corrections
        </p>

        {screenshotUrl && (
          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <img src={screenshotUrl} alt="Source screenshot" className="max-h-40 w-full object-cover object-top" />
          </div>
        )}

        <div className="mt-6 space-y-6">
          {forms.map((form, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              {events.length > 1 && (
                <div className="mb-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.selected}
                    onChange={(e) => updateForm(idx, { selected: e.target.checked })}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm font-600 text-muted-foreground">Event {idx + 1}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label className="font-display font-600">
                    Title *
                    <ConfidenceBadge value={events[idx].confidence.title} />
                  </Label>
                  <Input
                    value={form.title}
                    onChange={(e) => updateForm(idx, { title: e.target.value })}
                    className="mt-1 rounded-xl"
                    placeholder="Event title"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="font-display font-600">
                      Start Date *
                      <ConfidenceBadge value={events[idx].confidence.start} />
                    </Label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(e) => updateForm(idx, { date: e.target.value })}
                      className="mt-1 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="font-display font-600">Start Time *</Label>
                    <Input
                      type="time"
                      value={form.time}
                      onChange={(e) => updateForm(idx, { time: e.target.value })}
                      className="mt-1 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label className="font-display font-600">
                    Duration (minutes)
                    <ConfidenceBadge value={events[idx].confidence.end_or_duration} />
                  </Label>
                  <Input
                    type="number"
                    min={5}
                    value={form.durationMinutes}
                    onChange={(e) => updateForm(idx, { durationMinutes: parseInt(e.target.value) || 30 })}
                    className="mt-1 w-32 rounded-xl"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Default: 30 minutes</p>
                </div>

                <div>
                  <Label className="flex items-center gap-1 font-display font-600">
                    <MapPin className="h-3.5 w-3.5" /> Location
                    <ConfidenceBadge value={events[idx].confidence.location} />
                  </Label>
                  <Input
                    value={form.location}
                    onChange={(e) => updateForm(idx, { location: e.target.value })}
                    className="mt-1 rounded-xl"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-1 font-display font-600">
                    <FileText className="h-3.5 w-3.5" /> Notes
                  </Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => updateForm(idx, { notes: e.target.value })}
                    className="mt-1 rounded-xl"
                    rows={2}
                    placeholder="Optional notes"
                  />
                </div>

                <div className="rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                  Timezone: <span className="font-600 text-foreground">{form.timezone}</span>
                  {form.timezone !== browserTz && (
                    <span className="ml-2 text-candy-orange">
                      ⚠ Browser detected: {browserTz}
                    </span>
                  )}
                </div>

                {events[idx].evidence.matched_text_snippets.length > 0 && (
                  <div className="rounded-xl bg-primary/5 px-3 py-2">
                    <p className="text-xs font-600 text-primary">Matched snippets:</p>
                    {events[idx].evidence.matched_text_snippets.map((s, si) => (
                      <p key={si} className="mt-0.5 text-xs italic text-muted-foreground">
                        "{s}"
                      </p>
                    ))}
                  </div>
                )}

                <Button
                  onClick={() => handleCreate(idx)}
                  disabled={!form.title || !form.date || !form.time || !form.selected}
                  className="w-full gap-2 rounded-full bg-primary font-display text-base font-700 text-primary-foreground shadow-md hover:bg-primary/90"
                >
                  <CalendarPlus className="h-5 w-5" />
                  Create Event
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default EventConfirm;
