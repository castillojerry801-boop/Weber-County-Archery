import { requireStaff } from '@/lib/auth';

export default async function TrainerLayout({ children }: { children: React.ReactNode }) {
  await requireStaff('/trainer');
  return <>{children}</>;
}
