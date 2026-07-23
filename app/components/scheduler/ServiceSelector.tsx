'use client';

import type { Service } from '@/data/schedulerTypes';

type Props = {
  services: Service[];
  selected: Service | null;
  onSelect: (service: Service) => void;
};

function formatPrice(price: number) {
  return price === 0 ? 'Free' : `$${price}`;
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h} hr${h > 1 ? 's' : ''}`;
}

export function ServiceSelector({ services, selected, onSelect }: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Choose a Service</h2>
      <div className="flex flex-col gap-3">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelect(service)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all min-h-[56px] ${
              selected?.id === service.id
                ? 'border-green-600 bg-green-50'
                : 'border-gray-200 hover:border-green-400 hover:bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="font-semibold text-gray-900">{service.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">{service.description}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-gray-900">{formatPrice(service.price)}</p>
                <p className="text-xs text-gray-400">{formatDuration(service.durationMinutes)}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
