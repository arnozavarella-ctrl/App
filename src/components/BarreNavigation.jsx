// ============================
// BARRE DE NAVIGATION BAS DE PAGE
// ============================

import { useLocation, useNavigate } from 'react-router-dom';
import { Home, CheckSquare, BarChart2, Trophy, User } from 'lucide-react';

const ONGLETS = [
  { chemin: '/dashboard', icone: Home, label: 'Accueil' },
  { chemin: '/habitudes', icone: CheckSquare, label: 'Habitudes' },
  { chemin: '/stats', icone: BarChart2, label: 'Stats' },
  { chemin: '/classement', icone: Trophy, label: 'Classement' },
  { chemin: '/profil', icone: User, label: 'Profil' },
];

export default function BarreNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: 'rgba(15, 15, 15, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        maxWidth: '430px',
        margin: '0 auto',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
      }}
    >
      <div className="flex items-center justify-around px-2 py-2 pb-safe">
        {ONGLETS.map(({ chemin, icone: Icone, label }) => {
          const actif = location.pathname === chemin;
          return (
            <button
              key={chemin}
              onClick={() => navigate(chemin)}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-0"
              style={{
                color: actif ? '#10B981' : '#6B7280',
                transform: actif ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              <div
                className="relative"
                style={{
                  filter: actif ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))' : 'none',
                }}
              >
                <Icone size={22} strokeWidth={actif ? 2.5 : 1.8} />
                {actif && (
                  <div
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full"
                    style={{
                      width: '4px',
                      height: '4px',
                      background: '#10B981',
                      boxShadow: '0 0 6px #10B981',
                    }}
                  />
                )}
              </div>
              <span
                className="text-xs font-medium truncate"
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '10px',
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
