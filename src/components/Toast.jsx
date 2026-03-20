// ============================
// COMPOSANT TOAST / NOTIFICATION
// ============================

import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 left-4 z-50 flex flex-col gap-2 pointer-events-none"
         style={{ maxWidth: '400px', margin: '0 auto' }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-toast flex items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl pointer-events-auto"
          style={{
            background: toast.type === 'perfect'
              ? 'linear-gradient(135deg, #F59E0B, #EF4444)'
              : toast.type === 'badge'
              ? 'linear-gradient(135deg, #8B5CF6, #06B6D4)'
              : toast.type === 'xp'
              ? 'linear-gradient(135deg, #10B981, #059669)'
              : toast.type === 'warning'
              ? 'linear-gradient(135deg, #F59E0B, #D97706)'
              : 'linear-gradient(135deg, #1E1E3A, #2D2D4E)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <span className="text-xl">{toast.emoji}</span>
          <span className="text-white font-semibold text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {toast.message}
          </span>
        </div>
      ))}
    </div>
  );
}
