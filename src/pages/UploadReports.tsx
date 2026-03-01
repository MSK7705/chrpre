import { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Upload, FileText, CheckCircle } from 'lucide-react';

interface MedicalValues {
  creatinine: string;
  cholesterol: string;
  glucose: string;
  hemoglobin: string;
  platelets: string;
}

interface ReportHistory {
  id: number;
  date: string;
  fileName: string;
  status: string;
}

export function UploadReports() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedValues, setExtractedValues] = useState<MedicalValues | null>(null);

  const reportHistory: ReportHistory[] = [
    { id: 1, date: '2024-02-15', fileName: 'blood_test_report.pdf', status: 'Processed' },
    { id: 2, date: '2024-01-28', fileName: 'medical_checkup.pdf', status: 'Processed' },
    { id: 3, date: '2024-01-10', fileName: 'lab_results.pdf', status: 'Processed' },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setTimeout(() => {
      setExtractedValues({
        creatinine: '1.2 mg/dL',
        cholesterol: '185 mg/dL',
        glucose: '95 mg/dL',
        hemoglobin: '14.5 g/dL',
        platelets: '250,000/µL',
      });
    }, 1500);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Upload Medical Reports</h2>
            <p className="text-gray-600">Upload your medical reports for automatic value extraction</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-800">Upload Report</h3>
              </CardHeader>
              <CardContent>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Drag & drop your report here
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    or click to browse files
                  </p>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.jpg,.png"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="primary" onClick={() => document.getElementById('file-upload')?.click()}>
                      Select File
                    </Button>
                  </label>
                  {uploadedFile && (
                    <div className="mt-4 flex items-center justify-center space-x-2 text-green-600">
                      <CheckCircle size={20} />
                      <span className="text-sm font-medium">{uploadedFile.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {extractedValues && (
              <Card className="bg-gradient-to-br from-blue-50 to-white">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-800">Extracted Medical Values</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(extractedValues).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center p-4 bg-white rounded-xl">
                        <span className="font-medium text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-blue-600 font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-800">Report History</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportHistory.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{report.fileName}</p>
                        <p className="text-sm text-gray-500">{report.date}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-lg">
                      {report.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
