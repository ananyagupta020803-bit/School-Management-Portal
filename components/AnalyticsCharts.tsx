'use client';

import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
  gradeDistribution: any[];
  examTypeAverage: any[];
  classPerformance: any[];
  attendanceStats: any[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnalyticsCharts({
  gradeDistribution,
  examTypeAverage,
  classPerformance,
  attendanceStats,
}: Props) {
  // Transform data for charts
  const gradeData = gradeDistribution.map((item) => ({
    grade: item.grade,
    count: parseInt(item.count),
  }));

  const examData = examTypeAverage.map((item) => ({
    type: item.exam_type.charAt(0).toUpperCase() + item.exam_type.slice(1),
    average: parseFloat(item.avg_percentage).toFixed(1),
  }));

  const classData = classPerformance.map((item) => ({
    class: `${item.class_name}-${item.section}`,
    average: parseFloat(item.avg_percentage).toFixed(1),
    students: parseInt(item.student_count),
  }));

  const attendanceData = attendanceStats.reverse().map((item) => ({
    month: item.month,
    present: parseInt(item.present),
    absent: parseInt(item.absent),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Grade Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={gradeData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.grade}: ${entry.count}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {gradeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Exam Type Average */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Average by Exam Type</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={examData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Bar dataKey="average" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Class Performance */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={classData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="class" />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(value, name) => 
              name === 'average' ? `${value}%` : value
            } />
            <Legend />
            <Bar dataKey="average" fill="#10b981" name="Average %" />
            <Bar dataKey="students" fill="#f59e0b" name="Students" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Attendance Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trends (Last 6 Months)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={attendanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="present" fill="#10b981" name="Present" />
            <Bar dataKey="absent" fill="#ef4444" name="Absent" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
