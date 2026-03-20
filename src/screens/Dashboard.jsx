// ============================
// ÉCRAN DASHBOARD — Accueil
// ============================

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Zap, Download, ChevronRight, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  obtenirSalutation,
  obtenirCitationDuJour,
  obtenirDateAujourdhui,
  calculerNiveau,
  obtenirNomNiveau,
} from '../data/storage';

export default function Dashboard() {
  const { donnees, completionsAujourdhui, infoNiveau, deferredInstallPrompt, afficherToast } = useApp();
  const navigate = useNavigate();
  const [streakAnime, setStreakAnime] = useState(false);
  const [appInstallable, setAppInstallable] = useState(false);
  const firstRender = useRef(true);

  const citation = obtenirCitationDuJour();

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      setTimeout(() => setStreakAnime(true), 300);
    }
  }, []);

  useEffect(() => {
    setAppInstallable(!!deferredInstallPrompt);
  }, [deferredInstallPrompt]);

  if (!donnees) return null;

  const { profil, habitudes } = donnees;
  const habitudesActives = habitudes.filter(h => h.actif);
  const nbCompletes = completionsAujourdhui.filter(id =>
    habitudesActives.find(h => h.id === id)
  ).length;
  const pourcentage = habitudesActives.length > 0
    ? Math.round((nbCompletes / habitudesActives.length) * 100)
    : 0;

  const salutation = obtenirSalutation(profil.prenom || 'Champion');
  const nomNiveau = obtenirNomNiveau(profil.niveau);

  async function installerApp() {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      afficherToast('LevelUp installé avec succès !', 'success', '📱');
      setAppInstallable(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen pb-24"
         style={{ background: 'linear-gradient(160deg, #0F0F0F 0%, #1A1A2E 80%, #0F0F0F 100%)' }}>

      {/* Header */}
      <div className="px-5 pt-12 pb-4 animate-slide-up">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: '#9CA3AF', fontFamily: 'DM Sans, sans-serif' }}>
              {nomNiveau} · Niveau {profil.niveau}
            </p>
            <h1 className="text-2xl font-bold leading-tight" style={{ fontFamily: 'Sora, sans-serif', color: '#F9FAFB' }}>
              {salutation}
            </h1>
          </div>
          <button
            onClick={() => navigate('/profil')}
            className="flex items-center justify-center rounded-2xl text-3xl transition-all"
            style={{
              width: '52px',
              height: '52px',
              background: 'rgba(30, 30, 58, 0.8)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {profil.avatar}
          </button>
        </div>
      </div>

      {/* Streak Counter */}
      <div className="px-5 mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="rounded-3xl p-6 relative overflow-hidden"
             style={{
               background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)',
               border: '1px solid rgba(245, 158, 11, 0.25)',
             }}>
          {/* Fond décoratif */}
          <div className="absolute top-0 right-0 text-8xl opacity-10 -mt-2 -mr-4 pointer-events-none">
            🔥
          </div>

          <div className="flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame size={16} style={{ color: '#F59E0B' }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#F59E0B' }}>
                  Streak actuel
                </span>
              </div>
              <div className={`text-7xl font-black leading-none mb-1 ${streakAnime ? 'animate-count-up' : ''}`}
                   style={{ fontFamily: 'Outfit, sans-serif', color: '#F9FAFB' }}>
                {profil.streak}
              </div>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>
                {profil.streak === 0
                  ? 'Commence aujourd\'hui !'
                  : profil.streak === 1
                  ? '1 jour consécutif 💪'
                  : `${profil.streak} jours consécutifs 🔥`
                }
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs mb-2" style={{ color: '#9CA3AF' }}>Meilleur</div>
              <div className="text-3xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#F59E0B' }}>
                {profil.meilleurStreak}
              </div>
              <div className="text-xs" style={{ color: '#9CA3AF' }}>jours</div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre XP */}
      <div className="px-5 mb-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="rounded-2xl p-4"
             style={{
               background: 'rgba(30, 30, 58, 0.6)',
               border: '1px solid rgba(255,255,255,0.06)',
             }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap size={16} style={{ color: '#06B6D4' }} />
              <span className="text-sm font-semibold" style={{ color: '#F9FAFB', fontFamily: 'Outfit, sans-serif' }}>
                Niveau {profil.niveau}
              </span>
            </div>
            <span className="text-xs" style={{ color: '#9CA3AF' }}>
              {infoNiveau?.xpDansNiveau} / {infoNiveau?.xpPourProchainNiveau} XP
            </span>
          </div>

          {/* Barre de progression */}
          <div className="rounded-full overflow-hidden" style={{ height: '10px', background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full xp-bar-fill"
              style={{
                width: `${infoNiveau?.pourcentage || 0}%`,
                background: 'linear-gradient(90deg, #06B6D4, #10B981)',
                boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
              }}
            />
          </div>

          <div className="flex justify-between mt-2">
            <span className="text-xs" style={{ color: '#9CA3AF' }}>
              {infoNiveau?.pourcentage || 0}% vers le niveau {profil.niveau + 1}
            </span>
            <span className="text-xs font-semibold gradient-text">
              {profil.niveauXP} XP total
            </span>
          </div>
        </div>
      </div>

      {/* Résumé du jour */}
      <div className="px-5 mb-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="rounded-2xl p-4"
             style={{
               background: 'rgba(30, 30, 58, 0.6)',
               border: '1px solid rgba(255,255,255,0.06)',
             }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base" style={{ fontFamily: 'Outfit, sans-serif', color: '#F9FAFB' }}>
              Aujourd'hui
            </h2>
            <div className="flex items-center gap-2">
              <div
                className="text-sm font-bold px-3 py-1 rounded-full"
                style={{
                  background: pourcentage === 100
                    ? 'linear-gradient(135deg, #10B981, #059669)'
                    : 'rgba(255,255,255,0.06)',
                  color: pourcentage === 100 ? 'white' : '#9CA3AF',
                  fontFamily: 'Outfit, sans-serif',
                }}
              >
                {pourcentage}%
              </div>
            </div>
          </div>

          {/* Liste habitudes */}
          <div className="flex flex-col gap-2">
            {habitudesActives.slice(0, 5).map((habitude) => {
              const faite = completionsAujourdhui.includes(habitude.id);
              return (
                <div
                  key={habitude.id}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 transition-all duration-200"
                  style={{
                    background: faite ? `${habitude.couleur}15` : 'rgba(255,255,255,0.03)',
                    border: faite ? `1px solid ${habitude.couleur}30` : '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <span className="text-lg">{habitude.icone}</span>
                  <span className="flex-1 text-sm" style={{ color: faite ? '#F9FAFB' : '#6B7280', fontFamily: 'DM Sans, sans-serif' }}>
                    {habitude.nom}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${faite ? 'animate-check-bounce' : ''}`}
                    style={{
                      background: faite ? habitude.couleur : 'transparent',
                      border: faite ? 'none' : '1.5px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    {faite && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bouton voir tout */}
          <button
            onClick={() => navigate('/habitudes')}
            className="w-full mt-3 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1 transition-all duration-200"
            style={{
              color: '#10B981',
              background: 'rgba(16, 185, 129, 0.08)',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            Voir toutes mes habitudes <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Citation du jour */}
      <div className="px-5 mb-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="rounded-2xl p-4"
             style={{
               background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.05))',
               border: '1px solid rgba(139, 92, 246, 0.2)',
             }}>
          <div className="flex items-start gap-3">
            <Star size={16} className="mt-0.5 shrink-0" style={{ color: '#8B5CF6' }} />
            <div>
              <p className="text-sm italic mb-2" style={{ color: '#D1D5DB', fontFamily: 'DM Sans, sans-serif', lineHeight: '1.5' }}>
                "{citation.texte}"
              </p>
              <p className="text-xs font-semibold" style={{ color: '#8B5CF6' }}>
                — {citation.auteur}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton CTA si rien fait */}
      {nbCompletes === 0 && (
        <div className="px-5 mb-4 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <button
            onClick={() => navigate('/habitudes')}
            className="btn-primary w-full text-lg flex items-center justify-center gap-2 py-4"
          >
            🚀 Commencer ma journée
          </button>
        </div>
      )}

      {/* Bouton d'installation PWA */}
      {appInstallable && (
        <div className="px-5 mb-4 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <button
            onClick={installerApp}
            className="w-full flex items-center justify-center gap-3 rounded-2xl py-3 px-4 transition-all duration-200"
            style={{
              background: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              color: '#06B6D4',
            }}
          >
            <Download size={18} />
            <span className="font-semibold text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Installer LevelUp sur mon téléphone
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
