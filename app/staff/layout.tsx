import { requireStaff } from '@/lib/auth';

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  await requireStaff('/staff');
  return <>{children}</>;
}
