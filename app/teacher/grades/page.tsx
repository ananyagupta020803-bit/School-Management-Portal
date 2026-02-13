import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { query, queryOne } from '@/lib/db';
import GradeUploadForm from '@/components/GradeUploadForm';

export default async function TeacherGrades() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'teacher') {
    redirect('/login');
  }

  // Get teacher info
  const teacher = await queryOne<any>(
    'SELECT * FROM teachers WHERE user_id = ?',
    [session.user.id]
  );

  // Get students from teacher's classes
  const students = await query<any>(
    `SELECT DISTINCT s.id, s.student_id, u.name, s.class, s.section
     FROM students s
     JOIN users u ON s.user_id = u.id
     JOIN classes c ON s.class = c.name AND s.section = c.section
     WHERE c.teacher_id = ?
     ORDER BY u.name`,
    [teacher.id]
  );

  // Get subjects
  const subjects = await query<any>(
    'SELECT * FROM subjects ORDER BY name'
  );

  return (
<DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload Grades</h1>
          <p className="text-gray-600 mt-2">Add exam results for your students</p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Add New Grade</h2>
          </div>
          <div className="p-6">
            <GradeUploadForm students={students} subjects={subjects} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
