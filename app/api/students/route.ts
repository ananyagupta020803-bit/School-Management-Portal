import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const className = searchParams.get('class');
  const section = searchParams.get('section');
  const date = searchParams.get('date');

  if (!className || !section || !date) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    // Get students with their attendance status for the given date
    const students = await query<any>(
      `SELECT 
        s.id,
        s.student_id,
        u.name,
        COALESCE(a.status, 'present') as status
       FROM students s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN attendance a ON s.id = a.student_id AND a.date = ?
       WHERE s.class = ? AND s.section = ?
       ORDER BY s.roll_number, u.name`,
      [date, className, section]
    );

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}
