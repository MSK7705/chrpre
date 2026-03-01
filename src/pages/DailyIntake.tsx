import { useState, useEffect, useMemo } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { foodItems } from '../data/food_data';
import { supabase } from '../lib/supabase';
import { Header } from '../components/layout/Header';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Coffee, Utensils, Moon, Droplet, Flame, AlertCircle, Apple, X, Beef } from 'lucide-react';

interface MealData {
  breakfast: string[];
  lunch: string[];
  dinner: string[];
  snacks: string[];
}

export function DailyIntake() {
  const [meals, setMeals] = useState<MealData>({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [waterGlasses, setWaterGlasses] = useState(0);

  // Targets state
  const [targets, setTargets] = useState({
    calories: 2000,
    sodium: 2300,
    protein: 50,
    water: 8
  });

  // Fetch today's data and user targets on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      // Fetch targets and intake in parallel
      const [intakeRes, targetsRes] = await Promise.all([
        supabase
          .from('daily_intake')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
          .single(),
        supabase
          .from('user_targets')
          .select('*')
          .eq('user_id', user.id)
          .single()
      ]);

      if (intakeRes.error && intakeRes.error.code !== 'PGRST116') {
        throw intakeRes.error;
      }

      if (targetsRes.error && targetsRes.error.code !== 'PGRST116') {
        throw targetsRes.error;
      }

      if (intakeRes.data) {
        setMeals(intakeRes.data.meals);
        setWaterGlasses(intakeRes.data.water_glasses);
      }

      if (targetsRes.data) {
        setTargets({
          calories: targetsRes.data.target_calories,
          sodium: targetsRes.data.max_sodium,
          protein: targetsRes.data.target_protein,
          water: targetsRes.data.target_water,
        });
      }
    } catch (err: any) {
      console.error('Error fetching data:', err.message);
    }
  };

  // Calculate dynamic totals from matched food items
  const totals = useMemo(() => {
    let cal = 0;
    let prot = 0;
    let sod = 0;

    const allFoods = [
      ...meals.breakfast,
      ...meals.lunch,
      ...meals.dinner,
      ...meals.snacks,
    ];

    allFoods.forEach((foodName) => {
      const food = foodItems.find((item) => item.name === foodName);
      if (food) {
        cal += food.calories;
        prot += food.protein;
        sod += food.sodium;
      }
    });

    return { calories: Math.round(cal), protein: Math.round(prot), sodium: Math.round(sod) };
  }, [meals]);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase
        .from('daily_intake')
        .upsert({
          user_id: user.id,
          date: today,
          meals,
          water_glasses: waterGlasses,
          total_calories: totals.calories,
          total_protein: totals.protein,
          total_sodium: totals.sodium,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,date'
        });

      if (error) throw error;

      setSuccess('Daily intake saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
      console.error('Save error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFood = (meal: keyof MealData) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFood = e.target.value;
    if (selectedFood) {
      setMeals({ ...meals, [meal]: [...meals[meal], selectedFood] });
    }
  };

  const handleRemoveFood = (meal: keyof MealData, index: number) => {
    setMeals({
      ...meals,
      [meal]: meals[meal].filter((_, i) => i !== index),
    });
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

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-lg">
              {success}
            </div>
          )}

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
                  {totals.calories}
                  <span className="text-lg text-gray-500"> / {targets.calories}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(Math.min(totals.calories, targets.calories), targets.calories)}`}
                    style={{ width: `${Math.min((totals.calories / targets.calories) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  {Math.max(targets.calories - totals.calories, 0)} kcal remaining
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
                  {totals.sodium}
                  <span className="text-lg text-gray-500"> mg</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(totals.sodium, targets.sodium)}`}
                    style={{ width: `${Math.min((totals.sodium / targets.sodium) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  {((totals.sodium / targets.sodium) * 100).toFixed(0)}% of daily limit
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-white">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Beef className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Protein</h3>
                    <p className="text-sm text-gray-500">Daily Target</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {totals.protein}
                  <span className="text-lg text-gray-500"> g</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((totals.protein / targets.protein) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  {((totals.protein / targets.protein) * 100).toFixed(0)}% of {targets.protein}g target
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
                  {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((mealType) => {
                    const icons = {
                      breakfast: <Coffee className="text-blue-600" size={20} />,
                      lunch: <Utensils className="text-blue-600" size={20} />,
                      dinner: <Moon className="text-blue-600" size={20} />,
                      snacks: <Apple className="text-blue-600" size={20} />,
                    };
                    const titles = {
                      breakfast: 'Breakfast',
                      lunch: 'Lunch',
                      dinner: 'Dinner',
                      snacks: 'Snacks',
                    };

                    return (
                      <div key={mealType}>
                        <div className="flex items-center space-x-2 mb-3">
                          {icons[mealType]}
                          <h4 className="font-semibold text-gray-800">{titles[mealType]}</h4>
                        </div>
                        <select
                          value=""
                          onChange={handleAddFood(mealType)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        >
                          <option value="" disabled>Select food item to add</option>
                          {foodItems.map((food, idx) => (
                            <option key={idx} value={food.name}>
                              {food.name}
                            </option>
                          ))}
                        </select>
                        {meals[mealType].length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {meals[mealType].map((food, idx) => (
                              <span key={idx} className="bg-blue-50 text-blue-700 border border-blue-200 text-sm px-3 py-1.5 rounded-lg flex items-center shadow-sm">
                                {food}
                                <button
                                  onClick={() => handleRemoveFood(mealType, idx)}
                                  className="ml-2 text-blue-400 hover:text-blue-600 focus:outline-none bg-white rounded-full p-0.5"
                                  title="Remove"
                                >
                                  <X size={14} />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <Button
                    className="w-full mt-4"
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Meals'}
                  </Button>
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
                  <p className="text-sm text-gray-500 mt-1">({waterGlasses * 250}ml / {targets.water * 250}ml)</p>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
                  <div
                    className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((waterGlasses / targets.water) * 100, 100)}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-8 gap-2 mb-6">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-12 rounded-lg transition-all duration-300 ${i < waterGlasses ? 'bg-blue-500' : 'bg-gray-200'
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
