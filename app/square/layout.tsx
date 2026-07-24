import { requireStaff } from '@/lib/auth';

export default async function SquareLayout({ children }: { children: React.ReactNode }) {
  await requireStaff('/square');
  return <>{children}</>;
}
