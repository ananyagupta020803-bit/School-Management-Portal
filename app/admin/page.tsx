import DashboardLayout from '@/components/DashboardLayout';
import { requireRole } from '@/lib/requireRole';
import { UserRole } from '@/lib/roles';

export default async function AdminDashboard() {
  const session = await requireRole([UserRole.ADMIN]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">
          Welcome {session.user.name}
        </h1>

        <p className="text-gray-600">
          You are logged in as ADMIN.
        </p>
      </div>
    </DashboardLayout>
  );
}
