'use client';

import { useState } from 'react';
import { schedulerConfig } from '@/data/schedulerConfig';
import type { Service, Provider, SchedulerStep } from '@/data/schedulerTypes';
import { ServiceSelector } from './ServiceSelector';
import { ProviderSelector } from './ProviderSelector';
import { DateSelector } from './DateSelector';
import { TimeSlotSelector } from './TimeSlotSelector';
import { CustomerInfoForm } from './CustomerInfoForm';
import { BookingReview } from './BookingReview';
import { BookingConfirmation } from './BookingConfirmation';

type Selection = {
  service: Service | null;
  provider: Provider | null;
  date: string | null;
  time: string | null;
  customerInfo: Record<string, string>;
};

const STEP_LABELS: Record<SchedulerStep, string> = {
  service:  'Service',
  provider: 'Instructor',
  date:     'Date',
  time:     'Time',
  info:     'Your Info',
  review:   'Review',
  done:     'Done',
};

function buildFlow(requireProvider: boolean): SchedulerStep[] {
  const flow: SchedulerStep[] = ['service'];
  if (requireProvider) flow.push('provider');
  flow.push('date', 'time', 'info', 'review', 'done');
  return flow;
}

export function SchedulerContainer() {
  const flow = buildFlow(schedulerConfig.requireProviderSelection);
  const [stepIdx, setStepIdx] = useState(0);
  const currentStep = flow[stepIdx];

  const [selection, setSelection] = useState<Selection>({
    service: null, provider: null, date: null, time: null, customerInfo: {},
  });
  const [submitting, setSubmitting] = useState(false);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  const goNext = () => setStepIdx((i) => Math.min(i + 1, flow.length - 1));
  const goBack = () => setStepIdx((i) => Math.max(i - 1, 0));
  const goTo = (step: SchedulerStep) => {
    const idx = flow.indexOf(step);
    if (idx !== -1) setStepIdx(idx);
  };

  async function handleSubmit() {
    const { service, provider, date, time, customerInfo } = selection;
    if (!service || !date || !time) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          serviceName: service.name,
          providerId: provider?.id ?? 'any',
          providerName: provider?.name ?? 'Any Instructor',
          date,
          time,
          customerName: customerInfo.name ?? '',
          customerEmail: customerInfo.email ?? '',
          customerPhone: customerInfo.phone ?? '',
          notes: customerInfo.notes ?? '',
        }),
      });
      const booking = await res.json();
      setConfirmedId(booking.id);
      goNext();
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setSelection({ service: null, provider: null, date: null, time: null, customerInfo: {} });
    setConfirmedId(null);
    setStepIdx(0);
  }

  const indicatorFlow = flow.filter((s) => s !== 'done');

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">{schedulerConfig.title}</h1>
        <p className="mt-1 text-sm text-gray-500">{schedulerConfig.description}</p>
      </div>

      {currentStep !== 'done' && (
        <StepIndicator flow={indicatorFlow} current={currentStep} />
      )}

      <div className="mt-8">
        {currentStep === 'service' && (
          <ServiceSelector
            services={schedulerConfig.services}
            selected={selection.service}
            onSelect={(service) => {
              setSelection((s) => ({ ...s, service, provider: null, date: null, time: null }));
              goNext();
            }}
          />
        )}

        {currentStep === 'provider' && (
          <ProviderSelector
            providers={schedulerConfig.providers.filter((p) =>
              selection.service ? p.availableServices.includes(selection.service.id) : true,
            )}
            selected={selection.provider}
            onSelect={(provider) => {
              setSelection((s) => ({ ...s, provider, date: null, time: null }));
              goNext();
            }}
            onBack={goBack}
          />
        )}

        {currentStep === 'date' && (
          <DateSelector
            businessHours={schedulerConfig.businessHours}
            blockedDates={schedulerConfig.blockedDates}
            selected={selection.date}
            onSelect={(date) => {
              setSelection((s) => ({ ...s, date, time: null }));
              goNext();
            }}
            onBack={goBack}
          />
        )}

        {currentStep === 'time' && selection.date && (
          <TimeSlotSelector
            date={selection.date}
            businessHours={schedulerConfig.businessHours}
            slotDurationMinutes={schedulerConfig.slotDurationMinutes}
            bufferMinutes={schedulerConfig.bufferMinutes}
            selected={selection.time}
            onSelect={(time) => {
              setSelection((s) => ({ ...s, time }));
              goNext();
            }}
            onBack={goBack}
          />
        )}

        {currentStep === 'info' && (
          <CustomerInfoForm
            fields={schedulerConfig.customerFields}
            values={selection.customerInfo}
            onChange={(customerInfo) => setSelection((s) => ({ ...s, customerInfo }))}
            onSubmit={goNext}
            onBack={goBack}
          />
        )}

        {currentStep === 'review' && selection.service && selection.date && selection.time && (
          <BookingReview
            service={selection.service}
            provider={selection.provider}
            date={selection.date}
            time={selection.time}
            customerInfo={selection.customerInfo}
            onEdit={goTo}
            onConfirm={handleSubmit}
            onBack={goBack}
            submitting={submitting}
          />
        )}

        {currentStep === 'done' && (
          <BookingConfirmation
            message={schedulerConfig.confirmationMessage}
            bookingId={confirmedId}
            onBookAnother={reset}
          />
        )}
      </div>
    </div>
  );
}

function StepIndicator({ flow, current }: { flow: SchedulerStep[]; current: SchedulerStep }) {
  const currentIdx = flow.indexOf(current);
  return (
    <nav aria-label="Booking progress" className="flex items-center justify-center gap-1 flex-wrap">
      {flow.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step} className="flex items-center gap-1">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold shrink-0 transition-colors ${
                done
                  ? 'bg-green-600 text-white'
                  : active
                  ? 'bg-green-700 text-white ring-2 ring-green-300 ring-offset-1'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {done ? '✓' : i + 1}
            </div>
            <span
              className={`text-xs hidden sm:block whitespace-nowrap ${
                active ? 'text-green-700 font-semibold' : done ? 'text-gray-600' : 'text-gray-400'
              }`}
            >
              {STEP_LABELS[step]}
            </span>
            {i < flow.length - 1 && (
              <div className={`w-4 h-px shrink-0 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </nav>
  );
}
