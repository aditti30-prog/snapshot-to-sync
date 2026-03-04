import { CreatedEvent } from './types';

const now = new Date();
const today = now.toISOString().split('T')[0];

export const MOCK_EVENTS: CreatedEvent[] = [
  {
    id: '1',
    title: 'Coffee chat with Sarah',
    start: `${today}T14:00:00`,
    end: `${today}T14:30:00`,
    location: 'Blue Bottle Coffee, SoMa',
    notes: 'Discuss Q2 roadmap ideas',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    calendarId: 'primary',
    googleLink: '#',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    colorIndex: 0,
  },
  {
    id: '2',
    title: 'Design review standup',
    start: new Date(Date.now() + 86400000 * 2).toISOString().replace(/T.*/, 'T10:00:00'),
    end: new Date(Date.now() + 86400000 * 2).toISOString().replace(/T.*/, 'T10:30:00'),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    calendarId: 'primary',
    googleLink: '#',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    colorIndex: 1,
  },
  {
    id: '3',
    title: 'Lunch with Alex & team',
    start: new Date(Date.now() - 86400000 * 3).toISOString().replace(/T.*/, 'T12:00:00'),
    end: new Date(Date.now() - 86400000 * 3).toISOString().replace(/T.*/, 'T13:00:00'),
    location: 'The Halal Guys',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    calendarId: 'primary',
    googleLink: '#',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    colorIndex: 2,
  },
  {
    id: '4',
    title: 'Product demo with investors',
    start: new Date(Date.now() + 86400000 * 5).toISOString().replace(/T.*/, 'T15:00:00'),
    end: new Date(Date.now() + 86400000 * 5).toISOString().replace(/T.*/, 'T16:00:00'),
    location: 'Zoom',
    notes: 'Prepare slide deck beforehand',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    calendarId: 'primary',
    googleLink: '#',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    colorIndex: 3,
  },
];
