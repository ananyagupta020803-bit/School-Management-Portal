import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { query, queryOne } from '@/lib/db';

export default async function StudentAttendance() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'student') {
    redirect('/login');
  }

  // Get student info
  const student = await queryOne<any>(
    `SELECT s.*, u.name 
     FROM students s 
     JOIN users u ON s.user_id = u.id 
     WHERE u.id = ?`,
    [session.user.id]
  );

  // Get attendance records
  const attendanceRecords = await query<any>(
    `SELECT a.*, c.name as class_name, c.section
     FROM attendance a
     JOIN classes c ON a.class_id = c.id
     WHERE a.student_id = ?
     ORDER BY a.date DESC
     LIMIT 30`,
    [student.id]
  );

  // Calculate statistics
  const stats = await queryOne<any>(
    `SELECT 
       COUNT(*) as total_days,
       SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
       SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
       SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days
     FROM attendance
     WHERE student_id = ?`,
    [student.id]
  );

  const attendancePercentage = stats?.total_days > 0
    ? ((stats.present_days / stats.total_days) * 100).toFixed(1)
    : 0;

  return (
<DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
          <p className="text-gray-600 mt-2">Track your attendance history</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Total Days</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_days || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Present</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats?.present_days || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Absent</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats?.absent_days || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Attendance %</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{attendancePercentage}%</p>
          </div>
        </div>

        {/* Attendance Records */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Recent Attendance (Last 30 Days)</h2>
          </div>
          <div className="p-6">
            {attendanceRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Day
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceRecords.map((record: any, index: number) => {
                      const date = new Date(record.date);
                      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                      
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {dayName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.status === 'present' ? 'bg-green-100 text-green-800' :
                              record.status === 'absent' ? 'bg-red-100 text-red-800' :
                              record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {record.remarks || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No attendance records available</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
