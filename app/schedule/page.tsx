import { SchedulerContainer } from '@/app/components/scheduler';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book a Session — Weber County Archery Park',
};

export default function SchedulePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 py-3 px-4 text-center">
        <span className="text-sm text-gray-500 font-medium">Weber County Archery Park</span>
      </div>
      <SchedulerContainer />
    </main>
  );
}
