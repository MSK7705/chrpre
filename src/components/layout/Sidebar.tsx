import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileUp, Activity, Apple, AlertCircle } from 'lucide-react';

export function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/upload', icon: FileUp, label: 'Upload Reports' },
    { path: '/prediction', icon: Activity, label: 'Prediction' },
    { path: '/intake', icon: Apple, label: 'Daily Intake' },
    { path: '/emergency', icon: AlertCircle, label: 'Emergency Alert' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-blue-600">HealthAI</h2>
        <p className="text-xs text-gray-500 mt-1">Smart Monitoring</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
