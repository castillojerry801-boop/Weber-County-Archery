import { requireStaff } from '@/lib/auth';

export default async function KioskLayout({ children }: { children: React.ReactNode }) {
  await requireStaff('/kiosk');
  return <>{children}</>;
}
