'use client';

import { useState } from 'react';
import type { CustomerField } from '@/data/schedulerTypes';

type Props = {
  fields: CustomerField[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
  onSubmit: () => void;
  onBack: () => void;
};

export function CustomerInfoForm({ fields, values, onChange, onSubmit, onBack }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleChange(id: string, value: string) {
    onChange({ ...values, [id]: value });
    if (errors[id]) setErrors((e) => ({ ...e, [id]: '' }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    for (const field of fields) {
      if (field.required && !values[field.id]?.trim()) {
        next[field.id] = `${field.label} is required`;
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Information</h2>
      <div className="flex flex-col gap-4">
        {fields.map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                value={values[field.id] ?? ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                rows={3}
                placeholder={field.label}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            ) : (
              <input
                type={field.type}
                value={values[field.id] ?? ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                placeholder={field.label}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[44px]"
              />
            )}
            {errors[field.id] && (
              <p className="text-xs text-red-500 mt-1">{errors[field.id]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onBack}
          className="px-4 text-sm text-gray-500 hover:text-gray-700 min-h-[44px]"
        >
          ← Back
        </button>
        <button
          type="submit"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-4 min-h-[44px] transition-colors"
        >
          Continue
        </button>
      </div>
    </form>
  );
}
