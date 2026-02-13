import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { query, queryOne } from '@/lib/db';
import { UserRole } from '@/lib/roles';
import { BookOpen, Calendar, FileText, CheckSquare } from 'lucide-react';

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);

  // ✅ FIXED ROLE CHECK (UPPERCASE)
  if (!session || session.user.role !== UserRole.STUDENT) {
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

  if (!student) {
    redirect('/login');
  }

  // Get recent grades
  const recentGrades = await query<any>(
    `SELECT g.*, s.name as subject_name
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

  const attendancePercentage =
    attendanceStats?.total_days > 0
      ? (
          (attendanceStats.present_days /
            attendanceStats.total_days) *
          100
        ).toFixed(1)
      : '0';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Student ID: {student.student_id} | Class:{' '}
            {student.class}-{student.section}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Class"
            value={`${student.class}-${student.section}`}
            icon={<BookOpen className="w-10 h-10 text-blue-500" />}
          />

          <StatCard
            title="Roll Number"
            value={student.roll_number}
            icon={<Calendar className="w-10 h-10 text-green-500" />}
          />

          <StatCard
            title="Attendance"
            value={`${attendancePercentage}%`}
            icon={<CheckSquare className="w-10 h-10 text-purple-500" />}
          />

          <StatCard
            title="Subjects"
            value={recentGrades.length}
            icon={<FileText className="w-10 h-10 text-orange-500" />}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: any;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {value}
          </p>
        </div>
        {icon}
      </div>
    </div>
  );
}
