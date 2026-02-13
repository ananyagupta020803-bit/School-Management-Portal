import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { query } from '@/lib/db';
import AddStudentForm from '@/components/AddStudentForm';
import StudentsList from '@/components/StudentsList';

export default async function ManageStudents() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  // Get all students
  const students = await query<any>(
    `SELECT s.*, u.name, u.email 
     FROM students s
     JOIN users u ON s.user_id = u.id
     ORDER BY s.class, s.section, s.roll_number`
  );

  return (
<DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Students</h1>
          <p className="text-gray-600 mt-2">Add, view, or remove students</p>
        </div>

        {/* Add Student Form */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Add New Student</h2>
          </div>
          <div className="p-6">
            <AddStudentForm />
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">All Students</h2>
          </div>
          <div className="p-6">
            <StudentsList students={students} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
