import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { UploadReports } from './pages/UploadReports';
import { EmergencyAlert } from './pages/EmergencyAlert';
import { Prediction } from './pages/Prediction';
import { DailyIntake } from './pages/DailyIntake';
import { Target } from './pages/Target';
import { Login } from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<UploadReports />} />
        <Route path="/emergency" element={<EmergencyAlert />} />
        <Route path="/prediction" element={<Prediction />} />
        <Route path="/intake" element={<DailyIntake />} />
        <Route path="/targets" element={<Target />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
