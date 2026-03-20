// ============================
// ÉCRAN CLASSEMENT — Leaderboard
// ============================

import { useState, useMemo } from 'react';
import { Share2, Lock, Zap, Trophy, Target, Crown, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FAUX_JOUEURS, obtenirNomNiveau } from '../data/storage';

const DEFI_SEMAINE = {
  titre: 'Semaine de feu 🔥',
  description: 'Complète 5 jours parfaits cette semaine',
  recompense: '200 XP',
  progression: 2,
  total: 5,
};

function MedalleRang({ rang }) {
  if (rang === 1) return <span className="text-2xl">🥇</span>;
  if (rang === 2) return <span className="text-2xl">🥈</span>;
  if (rang === 3) return <span className="text-2xl">🥉</span>;
  return (
    <div className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold"
         style={{ background: 'rgba(255,255,255,0.06)', color: '#9CA3AF', fontFamily: 'Outfit, sans-serif' }}>
      {rang}
    </div>
  );
}

function CarteJoueur({ joueur, rang, estMoi = false }) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200"
      style={{
        background: estMoi
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.08))'
          : 'rgba(30, 30, 58, 0.5)',
        border: estMoi
          ? '1.5px solid rgba(16, 185, 129, 0.4)'
          : '1px solid rgba(255,255,255,0.04)',
        boxShadow: estMoi ? '0 0 20px rgba(16, 185, 129, 0.1)' : 'none',
      }}
    >
      {/* Rang */}
      <MedalleRang rang={rang} />

      {/* Avatar */}
      <div className="flex items-center justify-center rounded-2xl text-xl"
           style={{
             width: '44px',
             height: '44px',
             background: estMoi ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.06)',
             border: estMoi ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.06)',
           }}>
        {joueur.avatar}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="font-bold text-sm truncate"
                style={{ fontFamily: 'Outfit, sans-serif', color: estMoi ? '#10B981' : '#F9FAFB' }}>
            {joueur.pseudo}
          </span>
          {estMoi && <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                           style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10B981' }}>
            Toi
          </span>}
          {rang === 1 && <Crown size={14} style={{ color: '#F59E0B' }} />}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: '#9CA3AF' }}>Niv. {joueur.niveau}</span>
          <span className="text-xs" style={{ color: '#6B7280' }}>·</span>
          <span className="text-xs" style={{ color: '#9CA3AF' }}>🔥 {joueur.streak}j</span>
        </div>
      </div>

      {/* XP */}
      <div className="text-right">
        <div className="font-bold text-sm gradient-text" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {joueur.xp.toLocaleString('fr-FR')}
        </div>
        <div className="text-xs" style={{ color: '#9CA3AF' }}>XP</div>
      </div>
    </div>
  );
}

// Modal premium
function ModalPremium({ onFermer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
         style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
         onClick={(e) => e.target === e.currentTarget && onFermer()}>
      <div className="w-full rounded-t-3xl p-6 animate-slide-up"
           style={{ background: '#1A1A2E', border: '1px solid rgba(139, 92, 246, 0.3)', maxWidth: '430px' }}>
        <div className="text-center mb-6">
          <div className="text-5xl mb-3 animate-float">💎</div>
          <h2 className="text-2xl font-black mb-2 gradient-text-purple" style={{ fontFamily: 'Sora, sans-serif' }}>
            LevelUp Pro
          </h2>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            Débloque le classement entre amis, les défis personnalisés et bien plus !
          </p>
        </div>

        <div className="flex flex-col gap-2 mb-6">
          {['🏆 Classement entre amis', '🎯 Défis personnalisés', '📊 Statistiques comparatives', '🎨 Thèmes visuels exclusifs', '∞ Habitudes illimitées'].map(f => (
            <div key={f} className="flex items-center gap-2 text-sm" style={{ color: '#D1D5DB' }}>
              <span>{f}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-4">
          <div className="flex-1 rounded-2xl p-4 text-center"
               style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
            <div className="font-black text-xl mb-0.5" style={{ fontFamily: 'Outfit, sans-serif', color: '#8B5CF6' }}>4.99€</div>
            <div className="text-xs" style={{ color: '#9CA3AF' }}>/ mois</div>
          </div>
          <div className="flex-1 rounded-2xl p-4 text-center"
               style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.1))', border: '1.5px solid rgba(139, 92, 246, 0.4)' }}>
            <div className="font-black text-xl mb-0.5" style={{ fontFamily: 'Outfit, sans-serif', color: '#F9FAFB' }}>29.99€</div>
            <div className="text-xs" style={{ color: '#10B981' }}>/ an · Économise 50%</div>
          </div>
        </div>

        <button onClick={onFermer} className="btn-primary w-full mb-3" style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}>
          Continuer gratuitement
        </button>
        <p className="text-xs text-center" style={{ color: '#6B7280' }}>Bientôt disponible — restez connecté !</p>
      </div>
    </div>
  );
}

export default function Classement() {
  const { donnees, afficherToast } = useApp();
  const [modalPremium, setModalPremium] = useState(false);

  if (!donnees) return null;

  const { profil } = donnees;

  // Créer l'entrée du joueur actuel
  const joueurActuel = {
    id: 'moi',
    pseudo: profil.prenom || 'Toi',
    avatar: profil.avatar || '🦁',
    niveau: profil.niveau,
    xp: profil.niveauXP,
    streak: profil.streak,
  };

  // Mélanger avec les faux joueurs et trier par XP
  const tousJoueurs = [...FAUX_JOUEURS, joueurActuel]
    .sort((a, b) => b.xp - a.xp)
    .map((j, idx) => ({ ...j, rang: idx + 1 }));

  const rangJoueur = tousJoueurs.find(j => j.id === 'moi')?.rang || '?';

  function partagerApp() {
    const texte = `Je suis rang #${rangJoueur} sur LevelUp ! 🏆 Rejoins-moi et gamifie tes habitudes fitness !`;
    if (navigator.share) {
      navigator.share({ title: 'LevelUp', text: texte, url: window.location.href });
    } else {
      navigator.clipboard.writeText(`${texte}\n${window.location.href}`);
      afficherToast('Lien copié dans le presse-papiers !', 'success', '📋');
    }
  }

  return (
    <div className="flex flex-col min-h-screen pb-24"
         style={{ background: 'linear-gradient(160deg, #0F0F0F 0%, #1A1A2E 100%)' }}>

      {/* Header */}
      <div className="px-5 pt-12 pb-4 animate-fade-in">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Sora, sans-serif', color: '#F9FAFB' }}>
          Classement
        </h1>
        <p className="text-sm" style={{ color: '#9CA3AF' }}>
          Semaine du {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Mon rang */}
      <div className="px-5 mb-4 animate-slide-up">
        <div className="rounded-2xl p-4 flex items-center gap-4"
             style={{
               background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.08))',
               border: '1px solid rgba(245, 158, 11, 0.25)',
             }}>
          <div className="text-4xl font-black" style={{ fontFamily: 'Outfit, sans-serif', color: '#F59E0B' }}>
            #{rangJoueur}
          </div>
          <div className="flex-1">
            <div className="font-bold text-base" style={{ color: '#F9FAFB', fontFamily: 'Outfit, sans-serif' }}>
              Ton classement global
            </div>
            <div className="text-xs" style={{ color: '#9CA3AF' }}>
              Parmi {tousJoueurs.length} joueurs actifs
            </div>
          </div>
          <button
            onClick={partagerApp}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10B981',
              border: '1px solid rgba(16, 185, 129, 0.25)',
            }}
          >
            <Share2 size={14} />
            Partager
          </button>
        </div>
      </div>

      {/* Défi de la semaine */}
      <div className="px-5 mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="rounded-2xl p-4"
             style={{
               background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(16, 185, 129, 0.06))',
               border: '1px solid rgba(6, 182, 212, 0.25)',
             }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target size={16} style={{ color: '#06B6D4' }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#06B6D4' }}>
                Défi de la semaine
              </span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
              +{DEFI_SEMAINE.recompense}
            </span>
          </div>
          <h3 className="font-bold text-base mb-1" style={{ fontFamily: 'Outfit, sans-serif', color: '#F9FAFB' }}>
            {DEFI_SEMAINE.titre}
          </h3>
          <p className="text-xs mb-3" style={{ color: '#9CA3AF' }}>{DEFI_SEMAINE.description}</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-full overflow-hidden" style={{ height: '6px', background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full xp-bar-fill"
                style={{
                  width: `${(DEFI_SEMAINE.progression / DEFI_SEMAINE.total) * 100}%`,
                  background: 'linear-gradient(90deg, #06B6D4, #10B981)',
                }}
              />
            </div>
            <span className="text-xs font-semibold" style={{ color: '#06B6D4' }}>
              {DEFI_SEMAINE.progression}/{DEFI_SEMAINE.total}
            </span>
          </div>
        </div>
      </div>

      {/* Classement */}
      <div className="px-5 mb-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-base" style={{ fontFamily: 'Outfit, sans-serif', color: '#F9FAFB' }}>
            Top joueurs
          </h2>
          <Trophy size={18} style={{ color: '#F59E0B' }} />
        </div>

        <div className="flex flex-col gap-2">
          {tousJoueurs.slice(0, 10).map((joueur) => (
            <CarteJoueur
              key={joueur.id}
              joueur={joueur}
              rang={joueur.rang}
              estMoi={joueur.id === 'moi'}
            />
          ))}
        </div>
      </div>

      {/* Section Premium — overlay */}
      <div className="px-5 mb-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="rounded-2xl overflow-hidden relative"
             style={{ border: '1px solid rgba(139, 92, 246, 0.25)' }}>
          {/* Faux classement flou */}
          <div className="p-4 flex flex-col gap-2" style={{ filter: 'blur(4px)', pointerEvents: 'none' }}>
            {[
              { pseudo: 'Amis proches', avatar: '👥', niveau: 15, xp: 3200, streak: 12 },
              { pseudo: 'Équipe Fitness', avatar: '🏋️', niveau: 18, xp: 4100, streak: 20 },
            ].map((j, idx) => (
              <div key={idx} className="flex items-center gap-3 rounded-xl px-3 py-2"
                   style={{ background: 'rgba(30, 30, 58, 0.5)' }}>
                <div className="text-xl">{j.avatar}</div>
                <div className="flex-1">
                  <div className="text-sm font-bold" style={{ color: '#F9FAFB' }}>{j.pseudo}</div>
                  <div className="text-xs" style={{ color: '#9CA3AF' }}>Niv. {j.niveau}</div>
                </div>
                <div className="font-bold text-sm gradient-text">{j.xp.toLocaleString('fr-FR')} XP</div>
              </div>
            ))}
          </div>

          {/* Overlay premium */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4"
               style={{ background: 'rgba(15, 15, 15, 0.85)', backdropFilter: 'blur(8px)' }}>
            <Lock size={28} className="mb-2" style={{ color: '#8B5CF6' }} />
            <h3 className="font-bold text-base mb-1 text-center" style={{ fontFamily: 'Outfit, sans-serif', color: '#F9FAFB' }}>
              Classement entre amis
            </h3>
            <p className="text-xs text-center mb-3" style={{ color: '#9CA3AF' }}>
              Débloque avec LevelUp Pro
            </p>
            <button
              onClick={() => setModalPremium(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', color: 'white' }}
            >
              Débloquer avec LevelUp Pro <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal premium */}
      {modalPremium && <ModalPremium onFermer={() => setModalPremium(false)} />}
    </div>
  );
}
