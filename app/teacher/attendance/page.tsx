import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { query, queryOne } from '@/lib/db';
import AttendanceMarkingForm from '@/components/AttendanceMarkingForm';

export default async function TeacherAttendance() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'teacher') {
    redirect('/login');
  }

  // Get teacher info
  const teacher = await queryOne<any>(
    'SELECT * FROM teachers WHERE user_id = ?',
    [session.user.id]
  );

  // Get teacher's classes
  const classes = await query<any>(
    'SELECT * FROM classes WHERE teacher_id = ? ORDER BY name, section',
    [teacher.id]
  );

  return (
<DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
          <p className="text-gray-600 mt-2">Record student attendance for your classes</p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Select Class and Date</h2>
          </div>
          <div className="p-6">
            <AttendanceMarkingForm classes={classes} teacherId={teacher.id} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
