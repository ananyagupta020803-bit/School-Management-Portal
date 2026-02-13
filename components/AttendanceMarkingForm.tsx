'use client';

import { useState, useOptimistic } from 'react';
import { bulkMarkAttendance } from '@/app/actions/attendance';

interface Class {
  id: number;
  name: string;
  section: string;
}

interface Student {
  id: number;
  student_id: string;
  name: string;
  status: string;
}

interface Props {
  classes: Class[];
  teacherId: number;
}

export default function AttendanceMarkingForm({ classes }: Props) {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [optimisticStudents, updateOptimisticStudents] = useOptimistic(
    students,
    (state, { studentId, status }: { studentId: number; status: string }) => {
      return state.map((student) =>
        student.id === studentId ? { ...student, status } : student
      );
    }
  );

  const loadStudents = async () => {
    if (!selectedClass) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const [className, section] = selectedClass.split('-');
      const response = await fetch(`/api/students?class=${className}&section=${section}&date=${selectedDate}`);
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load students' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (studentId: number, newStatus: string) => {
    // Optimistically update UI
    updateOptimisticStudents({ studentId, status: newStatus });

    // Update in database
    const classId = classes.find((c) => `${c.name}-${c.section}` === selectedClass)?.id;
    if (!classId) return;

    const formData = new FormData();
    formData.append('studentId', studentId.toString());
    formData.append('classId', classId.toString());
    formData.append('date', selectedDate);
    formData.append('status', newStatus);

    const result = await bulkMarkAttendance([
      {
        studentId,
        classId,
        date: selectedDate,
        status: newStatus,
      },
    ]);

    if (!result.success) {
      setMessage({ type: 'error', text: result.error || 'Failed to mark attendance' });
    }
  };

  const handleBulkSubmit = async (status: string) => {
    const classId = classes.find((c) => `${c.name}-${c.section}` === selectedClass)?.id;
    if (!classId) return;

    setIsLoading(true);
    setMessage(null);

    const attendanceData = optimisticStudents.map((student) => ({
      studentId: student.id,
      classId,
      date: selectedDate,
      status,
    }));

    // Optimistically update all students
    optimisticStudents.forEach((student) => {
      updateOptimisticStudents({ studentId: student.id, status });
    });

    const result = await bulkMarkAttendance(attendanceData);

    if (result.success) {
      setMessage({ type: 'success', text: 'Attendance marked successfully!' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to mark attendance' });
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`rounded-md p-4 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-2">
            Select Class
          </label>
          <select
            id="class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={`${cls.name}-${cls.section}`}>
                Class {cls.name}-{cls.section}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={loadStudents}
            disabled={!selectedClass || isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Loading...' : 'Load Students'}
          </button>
        </div>
      </div>

      {optimisticStudents.length > 0 && (
        <>
          <div className="flex gap-4 justify-end border-t pt-4">
            <button
              onClick={() => handleBulkSubmit('present')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Mark All Present
            </button>
            <button
              onClick={() => handleBulkSubmit('absent')}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Mark All Absent
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {optimisticStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.student_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusChange(student.id, 'present')}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            student.status === 'present'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => handleStatusChange(student.id, 'absent')}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            student.status === 'absent'
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-red-100'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => handleStatusChange(student.id, 'late')}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            student.status === 'late'
                              ? 'bg-yellow-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-yellow-100'
                          }`}
                        >
                          Late
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
