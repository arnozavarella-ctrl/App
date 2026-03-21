// ============================
// ÉCRAN DASHBOARD — Accueil
// ============================

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Zap, Download, ChevronRight, Star, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  obtenirSalutation,
  obtenirCitationDuJour,
  obtenirDateAujourdhui,
  calculerNiveau,
  obtenirNomNiveau,
  obtenirDefiDuJour,
} from '../data/storage';

const HUMEURS = [
  { valeur: 1, emoji: '😔', couleur: '#EF4444' },
  { valeur: 2, emoji: '😕', couleur: '#F59E0B' },
  { valeur: 3, emoji: '😐', couleur: '#6B7280' },
  { valeur: 4, emoji: '😊', couleur: '#10B981' },
  { valeur: 5, emoji: '🤩', couleur: '#8B5CF6' },
];

export default function Dashboard() {
  const { donnees, completionsAujourdhui, infoNiveau, deferredInstallPrompt, afficherToast, sauvegarderJournal, entreeJournalAujourdhui, marquerDefiTermine } = useApp();
  const navigate = useNavigate();
  const [streakAnime, setStreakAnime] = useState(false);
  const [appInstallable, setAppInstallable] = useState(false);
  const firstRender = useRef(true);

  const citation = obtenirCitationDuJour();
  const defi = obtenirDefiDuJour();

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
  const nbCompletes = completionsAujourdhui.filter(id => habitudesActives.find(h => h.id === id)).length;
  const pourcentage = habitudesActives.length > 0 ? Math.round((nbCompletes / habitudesActives.length) * 100) : 0;

  const salutation = obtenirSalutation(profil.prenom || 'Champion');
  const nomNiveau = obtenirNomNiveau(profil.niveau);
  const humeurAujourdhui = entreeJournalAujourdhui?.humeur;
  const defiTermine = entreeJournalAujourdhui?.defiTermine;

  async function installerApp() {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      afficherToast('LevelUp installé avec succès !', 'success', '📱');
      setAppInstallable(false);
    }
  }

  function choisirHumeur(valeur) {
    sauvegarderJournal({ humeur: valeur });
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

      {/* Humeur rapide */}
      <div className="px-5 mb-4 animate-slide-up" style={{ animationDelay: '0.05s' }}>
        <div className="rounded-2xl p-4"
             style={{ background: 'rgba(30, 30, 58, 0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs font-semibold mb-3" style={{ color: '#9CA3AF' }}>
            Comment tu te sens aujourd'hui ?
          </p>
          <div className="flex justify-between">
            {HUMEURS.map(h => (
              <button
                key={h.valeur}
                onClick={() => choisirHumeur(h.valeur)}
                className="text-2xl transition-all duration-200"
                style={{
                  transform: humeurAujourdhui === h.valeur ? 'scale(1.3)' : 'scale(1)',
                  filter: humeurAujourdhui && humeurAujourdhui !== h.valeur ? 'grayscale(0.7) opacity(0.5)' : 'none',
                }}
              >
                {h.emoji}
              </button>
            ))}
          </div>
          {!humeurAujourdhui && (
            <button
              onClick={() => navigate('/journal')}
              className="w-full mt-2 text-xs text-center"
              style={{ color: '#6B7280' }}
            >
              Ouvre le journal pour plus de réflexion →
            </button>
          )}
        </div>
      </div>

      {/* Barre XP */}
      <div className="px-5 mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="rounded-2xl p-4"
             style={{ background: 'rgba(30, 30, 58, 0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap size={16} style={{ color: '#06B6D4' }} />
              <span className="text-sm font-semibold" style={{ color: '#F9FAFB', fontFamily: 'Outfit, sans-serif' }}>
                Niveau {profil.niveau}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Flame size={14} style={{ color: '#F59E0B' }} />
                <span className="text-sm font-bold" style={{ color: '#F59E0B', fontFamily: 'Outfit, sans-serif' }}>
                  {profil.streak}j
                </span>
              </div>
              <span className="text-xs" style={{ color: '#9CA3AF' }}>
                {infoNiveau?.xpDansNiveau} / {infoNiveau?.xpPourProchainNiveau} XP
              </span>
            </div>
          </div>
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
              {profil.niveauXP} XP
            </span>
          </div>
        </div>
      </div>

      {/* Défi du jour */}
      <div className="px-5 mb-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div
          className="rounded-2xl p-4 relative overflow-hidden"
          style={{
            background: defiTermine
              ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))'
              : 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(8,145,178,0.05))',
            border: defiTermine
              ? '1px solid rgba(16,185,129,0.3)'
              : '1px solid rgba(6,182,212,0.25)',
          }}
        >
          <div className="absolute top-0 right-0 text-6xl opacity-10 -mt-2 -mr-2 pointer-events-none">
            {defi.emoji}
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Target size={14} style={{ color: defiTermine ? '#10B981' : '#06B6D4' }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: defiTermine ? '#10B981' : '#06B6D4' }}>
                Défi du jour · +20 XP
              </span>
            </div>
            <p className="text-sm font-semibold mb-3" style={{ color: '#F9FAFB', lineHeight: '1.4', fontFamily: 'DM Sans, sans-serif' }}>
              {defi.emoji} {defi.texte}
            </p>
            {!defiTermine ? (
              <button
                onClick={marquerDefiTermine}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: 'rgba(6,182,212,0.15)',
                  color: '#06B6D4',
                  border: '1px solid rgba(6,182,212,0.3)',
                  fontFamily: 'Outfit, sans-serif',
                }}
              >
                ✓ Défi relevé !
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="text-sm font-bold px-3 py-1 rounded-full"
                     style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
                  ✓ Défi terminé !
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Résumé du jour */}
      <div className="px-5 mb-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="rounded-2xl p-4"
             style={{ background: 'rgba(30, 30, 58, 0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base" style={{ fontFamily: 'Outfit, sans-serif', color: '#F9FAFB' }}>
              Habitudes du jour
            </h2>
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

          <div className="flex flex-col gap-2">
            {habitudesActives.slice(0, 5).map((habitude) => {
              const faite = completionsAujourdhui.includes(habitude.id);
              return (
                <div
                  key={habitude.id}
                  className="flex items-center gap-3 rounded-xl px-3 py-2"
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

          <button
            onClick={() => navigate('/habitudes')}
            className="w-full mt-3 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1 transition-all"
            style={{ color: '#10B981', background: 'rgba(16, 185, 129, 0.08)', fontFamily: 'Outfit, sans-serif' }}
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

      {/* Accès rapides */}
      <div className="px-5 mb-4 animate-slide-up" style={{ animationDelay: '0.45s' }}>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/journal')}
            className="rounded-2xl p-4 text-left transition-all"
            style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}
          >
            <div className="text-2xl mb-2">📝</div>
            <p className="text-sm font-bold" style={{ color: '#F9FAFB', fontFamily: 'Outfit, sans-serif' }}>Mon journal</p>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>
              {entreeJournalAujourdhui?.reflexion ? 'Complété ✓' : 'À remplir · +15 XP'}
            </p>
          </button>
          <button
            onClick={() => navigate('/objectifs')}
            className="rounded-2xl p-4 text-left transition-all"
            style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}
          >
            <div className="text-2xl mb-2">🎯</div>
            <p className="text-sm font-bold" style={{ color: '#F9FAFB', fontFamily: 'Outfit, sans-serif' }}>Objectifs</p>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>
              {(donnees.objectifs || []).filter(o => !o.termine).length} en cours
            </p>
          </button>
        </div>
      </div>

      {/* CTA si rien de fait */}
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

      {/* Bouton installation PWA */}
      {appInstallable && (
        <div className="px-5 mb-4 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <button
            onClick={installerApp}
            className="w-full flex items-center justify-center gap-3 rounded-2xl py-3 px-4 transition-all"
            style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', color: '#06B6D4' }}
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
