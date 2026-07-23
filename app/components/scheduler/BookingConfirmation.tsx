'use client';

type Props = {
  message: string;
  bookingId: string | null;
  onBookAnother: () => void;
};

export function BookingConfirmation({ message, bookingId, onBookAnother }: Props) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
      <p className="text-gray-500 max-w-sm mx-auto mb-2">{message}</p>
      {bookingId && (
        <p className="text-xs text-gray-400 mb-6 font-mono">Ref: {bookingId.slice(0, 8).toUpperCase()}</p>
      )}
      <button
        onClick={onBookAnother}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-6 py-3 min-h-[44px] transition-colors"
      >
        Book Another
      </button>
    </div>
  );
}
