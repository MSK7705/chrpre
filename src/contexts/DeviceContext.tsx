import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';

// Data point for the graph
export interface HeartRateDataPoint {
    time: string; // HH:MM format
    value: number;
}

interface DeviceContextType {
    isConnected: boolean;
    isSimulated: boolean;
    deviceName: string | null;
    currentHeartRate: number;
    currentSpO2: number;
    heartRateHistory: HeartRateDataPoint[];
    connectDevice: () => Promise<void>;
    simulateConnection: () => void;
    disconnectDevice: () => void;
    error: string | null;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export function DeviceProvider({ children }: { children: ReactNode }) {
    const [isConnected, setIsConnected] = useState(false);
    const [isSimulated, setIsSimulated] = useState(false);
    const [deviceName, setDeviceName] = useState<string | null>(null);
    const [currentHeartRate, setCurrentHeartRate] = useState(0);
    // SpO2 is not standard on the generic Heart Rate Profile (0x180D). 
    // We will leave it at 0 to display as '--' in the UI.
    const [currentSpO2, setCurrentSpO2] = useState(0);
    const [heartRateHistory, setHeartRateHistory] = useState<HeartRateDataPoint[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Use any because Web Bluetooth API types might not be installed in the project
    const deviceRef = useRef<any>(null);

    // Function to get current HH:MM
    const getCurrentTimeStr = () => {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    };

    // Initialize history with some baseline data points
    useEffect(() => {
        const initialHistory: HeartRateDataPoint[] = [];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const pastTime = new Date(now.getTime() - i * 60000); // 1 minute intervals
            initialHistory.push({
                time: `${pastTime.getHours().toString().padStart(2, '0')}:${pastTime.getMinutes().toString().padStart(2, '0')}`,
                value: 0, // 0 = No Reading Yet
            });
        }
        setHeartRateHistory(initialHistory);
    }, []);

    // Push the current running heart rate to the history array every 1 minute
    useEffect(() => {
        let historyInterval: NodeJS.Timeout;
        if (isConnected && currentHeartRate > 0) {
            historyInterval = setInterval(() => {
                setHeartRateHistory((prevHistory) => {
                    const newPoint = { time: getCurrentTimeStr(), value: currentHeartRate };
                    // Keep the last 15 minutes of data
                    const updated = [...prevHistory, newPoint].slice(-15);
                    return updated;
                });
            }, 60000); // 1 minute
        } else if (isSimulated && currentHeartRate > 0) {
            // Simulated history tracking
            historyInterval = setInterval(() => {
                setHeartRateHistory((prevHistory) => {
                    const newPoint = { time: getCurrentTimeStr(), value: currentHeartRate };
                    const updated = [...prevHistory, newPoint].slice(-15);
                    return updated;
                });
            }, 60000);
        }
        return () => clearInterval(historyInterval);
    }, [isConnected, isSimulated, currentHeartRate]);

    const handleHeartRateMeasurement = (event: any) => {
        const value: DataView = event.target.value;
        const flags = value.getUint8(0);
        // Bit 0 determines if the value is 8-bit or 16-bit
        const rate16Bits = flags & 0x1;

        let heartRate: number;
        if (rate16Bits) {
            heartRate = value.getUint16(1, true); // Little Endian
        } else {
            heartRate = value.getUint8(1);
        }

        setCurrentHeartRate(heartRate);
    };

    const handleDisconnect = () => {
        setIsConnected(false);
        setIsSimulated(false);
        setDeviceName(null);
        setCurrentHeartRate(0);
        setCurrentSpO2(0);
        deviceRef.current = null;
    };

    const connectDevice = async () => {
        try {
            setError(null);
            console.log("Requesting Bluetooth Device...");

            // @ts-ignore - Navigator.bluetooth is standard in modern Chrome, Edge but TS might complain
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: ['heart_rate'] }],
                optionalServices: ['battery_service']
            });

            deviceRef.current = device;
            setDeviceName(device.name || 'Unknown Device');

            device.addEventListener('gattserverdisconnected', handleDisconnect);

            console.log("Connecting to GATT Server...");
            const server = await device.gatt.connect();

            console.log("Getting Heart Rate Service...");
            // 0x180D is the UUID for Heart Rate Service
            const service = await server.getPrimaryService('heart_rate');

            console.log("Getting Heart Rate Measurement Characteristic...");
            // 0x2A37 is the UUID for Heart Rate Measurement Characteristic
            const characteristic = await service.getCharacteristic('heart_rate_measurement');

            console.log("Starting Notifications...");
            await characteristic.startNotifications();
            characteristic.addEventListener('characteristicvaluechanged', handleHeartRateMeasurement);

            setIsConnected(true);

        } catch (err: any) {
            console.error("Bluetooth Connection Error: ", err);
            // Hide the generic user-cancellation error from the UI
            if (err.message && err.message.includes("User cancelled")) {
                setError(null);
            } else {
                setError(err.message || "Failed to connect to Bluetooth device.");
            }
            handleDisconnect();
        }
    };

    const disconnectDevice = () => {
        if (deviceRef.current && deviceRef.current.gatt?.connected) {
            deviceRef.current.gatt.disconnect();
        } else {
            handleDisconnect();
        }
    };

    const simulateConnection = () => {
        setError(null);
        setIsConnected(false);
        setIsSimulated(true);
        setDeviceName('Simulated HealthBand');
        setCurrentHeartRate(Math.floor(Math.random() * (85 - 70 + 1)) + 70);
        setCurrentSpO2(Math.floor(Math.random() * (100 - 95 + 1)) + 95);
    };

    return (
        <DeviceContext.Provider
            value={{
                isConnected: isConnected || isSimulated,
                isSimulated,
                deviceName,
                currentHeartRate,
                currentSpO2,
                heartRateHistory,
                connectDevice,
                simulateConnection,
                disconnectDevice,
                error
            }}
        >
            {children}
        </DeviceContext.Provider>
    );
}

export function useDeviceContext() {
    const context = useContext(DeviceContext);
    if (context === undefined) {
        throw new Error('useDeviceContext must be used within a DeviceProvider');
    }
    return context;
}
