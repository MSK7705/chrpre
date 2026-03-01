import { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AlertCircle, Phone, MapPin, Clock } from 'lucide-react';

export function EmergencyAlert() {
  const [alertActive, setAlertActive] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [notificationSent, setNotificationSent] = useState(false);

  useEffect(() => {
    if (alertActive && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (alertActive && countdown === 0) {
      setNotificationSent(true);
    }
  }, [alertActive, countdown]);

  const triggerAlert = () => {
    setAlertActive(true);
    setCountdown(30);
    setNotificationSent(false);
  };

  const confirmSafe = () => {
    setAlertActive(false);
    setCountdown(30);
    setNotificationSent(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Emergency Alert System</h2>
            <p className="text-gray-600">Quick response system for critical health situations</p>
          </div>

          {!alertActive && !notificationSent && (
            <div className="max-w-2xl mx-auto">
              <Card className="p-8 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="text-red-600" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Emergency Alert</h3>
                <p className="text-gray-600 mb-8">
                  Press the button below if you're experiencing a medical emergency.
                  Your emergency contacts will be notified automatically.
                </p>
                <Button variant="danger" onClick={triggerAlert} className="text-lg px-12 py-4">
                  Trigger Emergency Alert
                </Button>
              </Card>

              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <Card className="p-6 text-center">
                  <Phone className="text-blue-600 mx-auto mb-3" size={32} />
                  <h4 className="font-semibold text-gray-800 mb-2">Emergency Contacts</h4>
                  <p className="text-sm text-gray-600">3 contacts will be notified</p>
                </Card>
                <Card className="p-6 text-center">
                  <MapPin className="text-blue-600 mx-auto mb-3" size={32} />
                  <h4 className="font-semibold text-gray-800 mb-2">Location Sharing</h4>
                  <p className="text-sm text-gray-600">GPS coordinates sent</p>
                </Card>
                <Card className="p-6 text-center">
                  <Clock className="text-blue-600 mx-auto mb-3" size={32} />
                  <h4 className="font-semibold text-gray-800 mb-2">Response Time</h4>
                  <p className="text-sm text-gray-600">30 seconds to respond</p>
                </Card>
              </div>
            </div>
          )}

          {alertActive && !notificationSent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="max-w-md w-full mx-4 bg-red-50 border-4 border-red-500 p-8 text-center animate-pulse">
                <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="text-white" size={48} />
                </div>
                <h3 className="text-3xl font-bold text-red-600 mb-4">EMERGENCY ALERT ACTIVE</h3>
                <div className="text-6xl font-bold text-red-600 mb-6">{countdown}</div>
                <p className="text-gray-700 mb-8">
                  Emergency contacts will be notified in {countdown} seconds.
                  Click "I Am Safe" if this was triggered by accident.
                </p>
                <Button variant="success" onClick={confirmSafe} className="text-lg px-12 py-4">
                  I Am Safe
                </Button>
              </Card>
            </div>
          )}

          {notificationSent && (
            <div className="max-w-2xl mx-auto">
              <Card className="p-8 text-center bg-orange-50 border-2 border-orange-500">
                <div className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Phone className="text-white" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-orange-600 mb-4">Caretaker Notified</h3>
                <p className="text-gray-700 mb-6">
                  Emergency notifications have been sent to your caretakers and emergency contacts.
                  They have been notified of your location and current health status.
                </p>
                <div className="bg-white rounded-xl p-6 mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Notified Contacts:</h4>
                  <div className="space-y-3 text-left">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Dr. Sarah Johnson</span>
                      <span className="text-green-600 font-medium">SMS Sent</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Family Member (Jane Doe)</span>
                      <span className="text-green-600 font-medium">Call Initiated</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Emergency Services</span>
                      <span className="text-green-600 font-medium">Dispatched</span>
                    </div>
                  </div>
                </div>
                <Button onClick={() => setNotificationSent(false)}>
                  Close
                </Button>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
