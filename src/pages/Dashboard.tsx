import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { HealthScoreCard } from '../components/dashboard/HealthScoreCard';
import { MetricCard } from '../components/dashboard/MetricCard';
import { HeartRateChart } from '../components/dashboard/HeartRateChart';
import { HealthScoreBarChart } from '../components/dashboard/HealthScoreBarChart';
import { Heart, Activity, Droplet, Gauge } from 'lucide-react';

export function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-1">
              <HealthScoreCard score={92} />
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <MetricCard
                title="Heart Rate"
                value={72}
                unit="bpm"
                icon={Heart}
                status="normal"
                trend="+2%"
              />
              <MetricCard
                title="Blood Oxygen (SpO2)"
                value={98}
                unit="%"
                icon={Activity}
                status="normal"
                trend="stable"
              />
              <MetricCard
                title="Blood Pressure"
                value="120/80"
                unit="mmHg"
                icon={Gauge}
                status="normal"
                trend="-1%"
              />
              <MetricCard
                title="Daily Calories"
                value={1850}
                unit="kcal"
                icon={Droplet}
                status="normal"
                trend="75%"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HeartRateChart />
            <HealthScoreBarChart />
          </div>
        </main>
      </div>
    </div>
  );
}
