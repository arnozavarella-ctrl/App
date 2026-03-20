// ============================
// ÉCRAN PROFIL & RÉGLAGES
// ============================

import { useState } from 'react';
import { User, Bell, Moon, Globe, Trash2, ChevronRight, Lock, X, Check, Edit3 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { reinitialiserDonnees, AVATARS, obtenirNomNiveau, calculerNiveau } from '../data/storage';

// Modal changement avatar
function ModalAvatar({ avatarActuel, onChoisir, onFermer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
         style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
         onClick={(e) => e.target === e.currentTarget && onFermer()}>
      <div className="w-full rounded-t-3xl p-6 animate-slide-up"
           style={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.08)', maxWidth: '430px' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#F9FAFB' }}>Choisir un avatar</h2>
          <button onClick={onFermer} className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', color: '#9CA3AF' }}>
            <X size={18} />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {AVATARS.map(avatar => (
            <button
              key={avatar}
              onClick={() => { onChoisir(avatar); onFermer(); }}
              className="aspect-square rounded-2xl text-3xl flex items-center justify-center transition-all duration-150"
              style={{
                background: avatarActuel === avatar ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.04)',
                border: avatarActuel === avatar ? '2px solid #10B981' : '2px solid transparent',
                transform: avatarActuel === avatar ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {avatar}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Modal premium "Bientôt disponible"
function ModalPremiumBientot({ onFermer }) {
  const [email, setEmail] = useState('');
  const [envoye, setEnvoye] = useState(false);

  function soumettre(e) {
    e.preventDefault();
    if (!email.includes('@')) return;
    // Sauvegarde en localStorage
    try {
      const data = JSON.parse(localStorage.getItem('levelUpData') || '{}');
      data.profil = data.profil || {};
      data.profil.emailPremium = email;
      localStorage.setItem('levelUpData', JSON.stringify(data));
    } catch {}
    setEnvoye(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6"
         style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
         onClick={(e) => e.target === e.currentTarget && onFermer()}>
      <div className="w-full rounded-3xl p-6 animate-perfect-day"
           style={{ background: '#1A1A2E', border: '1px solid rgba(139, 92, 246, 0.4)', maxWidth: '380px' }}>
        <div className="text-center mb-6">
          <div className="text-5xl mb-3 animate-float">💎</div>
          <h2 className="text-2xl font-black mb-2" style={{ fontFamily: 'Sora, sans-serif', color: '#F9FAFB' }}>
            LevelUp Pro
          </h2>
          <p className="text-sm" style={{ color: '#9CA3AF', lineHeight: '1.5' }}>
            Inscris-toi pour être notifié en premier au lancement !
          </p>
        </div>

        {!envoye ? (
          <form onSubmit={soumettre}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ton@email.com"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none mb-4"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                color: '#F9FAFB',
                fontFamily: 'DM Sans, sans-serif',
                caretColor: '#8B5CF6',
              }}
            />

            <div className="flex gap-2 mb-4">
              <div className="flex-1 rounded-xl p-3 text-center"
                   style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <div className="font-black text-lg" style={{ color: '#8B5CF6', fontFamily: 'Outfit' }}>4.99€</div>
                <div className="text-xs" style={{ color: '#9CA3AF' }}>/ mois</div>
              </div>
              <div className="flex-1 rounded-xl p-3 text-center"
                   style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.1))', border: '1.5px solid rgba(139, 92, 246, 0.4)' }}>
                <div className="font-black text-lg" style={{ color: '#F9FAFB', fontFamily: 'Outfit' }}>29.99€</div>
                <div className="text-xs" style={{ color: '#10B981' }}>/ an · -50%</div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl font-bold text-white mb-3"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', fontFamily: 'Outfit, sans-serif' }}
            >
              Me notifier au lancement 🚀
            </button>
            <button type="button" onClick={onFermer} className="w-full text-sm" style={{ color: '#6B7280' }}>
              Peut-être plus tard
            </button>
          </form>
        ) : (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="font-bold text-lg mb-2" style={{ color: '#10B981', fontFamily: 'Outfit, sans-serif' }}>
              Inscription confirmée !
            </h3>
            <p className="text-sm mb-4" style={{ color: '#9CA3AF' }}>
              Tu seras parmi les premiers à accéder à LevelUp Pro. Prépare-toi !
            </p>
            <button onClick={onFermer} className="btn-primary px-8">Super !</button>
          </div>
        )}
      </div>
    </div>
  );
}

// Ligne de réglage
function LigneReglage({ icone, label, description, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 py-3 transition-all duration-150"
      style={{ opacity: onClick ? 1 : 1 }}
    >
      <div className="flex items-center justify-center rounded-xl w-9 h-9 shrink-0"
           style={{ background: 'rgba(255,255,255,0.06)' }}>
        {icone}
      </div>
      <div className="flex-1 text-left">
        <div className="text-sm font-medium" style={{ color: '#F9FAFB', fontFamily: 'Outfit, sans-serif' }}>
          {label}
        </div>
        {description && <div className="text-xs" style={{ color: '#6B7280' }}>{description}</div>}
      </div>
      {children || (onClick && <ChevronRight size={16} style={{ color: '#6B7280' }} />)}
    </button>
  );
}

export default function Profil() {
  const { donnees, mettreAJourProfil, setDonnees, afficherToast, infoNiveau } = useApp();
  const [modalAvatar, setModalAvatar] = useState(false);
  const [modalPremium, setModalPremium] = useState(false);
  const [editPrenom, setEditPrenom] = useState(false);
  const [nouveauPrenom, setNouveauPrenom] = useState('');

  if (!donnees) return null;

  const { profil } = donnees;
  const nomNiveau = obtenirNomNiveau(profil.niveau);

  function changerAvatar(avatar) {
    mettreAJourProfil({ avatar });
  }

  function validerPrenom() {
    if (nouveauPrenom.trim().length < 2) return;
    mettreAJourProfil({ prenom: nouveauPrenom.trim() });
    setEditPrenom(false);
    afficherToast('Prénom mis à jour !', 'success', '✏️');
  }

  function confirmerReinit() {
    const ok = window.confirm('⚠️ Réinitialiser toutes tes données ? Cette action est irréversible.');
    if (ok) {
      const nouvellesDonnees = reinitialiserDonnees();
      setDonnees({ ...nouvellesDonnees, onboardingTermine: false });
      afficherToast('Données réinitialisées.', 'info', '🗑️');
    }
  }

  function toggleNotifications() {
    mettreAJourProfil({ notificationsActives: !profil.notificationsActives });
  }

  return (
    <div className="flex flex-col min-h-screen pb-24"
         style={{ background: 'linear-gradient(160deg, #0F0F0F 0%, #1A1A2E 100%)' }}>

      {/* Header profil */}
      <div className="px-5 pt-12 pb-6 animate-fade-in">
        <div className="flex flex-col items-center">
          {/* Avatar */}
          <button
            onClick={() => setModalAvatar(true)}
            className="relative mb-4 transition-all duration-200"
            style={{ transform: 'scale(1)' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div className="flex items-center justify-center rounded-3xl text-5xl animate-pulse-glow"
                 style={{
                   width: '90px',
                   height: '90px',
                   background: 'rgba(30, 30, 58, 0.8)',
                   border: '2px solid rgba(16, 185, 129, 0.3)',
                 }}>
              {profil.avatar}
            </div>
            <div className="absolute -bottom-2 -right-2 rounded-xl flex items-center justify-center"
                 style={{ width: '28px', height: '28px', background: '#10B981' }}>
              <Edit3 size={13} style={{ color: 'white' }} />
            </div>
          </button>

          {/* Prénom */}
          {editPrenom ? (
            <div className="flex items-center gap-2 mb-1">
              <input
                type="text"
                value={nouveauPrenom}
                onChange={e => setNouveauPrenom(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && validerPrenom()}
                autoFocus
                maxLength={20}
                className="text-xl font-bold text-center rounded-xl px-3 py-1 outline-none"
                style={{
                  background: 'rgba(30, 30, 58, 0.8)',
                  border: '1.5px solid rgba(16, 185, 129, 0.5)',
                  color: '#F9FAFB',
                  fontFamily: 'Sora, sans-serif',
                  width: '150px',
                }}
              />
              <button onClick={validerPrenom} className="p-1.5 rounded-lg" style={{ background: '#10B981' }}>
                <Check size={14} style={{ color: 'white' }} />
              </button>
              <button onClick={() => setEditPrenom(false)} className="p-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <X size={14} style={{ color: '#9CA3AF' }} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setNouveauPrenom(profil.prenom); setEditPrenom(true); }}
              className="flex items-center gap-2 mb-1"
            >
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: '#F9FAFB' }}>
                {profil.prenom || 'Mon Profil'}
              </h1>
              <Edit3 size={14} style={{ color: '#6B7280' }} />
            </button>
          )}

          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-semibold" style={{ color: '#10B981' }}>{nomNiveau}</span>
            <span style={{ color: '#374151' }}>·</span>
            <span className="text-sm" style={{ color: '#9CA3AF' }}>Niveau {profil.niveau}</span>
          </div>

          {/* XP mini bar */}
          <div className="w-full max-w-xs">
            <div className="rounded-full overflow-hidden mb-1" style={{ height: '6px', background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full xp-bar-fill"
                style={{
                  width: `${infoNiveau?.pourcentage || 0}%`,
                  background: 'linear-gradient(90deg, #10B981, #06B6D4)',
                }}
              />
            </div>
            <div className="flex justify-between text-xs" style={{ color: '#6B7280' }}>
              <span>{profil.niveauXP} XP</span>
              <span>Niv. {profil.niveau + 1}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="px-5 mb-4 animate-slide-up">
        <div className="grid grid-cols-3 gap-2">
          {[
            { val: profil.streak, label: 'Streak', emoji: '🔥' },
            { val: profil.totalHabitudesCompletes, label: 'Complétées', emoji: '✅' },
            { val: profil.meilleurStreak, label: 'Record', emoji: '⚡' },
          ].map(({ val, label, emoji }) => (
            <div key={label} className="rounded-2xl p-3 text-center"
                 style={{ background: 'rgba(30, 30, 58, 0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-lg mb-0.5">{emoji}</div>
              <div className="font-black text-xl" style={{ fontFamily: 'Outfit, sans-serif', color: '#F9FAFB' }}>{val}</div>
              <div className="text-xs" style={{ color: '#9CA3AF' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Réglages */}
      <div className="px-5 mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="rounded-2xl px-4"
             style={{ background: 'rgba(30, 30, 58, 0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>

          <LigneReglage
            icone={<Bell size={16} style={{ color: '#06B6D4' }} />}
            label="Notifications"
            description={profil.notificationsActives ? 'Activées' : 'Désactivées'}
            onClick={toggleNotifications}
          >
            <div
              className="rounded-full transition-all duration-200"
              style={{
                width: '44px',
                height: '24px',
                background: profil.notificationsActives ? '#10B981' : 'rgba(255,255,255,0.1)',
                position: 'relative',
              }}
            >
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'white',
                position: 'absolute',
                top: '3px',
                transition: 'left 0.2s',
                left: profil.notificationsActives ? '23px' : '3px',
              }} />
            </div>
          </LigneReglage>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)' }} />

          <LigneReglage
            icone={<Moon size={16} style={{ color: '#8B5CF6' }} />}
            label="Mode sombre"
            description="Activé par défaut"
          >
            <div className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6' }}>
              Actif
            </div>
          </LigneReglage>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)' }} />

          <LigneReglage
            icone={<Globe size={16} style={{ color: '#F59E0B' }} />}
            label="Langue"
            description="Français"
          />
        </div>
      </div>

      {/* LevelUp Pro */}
      <div className="px-5 mb-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <button
          onClick={() => setModalPremium(true)}
          className="w-full rounded-2xl p-4 transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.08))',
            border: '1px solid rgba(139, 92, 246, 0.3)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-float">💎</span>
            <div className="flex-1 text-left">
              <div className="font-black text-base mb-0.5" style={{ fontFamily: 'Outfit, sans-serif', color: '#F9FAFB' }}>
                LevelUp Pro
              </div>
              <div className="text-xs" style={{ color: '#9CA3AF' }}>
                Habitudes illimitées · Stats avancées · Thèmes
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full mb-1"
                    style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', color: 'white' }}>
                PRO
              </span>
              <span className="text-xs" style={{ color: '#9CA3AF' }}>dès 4.99€/mois</span>
            </div>
          </div>

          <div className="mt-3 flex gap-2 flex-wrap">
            {['∞ Habitudes', '📊 Stats avancées', '🎨 Thèmes', '👥 Amis'].map(f => (
              <span key={f} className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#9CA3AF' }}>
                {f}
              </span>
            ))}
          </div>
        </button>
      </div>

      {/* Danger zone */}
      <div className="px-5 mb-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="rounded-2xl px-4"
             style={{ background: 'rgba(30, 30, 58, 0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <LigneReglage
            icone={<Trash2 size={16} style={{ color: '#EF4444' }} />}
            label="Réinitialiser mes données"
            description="Supprime tout et repart de zéro"
            onClick={confirmerReinit}
          >
            <ChevronRight size={16} style={{ color: '#EF4444' }} />
          </LigneReglage>
        </div>
      </div>

      {/* Version */}
      <div className="px-5 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <p className="text-xs" style={{ color: '#374151' }}>LevelUp v1.0.0 — Fait avec 🔥 pour les champions</p>
      </div>

      {/* Modals */}
      {modalAvatar && (
        <ModalAvatar
          avatarActuel={profil.avatar}
          onChoisir={changerAvatar}
          onFermer={() => setModalAvatar(false)}
        />
      )}
      {modalPremium && <ModalPremiumBientot onFermer={() => setModalPremium(false)} />}
    </div>
  );
}
