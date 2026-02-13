'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Grade {
  subject_name: string;
  subject_code: string;
  exam_type: string;
  marks: number;
  max_marks: number;
  grade: string;
  exam_date: string;
}

interface Props {
  studentId: number;
  studentName: string;
  grades: Grade[];
}

export default function DownloadReportButton({ studentId, studentName, grades }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = () => {
    setIsGenerating(true);

    try {
      const doc = new jsPDF();

      // Add header
      doc.setFontSize(20);
      doc.text('School Management Portal', 105, 15, { align: 'center' });
      
      doc.setFontSize(16);
      doc.text('Student Report Card', 105, 25, { align: 'center' });

      // Add student info
      doc.setFontSize(12);
      doc.text(`Student Name: ${studentName}`, 20, 40);
      doc.text(`Student ID: STU${String(studentId).padStart(3, '0')}`, 20, 47);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 54);

      // Calculate statistics
      const avgPercentage = grades.length > 0
        ? (grades.reduce((sum, g) => sum + (g.marks / g.max_marks) * 100, 0) / grades.length).toFixed(2)
        : '0';

      doc.text(`Average Percentage: ${avgPercentage}%`, 20, 61);

      // Prepare table data
      const tableData = grades.map((grade) => [
        grade.subject_name,
        grade.exam_type.charAt(0).toUpperCase() + grade.exam_type.slice(1),
        new Date(grade.exam_date).toLocaleDateString(),
        `${grade.marks}/${grade.max_marks}`,
        `${((grade.marks / grade.max_marks) * 100).toFixed(2)}%`,
        grade.grade,
      ]);

      // Add table
      autoTable(doc, {
        startY: 70,
        head: [['Subject', 'Exam Type', 'Date', 'Marks', 'Percentage', 'Grade']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [59, 130, 246] },
      });

      // Save PDF
      doc.save(`report-card-${studentName.replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating || grades.length === 0}
      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <Download className="w-4 h-4 mr-2" />
      {isGenerating ? 'Generating...' : 'Download Report Card'}
    </button>
  );
}
