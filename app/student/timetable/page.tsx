import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { query, queryOne } from '@/lib/db';

export default async function StudentTimetable() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'student') {
    redirect('/login');
  }

  // Get student info
  const student = await queryOne<any>(
    `SELECT s.*, c.id as class_id
     FROM students s 
     JOIN users u ON s.user_id = u.id 
     JOIN classes c ON c.name = s.class AND c.section = s.section
     WHERE u.id = ?`,
    [session.user.id]
  );

  // Get timetable
  const timetable = await query<any>(
    `SELECT 
       t.day_of_week,
       t.start_time,
       t.end_time,
       t.room_number,
       s.name as subject_name,
       u.name as teacher_name
     FROM timetable t
     JOIN subjects s ON t.subject_id = s.id
     JOIN teachers te ON t.teacher_id = te.id
     JOIN users u ON te.user_id = u.id
     WHERE t.class_id = ?
     ORDER BY 
       FIELD(t.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
       t.start_time`,
    [student.class_id]
  );

  // Group by day
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timetableByDay = days.reduce((acc, day) => {
    acc[day] = timetable.filter((item: any) => item.day_of_week === day);
    return acc;
  }, {} as Record<string, any[]>);

  return (
<DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Timetable</h1>
          <p className="text-gray-600 mt-2">
            Class {student.class}-{student.section} Weekly Schedule
          </p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {days.map((day) => {
            const daySchedule = timetableByDay[day];
            return (
              <div key={day} className="border-b last:border-b-0">
                <div className="bg-gray-50 px-6 py-3">
                  <h3 className="text-lg font-semibold text-gray-900">{day}</h3>
                </div>
                <div className="p-6">
                  {daySchedule.length > 0 ? (
                    <div className="space-y-4">
                      {daySchedule.map((slot: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-blue-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {slot.subject_name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Teacher: {slot.teacher_name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                            </p>
                            <p className="text-sm text-gray-600">Room: {slot.room_number}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center">No classes scheduled</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
