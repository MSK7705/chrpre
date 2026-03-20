import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useDeviceContext } from '../contexts/DeviceContext';
import { Watch, Heart, Activity, CheckCircle2, XCircle, Bluetooth } from 'lucide-react';

export function Connection() {
    const { isConnected, deviceName, currentHeartRate, currentSpO2, connectDevice, simulateConnection, disconnectDevice, error } = useDeviceContext();

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1">
                <Header />
                <main className="p-8">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Device Connection</h2>
                        <p className="text-gray-600">Sync your health tracking devices for real-time monitoring</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
                            <h3 className="font-bold">Connection Error</h3>
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="p-8 flex flex-col items-center justify-center text-center">
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-colors duration-500 ${isConnected ? 'bg-green-100' : 'bg-gray-100'}`}>
                                {isConnected ? (
                                    <Watch size={48} className="text-green-600" />
                                ) : (
                                    <Bluetooth size={48} className="text-gray-400" />
                                )}
                            </div>

                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                {isConnected ? (deviceName || 'Connected Device') : 'No Device Connected'}
                            </h3>

                            <div className="flex items-center space-x-2 text-sm mb-8">
                                {isConnected ? (
                                    <>
                                        <CheckCircle2 size={16} className="text-green-500" />
                                        <span className="text-green-600 font-medium">Connected & Streaming</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle size={16} className="text-gray-500" />
                                        <span className="text-gray-500">Pairing required</span>
                                    </>
                                )}
                            </div>

                            {isConnected ? (
                                <Button variant="danger" onClick={disconnectDevice} className="w-full max-w-xs">
                                    Disconnect Device
                                </Button>
                            ) : (
                                <div className="space-y-3 w-full max-w-xs">
                                    <Button onClick={connectDevice} className="w-full">
                                        Scan & Connect Real Device
                                    </Button>
                                    <Button variant="secondary" onClick={simulateConnection} className="w-full">
                                        Simulate Connection
                                    </Button>
                                </div>
                            )}
                        </Card>

                        <Card className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-bold mb-6 text-blue-50">Live Hardware Feed</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-3 bg-red-500/20 rounded-xl">
                                                <Heart className="text-red-300" size={24} />
                                            </div>
                                            <div>
                                                <p className="text-blue-100 text-sm">Heart Rate</p>
                                                <p className="text-3xl font-bold">{isConnected && currentHeartRate > 0 ? currentHeartRate : '--'}</p>
                                            </div>
                                        </div>
                                        <span className="text-blue-200 font-medium">bpm</span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-3 bg-blue-500/20 rounded-xl">
                                                <Activity className="text-blue-300" size={24} />
                                            </div>
                                            <div>
                                                <p className="text-blue-100 text-sm">Blood Oxygen</p>
                                                <p className="text-3xl font-bold">{isConnected && currentSpO2 > 0 ? currentSpO2 : '--'}</p>
                                            </div>
                                        </div>
                                        <span className="text-blue-200 font-medium">%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 text-center text-sm text-blue-200/60">
                                {isConnected
                                    ? "Streaming data locally to Dashboard."
                                    : "Connect a supported smartwatch or monitor to view live analytics."}
                            </div>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
