'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function addStudent(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const studentId = formData.get('studentId') as string;
    const className = formData.get('class') as string;
    const section = formData.get('section') as string;
    const rollNumber = formData.get('rollNumber') as string;

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Generate UUID manually
    const userId = uuidv4();

    // ✅ Insert user WITH id
    await query(
      'INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
      [userId, email, hashedPassword, name, 'student']
    );

    // ✅ Insert student using UUID
    await query(
      `INSERT INTO students (user_id, student_id, class, section, roll_number)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, studentId, className, section, parseInt(rollNumber)]
    );

    revalidatePath('/admin/students');
    return { success: true };
  } catch (error: any) {
    console.error('Error adding student:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return { success: false, error: 'Email or Student ID already exists' };
    }

    return { success: false, error: 'Failed to add student' };
  }
}

export async function addTeacher(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const teacherId = formData.get('teacherId') as string;
    const subject = formData.get('subject') as string;

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Generate UUID
    const userId = uuidv4();

    // ✅ Insert user WITH id
    await query(
      'INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
      [userId, email, hashedPassword, name, 'teacher']
    );

    // ✅ Insert teacher using UUID
    await query(
      'INSERT INTO teachers (user_id, employee_id, subject) VALUES (?, ?, ?)',
      [userId, teacherId, subject]
    );

    revalidatePath('/admin/teachers');
    return { success: true };
  } catch (error: any) {
    console.error('Error adding teacher:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return { success: false, error: 'Email or Teacher ID already exists' };
    }

    return { success: false, error: 'Failed to add teacher' };
  }
}

export async function deleteUser(userId: string, role: string) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await query('DELETE FROM users WHERE id = ?', [userId]);

    revalidatePath(`/admin/${role}s`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}
