import DashboardLayout from '@/components/DashboardLayout';
import { requireRole } from '@/lib/requireRole';
import { UserRole } from '@/lib/roles';

export default async function AdminDashboard() {
  const session = await requireRole([UserRole.ADMIN]);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold">
        Welcome {session.user.name}
      </h1>
    </DashboardLayout>
  );
}
