import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { query, queryOne } from '@/lib/db';
import { BookOpen, Calendar, FileText, CheckSquare } from 'lucide-react';

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'student') {
    redirect('/login');
  }

  // Get student info
  const student = await queryOne<any>(
    `SELECT s.*, u.name, u.email 
     FROM students s 
     JOIN users u ON s.user_id = u.id 
     WHERE u.id = ?`,
    [session.user.id]
  );

  // Get recent grades
  const recentGrades = await query<any>(
    `SELECT g.*, s.name as subject_name, g.marks, g.max_marks, g.grade
     FROM grades g
     JOIN subjects s ON g.subject_id = s.id
     WHERE g.student_id = ?
     ORDER BY g.created_at DESC
     LIMIT 5`,
    [student.id]
  );

  // Get attendance stats
  const attendanceStats = await queryOne<any>(
    `SELECT 
       COUNT(*) as total_days,
       SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
       SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days
     FROM attendance
     WHERE student_id = ?`,
    [student.id]
  );

  const attendancePercentage = attendanceStats?.total_days > 0
    ? ((attendanceStats.present_days / attendanceStats.total_days) * 100).toFixed(1)
    : 0;

  return (
<DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Student ID: {student.student_id} | Class: {student.class}-{student.section}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Class</p>
                <p className="text-2xl font-bold text-gray-900">
                  {student.class}-{student.section}
                </p>
              </div>
              <BookOpen className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Roll Number</p>
                <p className="text-2xl font-bold text-gray-900">{student.roll_number}</p>
              </div>
              <Calendar className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance</p>
                <p className="text-2xl font-bold text-gray-900">{attendancePercentage}%</p>
              </div>
              <CheckSquare className="w-10 h-10 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Subjects</p>
                <p className="text-2xl font-bold text-gray-900">{recentGrades.length}</p>
              </div>
              <FileText className="w-10 h-10 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Recent Grades */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Recent Grades</h2>
          </div>
          <div className="p-6">
            {recentGrades.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
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
              <p className="text-gray-500 text-center py-4">No grades available yet</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/student/timetable"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <Calendar className="w-8 h-8 text-blue-500 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">View Timetable</h3>
            <p className="text-sm text-gray-600 mt-1">Check your class schedule</p>
          </a>

          <a
            href="/student/grades"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <FileText className="w-8 h-8 text-green-500 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">All Grades</h3>
            <p className="text-sm text-gray-600 mt-1">View all your exam results</p>
          </a>

          <a
            href="/student/attendance"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <CheckSquare className="w-8 h-8 text-purple-500 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">Attendance</h3>
            <p className="text-sm text-gray-600 mt-1">Track your attendance</p>
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}
