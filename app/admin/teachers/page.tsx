import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { query } from '@/lib/db';
import AddTeacherForm from '@/components/AddTeacherForm';
import TeachersList from '@/components/TeachersList';

export default async function ManageTeachers() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  // Get all teachers
  const teachers = await query<any>(
    `SELECT t.*, u.name, u.email 
     FROM teachers t
     JOIN users u ON t.user_id = u.id
     ORDER BY u.name`
  );

return (
  <DashboardLayout>
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Teachers
        </h1>
      </div>

        {/* Add Teacher Form */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Add New Teacher</h2>
          </div>
          <div className="p-6">
            <AddTeacherForm />
          </div>
        </div>

        {/* Teachers List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">All Teachers</h2>
          </div>
          <div className="p-6">
            <TeachersList teachers={teachers} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
