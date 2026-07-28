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
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Static mock data — no backend, no APIs, no auth.                   */
/* ------------------------------------------------------------------ */

type Msg = {
  id: number;
  sender: "you" | string;
  name?: string;
  color?: string;
  text: string;
  time: string;
  confirmed?: boolean;
};

const GROUP = {
  name: "Dinner Squad 🍜",
  members: "You, Priya, Marcus",
};

const MESSAGES: Msg[] = [
  { id: 1, sender: "Priya", name: "Priya", color: "#d9376e", text: "Sooo are we finally doing dinner this week? 🍜", time: "6:41 PM" },
  { id: 2, sender: "Marcus", name: "Marcus", color: "#2a7ad4", text: "Yes please. I'm starving already 😭", time: "6:42 PM" },
  { id: 3, sender: "you", text: "How about Tuesday? VivoCity has a ton of options", time: "6:43 PM" },
  { id: 4, sender: "Priya", name: "Priya", color: "#d9376e", text: "VivoCity works for me. 7pm?", time: "6:44 PM" },
  { id: 5, sender: "Marcus", name: "Marcus", color: "#2a7ad4", text: "7pm Tuesday is perfect 👍", time: "6:45 PM" },
  {
    id: 6,
    sender: "you",
    text: "Confirmed! Dinner Tuesday at 7pm, VivoCity 🎉 See you both there",
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

const INITIAL_PARTICIPANTS = ["You", "Priya", "Marcus"];

/* ------------------------------------------------------------------ */

type SheetState = "hidden" | "form" | "success";

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

const WhatsAppDinner = () => {
  const [sheet, setSheet] = useState<SheetState>("hidden");
  const [suggestionUsed, setSuggestionUsed] = useState(false);

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

  const confirmEvent = () => {
    setSheet("success");
    setSuggestionUsed(true);
  };

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
              🍜
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate font-semibold">{GROUP.name}</p>
              <p className="truncate text-xs text-white/70">{GROUP.members}</p>
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
                      {!mine && (
                        <p
                          className="mb-0.5 text-[12px] font-semibold"
                          style={{ color: m.color }}
                        >
                          {m.name}
                        </p>
                      )}
                      <p>{m.text}</p>
                      <div className="mt-0.5 flex items-center justify-end gap-1">
                        <span className="text-[10px] text-neutral-400">{m.time}</span>
                        {mine && <CheckCheck className="h-3.5 w-3.5 text-[#34B7F1]" />}
                      </div>
                    </div>
                  </div>

                  {/* Smart "Create event" suggestion below the confirmed message */}
                  {m.confirmed && (
                    <div className="mt-1 flex justify-end">
                      <motion.button
                        onClick={openSheet}
                        whileTap={{ scale: 0.97 }}
                        className="flex max-w-[80%] items-center gap-3 rounded-lg border border-[#075E54]/15 bg-white px-3 py-2.5 text-left shadow-sm"
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                            suggestionUsed ? "bg-[#25D366]/15" : "bg-[#075E54]/10"
                          }`}
                        >
                          {suggestionUsed ? (
                            <CalendarCheck className="h-5 w-5 text-[#25D366]" />
                          ) : (
                            <CalendarPlus className="h-5 w-5 text-[#075E54]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-neutral-800">
                            {suggestionUsed ? "Event added to calendar" : "Create event"}
                          </p>
                          <p className="truncate text-[12px] text-neutral-500">
                            {suggestionUsed
                              ? `${formatPrettyDate(date)} · ${formatPrettyTime(time)}`
                              : "Dinner · Tue 7:00 PM · VivoCity"}
                          </p>
                        </div>
                        {!suggestionUsed && (
                          <span className="ml-1 shrink-0 text-[12px] font-semibold text-[#075E54]">
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
                  className="absolute inset-x-0 bottom-0 z-50 max-h-[92%] overflow-y-auto rounded-t-3xl bg-white"
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
                      <div className="mb-3 rounded-2xl border border-neutral-200 px-3 py-2.5">
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

                      {/* Actions */}
                      <div className="mt-5 flex gap-3">
                        <button
                          onClick={closeSheet}
                          className="flex-1 rounded-full border border-neutral-200 py-3 text-[15px] font-semibold text-neutral-600"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={confirmEvent}
                          className="flex-[2] rounded-full bg-[#25D366] py-3 text-[15px] font-bold text-white shadow-lg shadow-[#25D366]/30"
                        >
                          Add to calendar
                        </button>
                      </div>
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
                        Event added!
                      </h2>
                      <p className="mt-1 text-[14px] text-neutral-500">
                        Added to your calendar and shared with the group.
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
