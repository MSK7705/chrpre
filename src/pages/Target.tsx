import { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { Target as TargetIcon, Flame, AlertCircle, Beef, Droplet } from 'lucide-react';

export function Target() {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [targets, setTargets] = useState({
        calories: 2000,
        protein: 50,
        sodium: 2300,
        water: 8,
    });

    useEffect(() => {
        fetchTargets();
    }, []);

    const fetchTargets = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('user_targets')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (data) {
                setTargets({
                    calories: data.target_calories,
                    protein: data.target_protein,
                    sodium: data.max_sodium,
                    water: data.target_water,
                });
            }
        } catch (err: any) {
            console.error('Error fetching targets:', err.message);
        } finally {
            setIsFetching(false);
        }
    };

    const handleInputChange = (field: keyof typeof targets) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 0;
        setTargets({ ...targets, [field]: value });
    };

    const handleSave = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('User not authenticated');
            }

            const { error } = await supabase
                .from('user_targets')
                .upsert({
                    user_id: user.id,
                    target_calories: targets.calories,
                    target_protein: targets.protein,
                    max_sodium: targets.sodium,
                    target_water: targets.water,
                    updated_at: new Date().toISOString(),
                }, {
                    onConflict: 'user_id'
                });

            if (error) throw error;

            setSuccess('Personal targets saved successfully!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message);
            console.error('Save error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1">
                <Header />
                <main className="p-8">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">My Targets</h2>
                        <p className="text-gray-600">Configure your daily nutritional goals</p>
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

                    <div className="max-w-3xl">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center space-x-2">
                                    <TargetIcon className="text-blue-600" size={24} />
                                    <h3 className="text-xl font-semibold text-gray-800">Daily Objectives</h3>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isFetching ? (
                                    <div className="py-8 text-center text-gray-500">Loading targets...</div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                            {/* Calories */}
                                            <div>
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Flame className="text-orange-500" size={20} />
                                                    <label className="text-sm font-medium text-gray-700">Daily Calories (kcal)</label>
                                                </div>
                                                <input
                                                    type="number"
                                                    value={targets.calories}
                                                    onChange={handleInputChange('calories')}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Recommended around 2000-2500 kcal for adults</p>
                                            </div>

                                            {/* Protein */}
                                            <div>
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Beef className="text-green-500" size={20} />
                                                    <label className="text-sm font-medium text-gray-700">Daily Protein (g)</label>
                                                </div>
                                                <input
                                                    type="number"
                                                    value={targets.protein}
                                                    onChange={handleInputChange('protein')}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Typical target ranges 50g-150g depending on goals</p>
                                            </div>

                                            {/* Sodium */}
                                            <div>
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <AlertCircle className="text-blue-500" size={20} />
                                                    <label className="text-sm font-medium text-gray-700">Max Sodium (mg)</label>
                                                </div>
                                                <input
                                                    type="number"
                                                    value={targets.sodium}
                                                    onChange={handleInputChange('sodium')}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">FDA recommends less than 2300mg a day</p>
                                            </div>

                                            {/* Water */}
                                            <div>
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Droplet className="text-blue-400" size={20} />
                                                    <label className="text-sm font-medium text-gray-700">Water Glasses</label>
                                                </div>
                                                <input
                                                    type="number"
                                                    value={targets.water}
                                                    onChange={handleInputChange('water')}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">At 250ml per glass. Standard is 8 (2L)</p>
                                            </div>

                                        </div>

                                        <div className="pt-4 border-t border-gray-100">
                                            <Button
                                                onClick={handleSave}
                                                disabled={isLoading}
                                                className="w-full md:w-auto px-8"
                                            >
                                                {isLoading ? 'Saving...' : 'Save Targets'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
