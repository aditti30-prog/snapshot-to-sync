import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload as UploadIcon, Image, Sparkles, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import type { EventCandidate } from '@/lib/types';

const MOCK_EXTRACTION: EventCandidate[] = [
  {
    title: 'Coffee with Jordan',
    start: { date: '2026-03-10', time: '14:00' },
    end: null,
    duration_minutes: null,
    timezone: null,
    location: 'Starbucks on 5th Ave',
    notes: 'Catch up about the new project',
    confidence: { title: 0.95, start: 0.9, end_or_duration: 0.3, timezone: 0.2, location: 0.85, notes: 0.7 },
    evidence: { matched_text_snippets: ['coffee tomorrow at 2pm', 'Starbucks on 5th'] },
  },
];

const Upload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleExtract = async () => {
    setIsExtracting(true);
    // TODO: call actual extraction edge function
    await new Promise((r) => setTimeout(r, 2000));
    setIsExtracting(false);
    // Navigate to confirm with mock data
    navigate('/confirm', {
      state: {
        events: MOCK_EXTRACTION,
        screenshotUrl: preview,
      },
    });
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn userName="Demo User" onLogout={() => navigate('/')} />

      <main className="container mx-auto max-w-lg px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="font-display text-3xl font-800 text-foreground">
            Upload a <span className="text-primary">Screenshot</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Snap a conversation and we'll find the event details
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-8"
        >
          <AnimatePresence mode="wait">
            {!preview ? (
              <motion.label
                key="picker"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-primary/30 bg-card p-12 transition-colors hover:border-primary/60 hover:bg-primary/5"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Image className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-display text-lg font-700 text-foreground">
                    Choose a screenshot
                  </p>
                  <p className="text-sm text-muted-foreground">PNG, JPG or JPEG</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpg,image/jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </motion.label>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="relative overflow-hidden rounded-2xl bg-card shadow-lg"
              >
                <button
                  onClick={clearFile}
                  className="absolute right-3 top-3 z-10 rounded-full bg-foreground/80 p-1.5 text-background transition-colors hover:bg-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
                <img
                  src={preview}
                  alt="Screenshot preview"
                  className="max-h-96 w-full object-contain"
                />
                <div className="border-t border-border p-4">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-600 text-foreground">{file?.name}</span>
                    {' · '}
                    {file && (file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {preview && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 flex justify-center"
            >
              <Button
                onClick={handleExtract}
                disabled={isExtracting}
                size="lg"
                className="gap-2 rounded-full bg-primary px-8 font-display text-base font-700 text-primary-foreground shadow-lg hover:bg-primary/90"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Extracting…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Extract Events
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Upload;
