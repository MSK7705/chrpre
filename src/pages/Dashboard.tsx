import { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { HealthScoreCard } from '../components/dashboard/HealthScoreCard';
import { MetricCard } from '../components/dashboard/MetricCard';
import { HeartRateChart } from '../components/dashboard/HeartRateChart';
import { HealthScoreBarChart } from '../components/dashboard/HealthScoreBarChart';
import { Heart, Activity, Gauge, Flame } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Dashboard() {
  const [dailyCalories, setDailyCalories] = useState(0);
  const [caloriePercent, setCaloriePercent] = useState('0%');

  useEffect(() => {
    fetchCalorieData();
  }, []);

  const fetchCalorieData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      // Fetch targets and intake in parallel
      const [intakeRes, targetsRes] = await Promise.all([
        supabase
          .from('daily_intake')
          .select('total_calories')
          .eq('user_id', user.id)
          .eq('date', today)
          .single(),
        supabase
          .from('user_targets')
          .select('target_calories')
          .eq('user_id', user.id)
          .single()
      ]);

      const calories = intakeRes.data?.total_calories || 0;
      const target = targetsRes.data?.target_calories || 2000;

      setDailyCalories(calories);
      setCaloriePercent(`${Math.min(Math.round((calories / target) * 100), 100)}%`);

    } catch (err) {
      console.error('Error fetching dashboard calories:', err);
    }
  };

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
                value={dailyCalories}
                unit="kcal"
                icon={Flame}
                status="normal"
                trend={caloriePercent}
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
