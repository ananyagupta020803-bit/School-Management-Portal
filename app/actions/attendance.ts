'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function markAttendance(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'teacher') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const studentId = formData.get('studentId');
    const classId = formData.get('classId');
    const date = formData.get('date');
    const status = formData.get('status');
    const remarks = formData.get('remarks') || null;

    // Get teacher ID
    const [teacherResult] = await query<any>(
      'SELECT id FROM teachers WHERE user_id = ?',
      [session.user.id]
    );

    if (!teacherResult) {
      return { success: false, error: 'Teacher not found' };
    }

    // Check if attendance already exists for this date
    const [existing] = await query<any>(
      'SELECT id FROM attendance WHERE student_id = ? AND date = ?',
      [studentId, date]
    );

    if (existing) {
      // Update existing attendance
      await query(
        'UPDATE attendance SET status = ?, remarks = ?, marked_by = ? WHERE student_id = ? AND date = ?',
        [status, remarks, teacherResult.id, studentId, date]
      );
    } else {
      // Insert new attendance
      await query(
        `INSERT INTO attendance (student_id, class_id, date, status, marked_by, remarks)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [studentId, classId, date, status, teacherResult.id, remarks]
      );
    }

    revalidatePath('/teacher/attendance');
    revalidatePath('/student/attendance');

    return { success: true };
  } catch (error) {
    console.error('Error marking attendance:', error);
    return { success: false, error: 'Failed to mark attendance' };
  }
}

export async function bulkMarkAttendance(attendanceData: any[]) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'teacher') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Get teacher ID
    const [teacherResult] = await query<any>(
      'SELECT id FROM teachers WHERE user_id = ?',
      [session.user.id]
    );

    if (!teacherResult) {
      return { success: false, error: 'Teacher not found' };
    }

    // Process each attendance record
    for (const record of attendanceData) {
      const { studentId, classId, date, status } = record;

      // Check if attendance already exists
      const [existing] = await query<any>(
        'SELECT id FROM attendance WHERE student_id = ? AND date = ?',
        [studentId, date]
      );

      if (existing) {
        await query(
          'UPDATE attendance SET status = ?, marked_by = ? WHERE student_id = ? AND date = ?',
          [status, teacherResult.id, studentId, date]
        );
      } else {
        await query(
          `INSERT INTO attendance (student_id, class_id, date, status, marked_by)
           VALUES (?, ?, ?, ?, ?)`,
          [studentId, classId, date, status, teacherResult.id]
        );
      }
    }

    revalidatePath('/teacher/attendance');
    revalidatePath('/student/attendance');

    return { success: true };
  } catch (error) {
    console.error('Error marking bulk attendance:', error);
    return { success: false, error: 'Failed to mark attendance' };
  }
}
