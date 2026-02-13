'use client';

import { useState } from 'react';
import { uploadGrade } from '@/app/actions/grades';

interface Student {
  id: number;
  student_id: string;
  name: string;
  class: string;
  section: string;
}

interface Subject {
  id: number;
  name: string;
  code: string;
}

interface Props {
  students: Student[];
  subjects: Subject[];
}

export default function GradeUploadForm({ students, subjects }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await uploadGrade(formData);

    if (result.success) {
      setMessage({ type: 'success', text: 'Grade uploaded successfully!' });
      (e.target as HTMLFormElement).reset();
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to upload grade' });
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`rounded-md p-4 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
            Student
          </label>
          <select
            id="studentId"
            name="studentId"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} ({student.student_id}) - Class {student.class}-{student.section}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="subjectId" className="block text-sm font-medium text-gray-700 mb-2">
            Subject
          </label>
          <select
            id="subjectId"
            name="subjectId"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name} ({subject.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="examType" className="block text-sm font-medium text-gray-700 mb-2">
            Exam Type
          </label>
          <select
            id="examType"
            name="examType"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select exam type</option>
            <option value="midterm">Midterm</option>
            <option value="final">Final</option>
            <option value="quiz">Quiz</option>
            <option value="assignment">Assignment</option>
          </select>
        </div>

        <div>
          <label htmlFor="examDate" className="block text-sm font-medium text-gray-700 mb-2">
            Exam Date
          </label>
          <input
            type="date"
            id="examDate"
            name="examDate"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="marks" className="block text-sm font-medium text-gray-700 mb-2">
            Marks Obtained
          </label>
          <input
            type="number"
            id="marks"
            name="marks"
            required
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 85"
          />
        </div>

        <div>
          <label htmlFor="maxMarks" className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Marks
          </label>
          <input
            type="number"
            id="maxMarks"
            name="maxMarks"
            required
            min="1"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 100"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Uploading...' : 'Upload Grade'}
        </button>
      </div>
    </form>
  );
}
