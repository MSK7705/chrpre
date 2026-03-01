import { Card } from '../ui/Card';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  status: 'normal' | 'warning' | 'danger';
  trend?: string;
}

export function MetricCard({ title, value, unit, icon: Icon, status, trend }: MetricCardProps) {
  const statusColors = {
    normal: 'bg-green-50 text-green-600',
    warning: 'bg-yellow-50 text-yellow-600',
    danger: 'bg-red-50 text-red-600',
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${statusColors[status]}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <div className="flex items-baseline space-x-2">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        <span className="text-sm text-gray-500">{unit}</span>
      </div>
    </Card>
  );
}
