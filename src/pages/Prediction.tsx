import { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Activity, AlertTriangle, CheckCircle } from 'lucide-react';

interface PredictionData {
  age: number;
  bloodPressure: number;
  cholesterol: number;
  heartRate: number;
  glucose: number;
}

interface RiskResult {
  percentage: number;
  level: 'low' | 'medium' | 'high';
  explanation: string;
}

export function Prediction() {
  const [formData, setFormData] = useState<PredictionData>({
    age: 0,
    bloodPressure: 0,
    cholesterol: 0,
    heartRate: 0,
    glucose: 0,
  });

  const [result, setResult] = useState<RiskResult | null>(null);

  const handleChange = (field: keyof PredictionData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: Number(e.target.value) });
  };

  const calculateRisk = () => {
    let riskScore = 0;

    if (formData.age > 60) riskScore += 20;
    else if (formData.age > 45) riskScore += 10;

    if (formData.bloodPressure > 140) riskScore += 25;
    else if (formData.bloodPressure > 120) riskScore += 10;

    if (formData.cholesterol > 240) riskScore += 20;
    else if (formData.cholesterol > 200) riskScore += 10;

    if (formData.heartRate > 100) riskScore += 15;
    else if (formData.heartRate < 60) riskScore += 10;

    if (formData.glucose > 126) riskScore += 20;
    else if (formData.glucose > 100) riskScore += 10;

    let level: 'low' | 'medium' | 'high' = 'low';
    let explanation = '';

    if (riskScore < 30) {
      level = 'low';
      explanation = 'Your health metrics indicate a low risk profile. Continue maintaining your healthy lifestyle with regular exercise and balanced diet.';
    } else if (riskScore < 60) {
      level = 'medium';
      explanation = 'Your health metrics suggest moderate risk factors. Consider consulting with your healthcare provider to develop a prevention plan.';
    } else {
      level = 'high';
      explanation = 'Your health metrics indicate elevated risk factors. We strongly recommend immediate consultation with a healthcare professional.';
    }

    setResult({
      percentage: Math.min(riskScore, 100),
      level,
      explanation,
    });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600 bg-green-50 border-green-500';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-500';
      case 'high':
        return 'text-red-600 bg-red-50 border-red-500';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-500';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low':
        return <CheckCircle size={48} />;
      case 'medium':
        return <AlertTriangle size={48} />;
      case 'high':
        return <AlertTriangle size={48} />;
      default:
        return <Activity size={48} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">AI Disease Prediction</h2>
            <p className="text-gray-600">Enter your health metrics for AI-powered risk assessment</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-800">Health Metrics Input</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    label="Age (years)"
                    type="number"
                    placeholder="Enter your age"
                    value={formData.age || ''}
                    onChange={handleChange('age')}
                  />
                  <Input
                    label="Blood Pressure (mmHg)"
                    type="number"
                    placeholder="e.g., 120"
                    value={formData.bloodPressure || ''}
                    onChange={handleChange('bloodPressure')}
                  />
                  <Input
                    label="Cholesterol (mg/dL)"
                    type="number"
                    placeholder="e.g., 180"
                    value={formData.cholesterol || ''}
                    onChange={handleChange('cholesterol')}
                  />
                  <Input
                    label="Heart Rate (bpm)"
                    type="number"
                    placeholder="e.g., 72"
                    value={formData.heartRate || ''}
                    onChange={handleChange('heartRate')}
                  />
                  <Input
                    label="Glucose (mg/dL)"
                    type="number"
                    placeholder="e.g., 95"
                    value={formData.glucose || ''}
                    onChange={handleChange('glucose')}
                  />
                  <Button onClick={calculateRisk} className="w-full mt-6">
                    Calculate Risk
                  </Button>
                </div>
              </CardContent>
            </Card>

            {result && (
              <Card className={`border-2 ${getRiskColor(result.level)}`}>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-800">Risk Assessment Result</h3>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className={`inline-flex p-4 rounded-full mb-4 ${getRiskColor(result.level)}`}>
                      {getRiskIcon(result.level)}
                    </div>
                    <div className="text-6xl font-bold mb-2" style={{ color: result.level === 'low' ? '#10b981' : result.level === 'medium' ? '#f59e0b' : '#ef4444' }}>
                      {result.percentage}%
                    </div>
                    <div className="text-xl font-semibold mb-4 uppercase" style={{ color: result.level === 'low' ? '#10b981' : result.level === 'medium' ? '#f59e0b' : '#ef4444' }}>
                      {result.level} Risk
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Analysis & Recommendations</h4>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {result.explanation}
                    </p>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-gray-800">Key Recommendations:</h5>
                      <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                        <li>Regular monitoring of vital signs</li>
                        <li>Maintain a balanced diet and exercise routine</li>
                        <li>Schedule regular check-ups with your healthcare provider</li>
                        <li>Stay hydrated and get adequate sleep</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!result && (
              <Card className="flex items-center justify-center">
                <div className="text-center p-8">
                  <Activity className="text-gray-300 mx-auto mb-4" size={64} />
                  <p className="text-gray-500">
                    Enter your health metrics and click "Calculate Risk" to see your assessment
                  </p>
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
