import type { SchedulerConfig } from './schedulerTypes';

export const schedulerConfig: SchedulerConfig = {
  businessName: 'Weber County Archery Park',
  title: 'Book a Training Session',
  description: 'Schedule a lesson with one of our certified archery instructors.',
  slotDurationMinutes: 60,
  bufferMinutes: 0,
  requireProviderSelection: true,
  requirePayment: false,

  services: [
    {
      id: 'private-lesson',
      name: 'Private Lesson',
      description: 'One-on-one coaching tailored to your skill level. Beginner to advanced welcome.',
      durationMinutes: 60,
      price: 60,
      depositRequired: false,
    },
    {
      id: 'group-lesson',
      name: 'Group Lesson',
      description: 'Small group session (2–6 people). Great for families or friends.',
      durationMinutes: 60,
      price: 30,
      depositRequired: false,
    },
    {
      id: 'beginner-intro',
      name: 'Beginner Intro Class',
      description: "Never shot a bow? Start here. Covers safety, form, and basic technique.",
      durationMinutes: 90,
      price: 45,
      depositRequired: false,
    },
  ],

  providers: [
    {
      id: 'instructor-1',
      name: 'Coach Alex',
      role: 'Head Instructor',
      availableServices: ['private-lesson', 'group-lesson', 'beginner-intro'],
    },
    {
      id: 'instructor-2',
      name: 'Coach Morgan',
      role: 'Instructor',
      availableServices: ['private-lesson', 'beginner-intro'],
    },
    {
      id: 'instructor-3',
      name: 'Coach Riley',
      role: 'Instructor',
      availableServices: ['group-lesson', 'beginner-intro'],
    },
  ],

  // Indoor range hours: Tue–Fri 11am–8pm, Sat–Sun 9am–3pm, Mon closed
  businessHours: {
    monday:    [],
    tuesday:   [{ start: '11:00', end: '20:00' }],
    wednesday: [{ start: '11:00', end: '20:00' }],
    thursday:  [{ start: '11:00', end: '20:00' }],
    friday:    [{ start: '11:00', end: '20:00' }],
    saturday:  [{ start: '09:00', end: '15:00' }],
    sunday:    [{ start: '09:00', end: '15:00' }],
  },

  blockedDates: [] as string[],

  customerFields: [
    { id: 'name',  label: 'Full Name',     type: 'text',     required: true },
    { id: 'email', label: 'Email Address', type: 'email',    required: true },
    { id: 'phone', label: 'Phone Number',  type: 'tel',      required: true },
    { id: 'notes', label: 'Questions or Special Requests', type: 'textarea', required: false },
  ],

  depositInstructions: '',
  paymentProvider: null,

  confirmationMessage:
    "Your training request has been received! We'll confirm your session within 24 hours. See you at the range.",
  adminNotificationEmail: 'parksandrecinfo@co.weber.ut.us',
};
