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
    `SELECT t.*, u.name
     FROM teachers t
     JOIN users u ON t.user_id = u.id
     WHERE t.user_id = ?`,
    [session.user.id]
  );

  if (!teacher) {
    return (
      <DashboardLayout>
        <h1 className="text-xl font-bold">Teacher profile not found.</h1>
      </DashboardLayout>
    );
  }

  // Get ALL students (temporary working structure)
  const students = await query<any>(
    `SELECT s.id, s.student_id, u.name, s.class, s.section
     FROM students s
     JOIN users u ON s.user_id = u.id
     ORDER BY u.name`
  );

  // Get subjects
  const subjects = await query<any>(
    `SELECT * FROM subjects ORDER BY name`
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Upload Grades
          </h1>
          <p className="text-gray-600 mt-2">
            Add exam results for students
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">
              Add New Grade
            </h2>
          </div>

          <div className="p-6">
            <GradeUploadForm
              students={students}
              subjects={subjects}
              teacherId={teacher.id}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
