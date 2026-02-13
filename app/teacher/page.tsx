import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { query, queryOne } from '@/lib/db';
import { FileText, Users, BarChart, CheckSquare } from 'lucide-react';

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

  // Get classes taught
  const classes = await query<any>(
    `SELECT DISTINCT c.id, c.name, c.section
     FROM classes c
     WHERE c.teacher_id = ?`,
    [teacher.id]
  );

  // Get total students
  const studentCount = await queryOne<any>(
    `SELECT COUNT(DISTINCT s.id) as count
     FROM students s
     JOIN classes c ON s.class = c.name AND s.section = c.section
     WHERE c.teacher_id = ?`,
    [teacher.id]
  );

  // Get recent grades uploaded
  const recentGrades = await query<any>(
    `SELECT g.*, s.name as subject_name, st.student_id, u.name as student_name
     FROM grades g
     JOIN subjects s ON g.subject_id = s.id
     JOIN students st ON g.student_id = st.id
     JOIN users u ON st.user_id = u.id
     WHERE g.teacher_id = ?
     ORDER BY g.created_at DESC
     LIMIT 5`,
    [teacher.id]
  );

  return (
<DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Teacher ID: {teacher.teacher_id} | Subject: {teacher.subject}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {studentCount?.count || 0}
                </p>
              </div>
              <Users className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Classes</p>
                <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
              </div>
              <CheckSquare className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Subject</p>
                <p className="text-lg font-bold text-gray-900">{teacher.subject}</p>
              </div>
              <FileText className="w-10 h-10 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Classes */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">My Classes</h2>
          </div>
          <div className="p-6">
            {classes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {classes.map((cls: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg text-gray-900">
                      Class {cls.name}-{cls.section}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Subject: {teacher.subject}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No classes assigned yet</p>
            )}
          </div>
        </div>

        {/* Recent Grades */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Recently Uploaded Grades</h2>
          </div>
          <div className="p-6">
            {recentGrades.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Exam Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Marks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Grade
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentGrades.map((grade: any, index: number) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {grade.student_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {grade.subject_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {grade.exam_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {grade.marks}/{grade.max_marks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {grade.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No grades uploaded yet</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/teacher/grades"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <FileText className="w-8 h-8 text-blue-500 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">Upload Grades</h3>
            <p className="text-sm text-gray-600 mt-1">Add student exam results</p>
          </a>

          <a
            href="/teacher/attendance"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <CheckSquare className="w-8 h-8 text-green-500 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">Mark Attendance</h3>
            <p className="text-sm text-gray-600 mt-1">Record student attendance</p>
          </a>

          <a
            href="/teacher/analytics"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <BarChart className="w-8 h-8 text-purple-500 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">View Analytics</h3>
            <p className="text-sm text-gray-600 mt-1">Class performance insights</p>
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}
