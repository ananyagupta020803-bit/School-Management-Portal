import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import BulkUploadForm from '@/components/BulkUploadForm';

export default async function BulkUpload() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  return (
<DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bulk Upload Users</h1>
          <p className="text-gray-600 mt-2">Import students or teachers via CSV file</p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Upload CSV File</h2>
          </div>
          <div className="p-6">
            <BulkUploadForm />
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">CSV Format Instructions</h3>
          
          <div className="space-y-4">
            <div>
              <p className="font-medium text-gray-900 mb-2">For Students:</p>
              <code className="text-sm bg-white px-3 py-2 rounded block">
                name,email,password,role,student_id,class,section,roll_number,phone
              </code>
              <p className="text-sm text-gray-600 mt-2">Example:</p>
              <code className="text-sm bg-white px-3 py-2 rounded block">
                John Doe,john@example.com,password123,student,STU003,10,A,3,1234567890
              </code>
            </div>

            <div>
              <p className="font-medium text-gray-900 mb-2">For Teachers:</p>
              <code className="text-sm bg-white px-3 py-2 rounded block">
                name,email,password,role,teacher_id,subject,qualification,phone
              </code>
              <p className="text-sm text-gray-600 mt-2">Example:</p>
              <code className="text-sm bg-white px-3 py-2 rounded block">
                Jane Smith,jane@example.com,password123,teacher,TCH003,English,M.A. English,9876543210
              </code>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Make sure your CSV file follows the exact format shown above. 
              The role must be either "student" or "teacher".
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
