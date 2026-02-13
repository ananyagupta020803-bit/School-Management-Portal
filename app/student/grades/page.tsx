import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { query, queryOne } from '@/lib/db';
import DownloadReportButton from '@/components/DownloadReportButton';

// Enable ISR - revalidate every 60 seconds
export const revalidate = 60;

export default async function StudentGrades() {
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

  // Get all grades
  const grades = await query<any>(
    `SELECT g.*, s.name as subject_name, s.code as subject_code
     FROM grades g
     JOIN subjects s ON g.subject_id = s.id
     WHERE g.student_id = ?
     ORDER BY g.exam_date DESC`,
    [student.id]
  );

  // Calculate statistics
  const stats = {
    totalExams: grades.length,
    averagePercentage: grades.length > 0
      ? (grades.reduce((sum: number, g: any) => sum + (g.marks / g.max_marks) * 100, 0) / grades.length).toFixed(2)
      : 0,
    highestScore: grades.length > 0
      ? Math.max(...grades.map((g: any) => (g.marks / g.max_marks) * 100)).toFixed(2)
      : 0,
  };

  return (
<DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Grades</h1>
            <p className="text-gray-600 mt-2">View all your exam results and performance</p>
          </div>
          <DownloadReportButton 
            studentId={student.id} 
            studentName={student.name}
            grades={grades}
          />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Total Exams</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalExams}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Average Percentage</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.averagePercentage}%</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Highest Score</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.highestScore}%</p>
          </div>
        </div>

        {/* Grades Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">All Grades</h2>
          </div>
          <div className="p-6">
            {grades.length > 0 ? (
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
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Marks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Percentage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Grade
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {grades.map((grade: any, index: number) => {
                      const percentage = ((grade.marks / grade.max_marks) * 100).toFixed(2);
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {grade.subject_name}
                            </div>
                            <div className="text-sm text-gray-500">{grade.subject_code}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                            {grade.exam_type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(grade.exam_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {grade.marks} / {grade.max_marks}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {percentage}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              grade.grade.startsWith('A') ? 'bg-green-100 text-green-800' :
                              grade.grade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                              grade.grade.startsWith('C') ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {grade.grade}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No grades available yet</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
