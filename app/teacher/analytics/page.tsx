import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { query, queryOne } from '@/lib/db';
import AnalyticsCharts from '@/components/AnalyticsCharts';

export default async function TeacherAnalytics() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'teacher') {
    redirect('/login');
  }

  // Get teacher info
  const teacher = await queryOne<any>(
    'SELECT * FROM teachers WHERE user_id = ?',
    [session.user.id]
  );

  // Get grade distribution for teacher's subject
  const gradeDistribution = await query<any>(
    `SELECT 
       grade,
       COUNT(*) as count
     FROM grades
     WHERE teacher_id = ?
     GROUP BY grade
     ORDER BY grade`,
    [teacher.id]
  );

  // Get average marks by exam type
  const examTypeAverage = await query<any>(
    `SELECT 
       exam_type,
       AVG((marks / max_marks) * 100) as avg_percentage
     FROM grades
     WHERE teacher_id = ?
     GROUP BY exam_type`,
    [teacher.id]
  );

  // Get class performance
  const classPerformance = await query<any>(
    `SELECT 
       c.name as class_name,
       c.section,
       AVG((g.marks / g.max_marks) * 100) as avg_percentage,
       COUNT(DISTINCT g.student_id) as student_count
     FROM grades g
     JOIN students s ON g.student_id = s.id
     JOIN classes c ON s.class = c.name AND s.section = c.section
     WHERE g.teacher_id = ?
     GROUP BY c.name, c.section
     ORDER BY c.name, c.section`,
    [teacher.id]
  );

  // Get attendance statistics
  const attendanceStats = await query<any>(
    `SELECT 
       DATE_FORMAT(a.date, '%Y-%m') as month,
       SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present,
       SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent
     FROM attendance a
     WHERE a.marked_by = ?
     GROUP BY DATE_FORMAT(a.date, '%Y-%m')
     ORDER BY month DESC
     LIMIT 6`,
    [teacher.id]
  );

  return (
<DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Class Analytics</h1>
          <p className="text-gray-600 mt-2">Performance insights for your classes</p>
        </div>

        <AnalyticsCharts
          gradeDistribution={gradeDistribution}
          examTypeAverage={examTypeAverage}
          classPerformance={classPerformance}
          attendanceStats={attendanceStats}
        />
      </div>
    </DashboardLayout>
  );
}
