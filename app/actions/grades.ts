'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function uploadGrade(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'teacher') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const studentId = formData.get('studentId');
    const subjectId = formData.get('subjectId');
    const examType = formData.get('examType');
    const marks = parseFloat(formData.get('marks') as string);
    const maxMarks = parseFloat(formData.get('maxMarks') as string);
    const examDate = formData.get('examDate');

    // Calculate grade
    const percentage = (marks / maxMarks) * 100;
    let grade = '';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 40) grade = 'D';
    else grade = 'F';

    // Get teacher ID
    const [teacherResult] = await query<any>(
      'SELECT id FROM teachers WHERE user_id = ?',
      [session.user.id]
    );

    if (!teacherResult) {
      return { success: false, error: 'Teacher not found' };
    }

    // Insert grade
    await query(
      `INSERT INTO grades (student_id, subject_id, teacher_id, exam_type, marks, max_marks, grade, exam_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [studentId, subjectId, teacherResult.id, examType, marks, maxMarks, grade, examDate]
    );

    revalidatePath('/teacher/grades');
    revalidatePath('/student/grades');

    return { success: true };
  } catch (error) {
    console.error('Error uploading grade:', error);
    return { success: false, error: 'Failed to upload grade' };
  }
}
