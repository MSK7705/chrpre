import { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Coffee, Utensils, Moon, Droplet, Flame, AlertCircle } from 'lucide-react';

interface MealData {
  breakfast: string;
  lunch: string;
  dinner: string;
}

export function DailyIntake() {
  const [meals, setMeals] = useState<MealData>({
    breakfast: '',
    lunch: '',
    dinner: '',
  });

  const [waterGlasses, setWaterGlasses] = useState(0);

  const totalCalories = 1850;
  const targetCalories = 2000;
  const sodium = 1200;
  const maxSodium = 2300;
  const sugar = 35;
  const maxSugar = 50;

  const handleMealChange = (meal: keyof MealData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setMeals({ ...meals, [meal]: e.target.value });
  };

  const addWaterGlass = () => {
    setWaterGlasses(waterGlasses + 1);
  };

  const removeWaterGlass = () => {
    if (waterGlasses > 0) setWaterGlasses(waterGlasses - 1);
  };

  const getProgressColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage < 60) return 'bg-green-500';
    if (percentage < 85) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Daily Intake Tracker</h2>
            <p className="text-gray-600">Monitor your meals, water intake, and nutrition</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-orange-50 to-white">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Flame className="text-orange-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Total Calories</h3>
                    <p className="text-sm text-gray-500">Daily intake</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {totalCalories}
                  <span className="text-lg text-gray-500"> / {targetCalories}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(totalCalories / targetCalories) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  {targetCalories - totalCalories} kcal remaining
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <AlertCircle className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Sodium</h3>
                    <p className="text-sm text-gray-500">Daily limit</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {sodium}
                  <span className="text-lg text-gray-500"> mg</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(sodium, maxSodium)}`}
                    style={{ width: `${(sodium / maxSodium) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  {((sodium / maxSodium) * 100).toFixed(0)}% of daily limit
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-50 to-white">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Coffee className="text-pink-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Sugar</h3>
                    <p className="text-sm text-gray-500">Daily limit</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {sugar}
                  <span className="text-lg text-gray-500"> g</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(sugar, maxSugar)}`}
                    style={{ width: `${(sugar / maxSugar) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  {((sugar / maxSugar) * 100).toFixed(0)}% of daily limit
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-800">Meal Tracking</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Coffee className="text-blue-600" size={20} />
                      <h4 className="font-semibold text-gray-800">Breakfast</h4>
                    </div>
                    <Input
                      placeholder="e.g., Oatmeal with fruits, 350 kcal"
                      value={meals.breakfast}
                      onChange={handleMealChange('breakfast')}
                    />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Utensils className="text-blue-600" size={20} />
                      <h4 className="font-semibold text-gray-800">Lunch</h4>
                    </div>
                    <Input
                      placeholder="e.g., Grilled chicken salad, 550 kcal"
                      value={meals.lunch}
                      onChange={handleMealChange('lunch')}
                    />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Moon className="text-blue-600" size={20} />
                      <h4 className="font-semibold text-gray-800">Dinner</h4>
                    </div>
                    <Input
                      placeholder="e.g., Salmon with vegetables, 650 kcal"
                      value={meals.dinner}
                      onChange={handleMealChange('dinner')}
                    />
                  </div>

                  <Button className="w-full">Save Meals</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-800">Water Intake</h3>
                <p className="text-sm text-gray-500">Track your daily hydration</p>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <Droplet className="text-blue-500 mx-auto mb-4" size={64} />
                  <div className="text-5xl font-bold text-blue-600 mb-2">{waterGlasses}</div>
                  <p className="text-gray-600">Glasses of water</p>
                  <p className="text-sm text-gray-500 mt-1">({waterGlasses * 250}ml / 2000ml)</p>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
                  <div
                    className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((waterGlasses / 8) * 100, 100)}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-8 gap-2 mb-6">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-12 rounded-lg transition-all duration-300 ${
                        i < waterGlasses ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    ></div>
                  ))}
                </div>

                <div className="flex space-x-3">
                  <Button onClick={addWaterGlass} className="flex-1">
                    Add Glass
                  </Button>
                  <Button onClick={removeWaterGlass} variant="secondary" className="flex-1">
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
