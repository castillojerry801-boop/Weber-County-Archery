'use client';

import type { Provider } from '@/data/schedulerTypes';

type Props = {
  providers: Provider[];
  selected: Provider | null;
  onSelect: (provider: Provider) => void;
  onBack: () => void;
};

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('');
}

export function ProviderSelector({ providers, selected, onSelect, onBack }: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Choose an Instructor</h2>
      <div className="flex flex-col gap-3">
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => onSelect(provider)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all min-h-[56px] ${
              selected?.id === provider.id
                ? 'border-green-600 bg-green-50'
                : 'border-gray-200 hover:border-green-400 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm shrink-0">
                {initials(provider.name)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{provider.name}</p>
                <p className="text-sm text-gray-500">{provider.role}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      <BackButton onClick={onBack} />
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mt-6 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 min-h-[44px]"
    >
      ← Back
    </button>
  );
}
