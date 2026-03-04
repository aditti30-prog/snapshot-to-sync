import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, CalendarDays, History } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import EventCard from '@/components/EventCard';
import MiniCalendar from '@/components/MiniCalendar';
import { MOCK_EVENTS } from '@/lib/mock-data';
import { isPast, parseISO } from 'date-fns';

const Dashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('upcoming');

  const upcoming = useMemo(
    () => MOCK_EVENTS.filter((e) => !isPast(parseISO(e.end))),
    []
  );
  const past = useMemo(
    () => MOCK_EVENTS.filter((e) => isPast(parseISO(e.end))),
    []
  );

  const displayedEvents = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="min-h-screen bg-background">
      <Header
        isLoggedIn
        userName="Demo User"
        onLogout={() => navigate('/')}
      />

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Main content */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h1 className="font-display text-2xl font-800 text-foreground">Your Events</h1>
              <Button
                onClick={() => navigate('/upload')}
                className="gap-2 rounded-full bg-primary font-display font-700 text-primary-foreground hover:bg-primary/90"
              >
                <Camera className="h-4 w-4" />
                New Snap
              </Button>
            </div>

            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="mb-4 rounded-full bg-muted p-1">
                <TabsTrigger
                  value="upcoming"
                  className="gap-2 rounded-full font-display font-600 data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  <CalendarDays className="h-4 w-4" />
                  Upcoming
                </TabsTrigger>
                <TabsTrigger
                  value="past"
                  className="gap-2 rounded-full font-display font-600 data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  <History className="h-4 w-4" />
                  Past
                </TabsTrigger>
              </TabsList>

              <TabsContent value={tab}>
                {displayedEvents.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center py-16 text-center"
                  >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <Camera className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="font-display text-lg font-700 text-foreground">
                      No {tab} events yet
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Upload a screenshot to create your first event
                    </p>
                    <Button
                      onClick={() => navigate('/upload')}
                      className="mt-4 rounded-full bg-primary font-display font-600 text-primary-foreground"
                    >
                      Upload Screenshot
                    </Button>
                  </motion.div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {displayedEvents.map((event, i) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                      >
                        <EventCard
                          event={event}
                          onClick={() => navigate(`/event/${event.id}`)}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <MiniCalendar events={MOCK_EVENTS} />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
