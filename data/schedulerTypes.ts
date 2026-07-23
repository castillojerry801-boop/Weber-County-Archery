export type DayOfWeek =
  | 'monday' | 'tuesday' | 'wednesday' | 'thursday'
  | 'friday' | 'saturday' | 'sunday';

export type TimeRange = {
  start: string;
  end: string;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  depositRequired: boolean;
};

export type Provider = {
  id: string;
  name: string;
  role: string;
  availableServices: string[];
};

export type CustomerField = {
  id: string;
  label: string;
  type: 'text' | 'tel' | 'email' | 'textarea';
  required: boolean;
};

export type SchedulerConfig = {
  businessName: string;
  title: string;
  description: string;
  slotDurationMinutes: number;
  bufferMinutes: number;
  requireProviderSelection: boolean;
  requirePayment: boolean;
  services: Service[];
  providers: Provider[];
  businessHours: Record<DayOfWeek, TimeRange[]>;
  blockedDates: string[];
  customerFields: CustomerField[];
  depositInstructions: string;
  paymentProvider: null | string;
  confirmationMessage: string;
  adminNotificationEmail: string;
};

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export type Booking = {
  id: string;
  serviceId: string;
  serviceName: string;
  providerId: string;
  providerName: string;
  date: string;
  time: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
  status: BookingStatus;
  createdAt: string;
};

export type SchedulerStep =
  | 'service' | 'provider' | 'date' | 'time' | 'info' | 'review' | 'done';
