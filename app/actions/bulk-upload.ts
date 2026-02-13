'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

interface UserData {
  name: string;
  email: string;
  password: string;
  role: string;
  student_id?: string;
  teacher_id?: string;
  class?: string;
  section?: string;
  roll_number?: string;
  subject?: string;
  qualification?: string;
  phone?: string;
}

export async function bulkUploadUsers(users: UserData[]) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }

  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const user of users) {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Insert user
      const userResult = await query(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        [user.email, hashedPassword, user.name, user.role]
      );

      const userId = (userResult as any).insertId;

      // Insert role-specific data
      if (user.role === 'student') {
        await query(
          `INSERT INTO students (user_id, student_id, class, section, roll_number, phone)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            userId,
            user.student_id,
            user.class,
            user.section,
            user.roll_number ? parseInt(user.roll_number) : null,
            user.phone || null,
          ]
        );
      } else if (user.role === 'teacher') {
        await query(
          'INSERT INTO teachers (user_id, teacher_id, subject, qualification, phone) VALUES (?, ?, ?, ?, ?)',
          [userId, user.teacher_id, user.subject, user.qualification || null, user.phone || null]
        );
      }

      results.success++;
    } catch (error: any) {
      results.failed++;
      results.errors.push(`${user.email}: ${error.message}`);
    }
  }

  return { success: true, results };
}
