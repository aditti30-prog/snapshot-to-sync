import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image,
  Sparkles,
  Loader2,
  X,
  Calendar,
  ArrowRight,
  Upload,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import mascot from "@/assets/mascot.png";

type EventData = {
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  description: string;
};

type ExtractionResult = {
  event: EventData;
  calendarUrl: string;
} | null;

type AppState = "idle" | "preview" | "extracting" | "result" | "error";

const Index = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [state, setState] = useState<AppState>("idle");
  const [result, setResult] = useState<ExtractionResult>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      setState("preview");
    };
    reader.readAsDataURL(f);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setErrorMsg("");
    setState("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExtract = async () => {
    if (!preview) return;
    setState("extracting");
    setErrorMsg("");

    try {
      const base64 = preview.split(",")[1];
      const mimeType = file?.type || "image/png";

      const { data, error } = await supabase.functions.invoke("extract-event", {
        body: { imageBase64: base64, mimeType },
      });

      if (error) throw new Error(error.message);

      if (data?.error) {
        setErrorMsg(data.error);
        setState("error");
        return;
      }

      setResult(data);
      setState("result");
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setState("error");
    }
  };

  const formatTime = (time: string) => {
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  const formatDate = (date: string) => {
    const d = new Date(date + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img
              src={mascot}
              alt="Snap2Calendar"
              className="h-9 w-9 rounded-lg"
            />
            <span className="font-display text-xl font-extrabold text-foreground">
              Snap<span className="text-primary">2</span>Calendar
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-6 sm:py-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="font-display text-2xl font-extrabold leading-tight text-foreground sm:text-4xl">
            Turn chat screenshots into{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Google Calendar events
            </span>{" "}
            in seconds.
          </h1>
          <p className="mt-2 text-base text-muted-foreground sm:mt-3 sm:text-lg">
            Upload a screenshot. We'll read it and create the event for you.
          </p>
        </motion.div>

        {/* Flow illustration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="my-6 flex flex-col items-center gap-2 text-muted-foreground sm:my-8 sm:flex-row sm:justify-center sm:gap-3"
        >
          <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-sm border border-border">
            <Image className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Screenshot</span>
          </div>
          <ArrowRight className="h-4 w-4 rotate-90 sm:rotate-0" />
          <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-sm border border-border">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">AI reads it</span>
          </div>
          <ArrowRight className="h-4 w-4 rotate-90 sm:rotate-0" />
          <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-sm border border-border">
            <Calendar className="h-4 w-4 text-secondary" />
            <span className="text-sm font-medium">Calendar event</span>
          </div>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <AnimatePresence mode="wait">
            {/* IDLE: Upload picker */}
            {state === "idle" && (
              <motion.label
                key="picker"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-primary/30 bg-card p-8 transition-colors hover:border-primary/60 hover:bg-primary/5 sm:p-12"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-display text-lg font-bold text-foreground">
                    Upload a screenshot
                  </p>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG or JPEG
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpg,image/jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </motion.label>
            )}

            {/* PREVIEW: Show image + extract button */}
            {state === "preview" && preview && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div className="relative overflow-hidden rounded-2xl bg-card shadow-lg border border-border">
                  <button
                    onClick={clearFile}
                    className="absolute right-3 top-3 z-10 rounded-full bg-foreground/80 p-1.5 text-background transition-colors hover:bg-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <img
                    src={preview}
                    alt="Screenshot preview"
                    className="max-h-80 w-full object-contain"
                  />
                  <div className="border-t border-border p-3">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {file?.name}
                      </span>
                      {" · "}
                      {file && (file.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Button
                    onClick={handleExtract}
                    size="lg"
                    className="gap-2 rounded-full px-8 font-display text-base font-bold shadow-lg"
                  >
                    <Sparkles className="h-5 w-5" />
                    Extract Event
                  </Button>
                </div>
              </motion.div>
            )}

            {/* EXTRACTING: Loading state */}
            {state === "extracting" && (
              <motion.div
                key="extracting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 rounded-2xl bg-card p-8 shadow-lg border border-border sm:p-12"
              >
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div className="text-center">
                  <p className="font-display text-lg font-bold text-foreground">
                    Reading screenshot…
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Our AI is extracting the event details
                  </p>
                </div>
              </motion.div>
            )}

            {/* RESULT: Show event + calendar link */}
            {state === "result" && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div className="rounded-2xl bg-card shadow-lg border border-border overflow-hidden">
                  {/* Color bar */}
                  <div className="h-2 bg-gradient-to-r from-primary via-accent to-secondary" />
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="font-display text-xl font-bold text-foreground">
                          {result.event.title}
                        </h2>
                        <p className="text-muted-foreground">
                          {formatDate(result.event.date)}
                        </p>
                        <p className="text-muted-foreground">
                          {formatTime(result.event.start_time)} –{" "}
                          {formatTime(result.event.end_time)}
                        </p>
                      </div>
                    </div>

                    {result.event.location && (
                      <div className="rounded-xl bg-muted/50 p-3">
                        <p className="text-sm font-medium text-foreground">📍 {result.event.location}</p>
                      </div>
                    )}

                    {result.event.description && (
                      <div className="rounded-xl bg-muted/50 p-3">
                        <p className="text-sm text-muted-foreground">{result.event.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <a
                    href={result.calendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 font-display text-lg font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-[1.02]"
                  >
                    <Calendar className="h-5 w-5" />
                    Open in Google Calendar
                  </a>
                  <button
                    onClick={clearFile}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Upload another screenshot
                  </button>
                </div>
              </motion.div>
            )}

            {/* ERROR */}
            {state === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 rounded-2xl bg-card p-6 shadow-lg border border-border sm:p-10"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                  <AlertCircle className="h-7 w-7 text-destructive" />
                </div>
                <div className="text-center">
                  <p className="font-display text-lg font-bold text-foreground">
                    {errorMsg || "We couldn't detect a meeting in this screenshot."}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try another one.
                  </p>
                </div>
                <Button
                  onClick={clearFile}
                  variant="outline"
                  className="gap-2 rounded-full"
                >
                  <RotateCcw className="h-4 w-4" />
                  Upload another screenshot
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        <p>Snap2Calendar · No sign-in required · Your screenshots are not stored</p>
      </footer>
    </div>
  );
};

export default Index;
