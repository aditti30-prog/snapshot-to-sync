import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Video,
  Phone,
  MoreVertical,
  Plus,
  CalendarPlus,
  CalendarCheck,
  Check,
  X,
  Clock,
  MapPin,
  Users,
  Type,
  Calendar as CalendarIcon,
  CheckCheck,
  ExternalLink,
  Download,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Static mock data — no backend, no auth, no database.              */
/*  The only "integration" is a client-side hand-off to the user's    */
/*  own calendar: a Google Calendar prefill link and a local .ics     */
/*  download for Apple Calendar. No APIs are called from this app.    */
/* ------------------------------------------------------------------ */

type Msg = {
  id: number;
  sender: "you" | "them";
  text: string;
  time: string;
  confirmed?: boolean;
};

const FRIEND = {
  name: "Priya Menon",
  status: "online",
  emoji: "🧑🏽‍🦱",
};

// 1:1 (person-to-person) conversation
const MESSAGES: Msg[] = [
  { id: 1, sender: "them", text: "Are we still on for dinner this week? 🍜", time: "6:41 PM" },
  { id: 2, sender: "you", text: "Yes! Does Tuesday work for you?", time: "6:42 PM" },
  { id: 3, sender: "them", text: "Tuesday's perfect. Where though?", time: "6:43 PM" },
  { id: 4, sender: "you", text: "VivoCity? Loads of options there", time: "6:44 PM" },
  { id: 5, sender: "them", text: "Ooh yes. 7pm?", time: "6:45 PM" },
  {
    id: 6,
    sender: "you",
    text: "Confirmed — dinner Tuesday at 7pm, VivoCity 🎉",
    time: "6:46 PM",
    confirmed: true,
  },
];

const INITIAL_EVENT = {
  title: "Dinner at VivoCity",
  date: "2026-08-04", // next Tuesday
  time: "19:00",
  location: "VivoCity, 1 HarbourFront Walk",
};

// Defaults to the two people in this p2p chat; editable in the sheet.
const INITIAL_PARTICIPANTS = ["You", "Priya"];

const DURATION_MINUTES = 120;

/* ------------------------------------------------------------------ */

type SheetState = "hidden" | "form" | "success";
type CalendarKind = "google" | "apple";

const formatPrettyDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

const formatPrettyTime = (t: string) => {
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
};

const pad = (n: number) => String(n).padStart(2, "0");

const eventDates = (date: string, time: string) => {
  const start = new Date(`${date}T${time}:00`);
  const end = new Date(start.getTime() + DURATION_MINUTES * 60 * 1000);
  return { start, end };
};

const localStamp = (d: Date) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(
    d.getHours()
  )}${pad(d.getMinutes())}00`;

const utcStamp = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(
    d.getUTCHours()
  )}${pad(d.getUTCMinutes())}00Z`;

/* Small brand marks (inline SVG — no external images) */
const GoogleMark = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
  </svg>
);

const AppleMark = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
    <path d="M16.37 12.7c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.1-2.02-3.77-2.05-1.6-.16-3.13.94-3.94.94-.82 0-2.07-.92-3.4-.9-1.75.03-3.36 1.02-4.26 2.58-1.82 3.15-.47 7.82 1.3 10.38.86 1.25 1.89 2.66 3.24 2.61 1.3-.05 1.79-.84 3.36-.84 1.56 0 2 .84 3.37.81 1.39-.02 2.28-1.28 3.13-2.54.99-1.46 1.4-2.87 1.42-2.94-.03-.01-2.72-1.04-2.75-4.15zM13.94 4.9c.72-.87 1.2-2.08 1.07-3.28-1.03.04-2.28.69-3.02 1.55-.66.77-1.24 2-1.08 3.18 1.15.09 2.32-.58 3.03-1.45z" />
  </svg>
);

const WhatsAppDinner = () => {
  const [sheet, setSheet] = useState<SheetState>("hidden");
  const [savedTo, setSavedTo] = useState<CalendarKind | null>(null);

  // Editable event fields
  const [title, setTitle] = useState(INITIAL_EVENT.title);
  const [date, setDate] = useState(INITIAL_EVENT.date);
  const [time, setTime] = useState(INITIAL_EVENT.time);
  const [location, setLocation] = useState(INITIAL_EVENT.location);
  const [participants, setParticipants] = useState<string[]>(INITIAL_PARTICIPANTS);
  const [newParticipant, setNewParticipant] = useState("");

  const openSheet = () => setSheet("form");
  const closeSheet = () => setSheet("hidden");

  const removeParticipant = (name: string) =>
    setParticipants((p) => p.filter((x) => x !== name));

  const addParticipant = () => {
    const n = newParticipant.trim();
    if (n && !participants.includes(n)) {
      setParticipants((p) => [...p, n]);
    }
    setNewParticipant("");
  };

  /* Hand off to the user's real calendar — entirely client-side. */
  const saveToCalendar = (kind: CalendarKind) => {
    const { start, end } = eventDates(date, time);
    const details = `Dinner plans confirmed over chat.\nWith: ${participants.join(", ")}`;

    if (kind === "google") {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const url =
        "https://calendar.google.com/calendar/render?action=TEMPLATE" +
        `&text=${encodeURIComponent(title)}` +
        `&dates=${localStamp(start)}/${localStamp(end)}` +
        `&ctz=${encodeURIComponent(tz)}` +
        `&location=${encodeURIComponent(location)}` +
        `&details=${encodeURIComponent(details)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Snap2Calendar//Dinner Prototype//EN",
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        `UID:${start.getTime()}-dinner@snap2calendar`,
        `DTSTAMP:${utcStamp(new Date())}`,
        `DTSTART:${utcStamp(start)}`,
        `DTEND:${utcStamp(end)}`,
        `SUMMARY:${title}`,
        `LOCATION:${location}`,
        `DESCRIPTION:${details.replace(/\n/g, "\\n")}`,
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n");
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = "dinner-at-vivocity.ics";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    }

    setSavedTo(kind);
    setSheet("success");
  };

  const calLabel = savedTo === "google" ? "Google Calendar" : "Apple Calendar";

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-muted to-background p-4">
      {/* -------------------- Phone frame -------------------- */}
      <div className="relative h-[812px] w-full max-w-[390px] overflow-hidden rounded-[2.75rem] border-[10px] border-neutral-900 bg-black shadow-2xl">
        {/* Notch */}
        <div className="absolute left-1/2 top-0 z-30 h-6 w-36 -translate-x-1/2 rounded-b-2xl bg-neutral-900" />

        {/* Screen */}
        <div className="relative flex h-full flex-col overflow-hidden bg-[#ECE5DD]">
          {/* -------------------- WhatsApp header -------------------- */}
          <div className="z-20 flex items-center gap-3 bg-[#075E54] px-3 pb-2 pt-9 text-white shadow">
            <ArrowLeft className="h-5 w-5 shrink-0" />
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#128C7E] text-lg">
              {FRIEND.emoji}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate font-semibold">{FRIEND.name}</p>
              <p className="truncate text-xs text-white/70">{FRIEND.status}</p>
            </div>
            <Video className="h-5 w-5 shrink-0" />
            <Phone className="h-5 w-5 shrink-0" />
            <MoreVertical className="h-5 w-5 shrink-0" />
          </div>

          {/* -------------------- Chat area -------------------- */}
          <div
            className="flex-1 space-y-1.5 overflow-y-auto px-3 py-3"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3C/g%3E%3C/svg%3E\")",
            }}
          >
            {/* Date pill */}
            <div className="flex justify-center py-1">
              <span className="rounded-md bg-white/80 px-2 py-0.5 text-[11px] text-neutral-500 shadow-sm">
                Today
              </span>
            </div>

            {MESSAGES.map((m) => {
              const mine = m.sender === "you";
              return (
                <div key={m.id}>
                  <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg px-2.5 py-1.5 text-[14px] leading-snug shadow-sm ${
                        mine ? "bg-[#DCF8C6] text-neutral-800" : "bg-white text-neutral-800"
                      }`}
                    >
                      <p>{m.text}</p>
                      <div className="mt-0.5 flex items-center justify-end gap-1">
                        <span className="text-[10px] text-neutral-400">{m.time}</span>
                        {mine && <CheckCheck className="h-3.5 w-3.5 text-[#34B7F1]" />}
                      </div>
                    </div>
                  </div>

                  {/* Smart "Create event" suggestion below the confirmed message */}
                  {m.confirmed && (
                    <div className="mt-2 flex justify-center">
                      <motion.button
                        onClick={openSheet}
                        whileTap={{ scale: 0.98 }}
                        className="flex w-full max-w-[92%] items-center gap-3 rounded-xl border border-[#075E54]/15 bg-white px-3 py-3 text-left shadow-sm"
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                            savedTo ? "bg-[#25D366]/15" : "bg-[#075E54]/10"
                          }`}
                        >
                          {savedTo ? (
                            <CalendarCheck className="h-5 w-5 text-[#25D366]" />
                          ) : (
                            <CalendarPlus className="h-5 w-5 text-[#075E54]" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold text-neutral-800">
                            {savedTo ? `Added to ${calLabel}` : "Create calendar event"}
                          </p>
                          <p className="truncate text-[12px] text-neutral-500">
                            {savedTo
                              ? `${formatPrettyDate(date)} · ${formatPrettyTime(time)}`
                              : "Dinner · Tue 7:00 PM · VivoCity"}
                          </p>
                        </div>
                        {!savedTo && (
                          <span className="shrink-0 rounded-full bg-[#075E54] px-3 py-1 text-[12px] font-semibold text-white">
                            Add
                          </span>
                        )}
                      </motion.button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* -------------------- Input bar (decorative) -------------------- */}
          <div className="flex items-center gap-2 bg-[#ECE5DD] px-2 py-2">
            <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-3 py-2 text-neutral-400">
              <Plus className="h-5 w-5" />
              <span className="text-[14px]">Message</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#075E54] text-white">
              <Phone className="h-5 w-5" />
            </div>
          </div>

          {/* -------------------- Bottom sheet -------------------- */}
          <AnimatePresence>
            {sheet !== "hidden" && (
              <>
                <motion.div
                  key="backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={closeSheet}
                  className="absolute inset-0 z-40 bg-black/40"
                />
                <motion.div
                  key="sheet"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="absolute inset-x-0 bottom-0 z-50 max-h-[94%] overflow-y-auto rounded-t-3xl bg-white"
                >
                  <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-neutral-300" />

                  {sheet === "form" ? (
                    <div className="px-5 pb-6 pt-3">
                      <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-neutral-900">New event</h2>
                        <button
                          onClick={closeSheet}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Title */}
                      <Field icon={<Type className="h-4 w-4" />} label="Title">
                        <input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full bg-transparent text-[15px] font-medium text-neutral-900 outline-none"
                        />
                      </Field>

                      {/* Date + Time */}
                      <div className="grid grid-cols-2 gap-3">
                        <Field icon={<CalendarIcon className="h-4 w-4" />} label="Date">
                          <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-transparent text-[15px] font-medium text-neutral-900 outline-none"
                          />
                        </Field>
                        <Field icon={<Clock className="h-4 w-4" />} label="Time">
                          <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full bg-transparent text-[15px] font-medium text-neutral-900 outline-none"
                          />
                        </Field>
                      </div>

                      {/* Location */}
                      <Field icon={<MapPin className="h-4 w-4" />} label="Location">
                        <input
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full bg-transparent text-[15px] font-medium text-neutral-900 outline-none"
                        />
                      </Field>

                      {/* Participants */}
                      <div className="mb-4 rounded-2xl border border-neutral-200 px-3 py-2.5">
                        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                          <Users className="h-4 w-4" />
                          Participants
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {participants.map((p) => (
                            <span
                              key={p}
                              className="flex items-center gap-1 rounded-full bg-[#075E54]/10 py-1 pl-3 pr-2 text-[13px] font-medium text-[#075E54]"
                            >
                              {p}
                              <button
                                onClick={() => removeParticipant(p)}
                                className="flex h-4 w-4 items-center justify-center rounded-full bg-[#075E54]/20"
                                aria-label={`Remove ${p}`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            value={newParticipant}
                            onChange={(e) => setNewParticipant(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addParticipant()}
                            placeholder="Add someone…"
                            className="flex-1 bg-transparent text-[14px] text-neutral-700 outline-none placeholder:text-neutral-400"
                          />
                          <button
                            onClick={addParticipant}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#075E54] text-white"
                            aria-label="Add participant"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Save-to-calendar choice */}
                      <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-neutral-400">
                        Save to
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => saveToCalendar("google")}
                          className="flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 py-3 text-[14px] font-semibold text-neutral-800 transition-colors hover:bg-neutral-50"
                        >
                          <GoogleMark />
                          Google
                        </button>
                        <button
                          onClick={() => saveToCalendar("apple")}
                          className="flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-neutral-800"
                        >
                          <AppleMark />
                          Apple
                        </button>
                      </div>

                      <button
                        onClick={closeSheet}
                        className="mt-4 w-full rounded-full py-2.5 text-[15px] font-semibold text-neutral-500"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    /* -------------------- Success state -------------------- */
                    <div className="flex flex-col items-center px-6 pb-8 pt-6 text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12, stiffness: 200 }}
                        className="flex h-20 w-20 items-center justify-center rounded-full bg-[#25D366]"
                      >
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.15 }}
                        >
                          <Check className="h-11 w-11 text-white" strokeWidth={3} />
                        </motion.div>
                      </motion.div>

                      <h2 className="mt-5 text-xl font-bold text-neutral-900">
                        Sent to {calLabel}
                      </h2>
                      <p className="mt-1 flex items-center gap-1.5 text-[13px] text-neutral-500">
                        {savedTo === "google" ? (
                          <>
                            <ExternalLink className="h-4 w-4" />
                            Opened in a new tab — tap Save there to confirm.
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            .ics downloaded — open it to add to Apple Calendar.
                          </>
                        )}
                      </p>

                      <div className="mt-5 w-full rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-left">
                        <p className="text-[15px] font-bold text-neutral-900">{title}</p>
                        <div className="mt-2 space-y-1.5 text-[13px] text-neutral-600">
                          <p className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-[#075E54]" />
                            {formatPrettyDate(date)}
                          </p>
                          <p className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-[#075E54]" />
                            {formatPrettyTime(time)}
                          </p>
                          <p className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[#075E54]" />
                            {location}
                          </p>
                          <p className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-[#075E54]" />
                            {participants.join(", ")}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={closeSheet}
                        className="mt-5 w-full rounded-full bg-[#075E54] py-3 text-[15px] font-bold text-white"
                      >
                        Back to chat
                      </button>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

/* Small labelled field wrapper for the event form */
const Field = ({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="mb-3 rounded-2xl border border-neutral-200 px-3 py-2">
    <div className="mb-0.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
      <span className="text-neutral-400">{icon}</span>
      {label}
    </div>
    {children}
  </div>
);

export default WhatsAppDinner;
