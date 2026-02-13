import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { query, queryOne } from '@/lib/db';
import { FileText, Users, CheckSquare } from 'lucide-react';

export default async function TeacherDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'teacher') {
    redirect('/login');
  }

  // Get teacher info
  const teacher = await queryOne<any>(
    `SELECT t.*, u.name, u.email
     FROM teachers t
     JOIN users u ON t.user_id = u.id
     WHERE u.id = ?`,
    [session.user.id]
  );

  if (!teacher) {
    return (
      <DashboardLayout>
        <h1 className="text-2xl font-bold">Teacher profile not found.</h1>
      </DashboardLayout>
    );
  }

  // Get total students in system (simple working version)
  const studentCount = await queryOne<any>(
    `SELECT COUNT(*) as count FROM students`
  );

  // Get recent grades uploaded by this teacher
const recentGrades = await query<any>(
  `SELECT g.*, s.name as subject_name,
          st.student_id,
          u.name as student_name
   FROM grades g
   JOIN subjects s ON g.subject_id = s.id
   JOIN students st ON g.student_id = st.id
   JOIN users u ON st.user_id = u.id
   ORDER BY g.created_at DESC
   LIMIT 5`
);


  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {teacher.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Subject: {teacher.subject}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">
                  {studentCount?.count || 0}
                </p>
              </div>
              <Users className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Subject</p>
                <p className="text-lg font-bold">
                  {teacher.subject}
                </p>
              </div>
              <FileText className="w-10 h-10 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="text-lg font-bold capitalize">
                  Teacher
                </p>
              </div>
              <CheckSquare className="w-10 h-10 text-green-500" />
            </div>
          </div>

        </div>

        {/* Recent Grades */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">
              Recently Uploaded Grades
            </h2>
          </div>

          <div className="p-6">
            {recentGrades.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-sm">Student</th>
                    <th className="px-4 py-2 text-left text-sm">Subject</th>
                    <th className="px-4 py-2 text-left text-sm">Marks</th>
                    <th className="px-4 py-2 text-left text-sm">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {recentGrades.map((grade: any, index: number) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2">{grade.student_name}</td>
                      <td className="px-4 py-2">{grade.subject_name}</td>
                      <td className="px-4 py-2">
                        {grade.marks}/{grade.max_marks}
                      </td>
                      <td className="px-4 py-2">{grade.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500 text-center">
                No grades uploaded yet
              </p>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
