// ============================
// COMPOSANT RACINE — App LevelUp
// ============================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import BarreNavigation from './components/BarreNavigation';
import Toast from './components/Toast';
import Onboarding from './screens/Onboarding';
import Dashboard from './screens/Dashboard';
import Habitudes from './screens/Habitudes';
import Stats from './screens/Stats';
import Classement from './screens/Classement';
import Profil from './screens/Profil';
import Journal from './screens/Journal';
import Objectifs from './screens/Objectifs';

function ContenuApp() {
  const { donnees, chargement } = useApp();

  if (chargement) {
    return (
      <div className="flex items-center justify-center min-h-screen"
           style={{ background: '#0F0F0F' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="text-5xl animate-float">⚡</div>
          <div className="text-lg font-bold gradient-text" style={{ fontFamily: 'Outfit, sans-serif' }}>
            LevelUp
          </div>
        </div>
      </div>
    );
  }

  if (!donnees?.onboardingTermine) {
    return <Onboarding />;
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/habitudes" element={<Habitudes />} />
        <Route path="/objectifs" element={<Objectifs />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/classement" element={<Classement />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <BarreNavigation />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ContenuApp />
      </AppProvider>
    </BrowserRouter>
  );
}
