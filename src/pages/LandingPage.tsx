import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Activity, Bell, TrendingUp, Watch } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Watch,
      title: 'Wearable Integration',
      description: 'Seamlessly connect your smartwatch and fitness trackers for real-time health monitoring.',
    },
    {
      icon: Activity,
      title: 'AI Disease Prediction',
      description: 'Advanced machine learning algorithms predict potential health risks before they become critical.',
    },
    {
      icon: Bell,
      title: 'Emergency Alert System',
      description: 'Automatic emergency notifications to caretakers when critical health anomalies are detected.',
    },
    {
      icon: TrendingUp,
      title: 'Health Score Tracking',
      description: 'Comprehensive health scoring system that tracks your overall wellness journey.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="text-blue-600" size={32} />
            <span className="text-2xl font-bold text-gray-800">HealthAI</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="secondary" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button onClick={() => navigate('/login')}>
              Register
            </Button>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            AI Powered Real-Time<br />
            <span className="text-blue-600">Health Monitoring System</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Monitor your health through wearables, track your daily intake routine,
            and get AI-powered disease predictions to stay ahead of potential health risks.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button onClick={() => navigate('/dashboard')} className="text-lg px-8 py-4">
              Get Started
            </Button>
            <Button variant="secondary" className="text-lg px-8 py-4">
              Learn More
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-12 mb-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="text-center p-6 rounded-2xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-blue-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-4">Trusted by healthcare professionals worldwide</p>
          <div className="flex items-center justify-center space-x-8 text-gray-400">
            <div className="text-4xl font-bold">500K+</div>
            <div className="text-4xl font-bold">98%</div>
            <div className="text-4xl font-bold">24/7</div>
          </div>
          <div className="flex items-center justify-center space-x-8 text-gray-500 text-sm mt-2">
            <span>Active Users</span>
            <span>Accuracy</span>
            <span>Monitoring</span>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400">
            &copy; 2024 HealthAI Smart Monitoring System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
