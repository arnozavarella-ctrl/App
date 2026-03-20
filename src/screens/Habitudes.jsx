// ============================
// ÉCRAN HABITUDES — Liste + Actions
// ============================

import { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Flame, Lock, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { obtenirDateAujourdhui, obtenirHeure } from '../data/storage';
import confetti from 'canvas-confetti';

const ICONES_DISPONIBLES = ['⭐', '💪', '🎯', '📚', '🧠', '🌿', '🎨', '🎵', '🚶', '🏃', '🥗', '☕', '💤', '🧘', '🏊', '🚴'];
const COULEURS_DISPONIBLES = ['#10B981', '#06B6D4', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#F97316', '#84CC16'];

function ModalAjoutHabitude({ onFermer, onAjouter }) {
  const [nom, setNom] = useState('');
  const [icone, setIcone] = useState('⭐');
  const [couleur, setCouleur] = useState('#10B981');

  function soumettre(e) {
    e.preventDefault();
    if (nom.trim().length < 2) return;
    onAjouter({ nom: nom.trim(), icone, couleur });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-0"
         style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
         onClick={(e) => e.target === e.currentTarget && onFermer()}>
      <div className="w-full rounded-t-3xl p-6 animate-slide-up"
           style={{
             background: '#1A1A2E',
             border: '1px solid rgba(255,255,255,0.08)',
             maxWidth: '430px',
           }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#F9FAFB' }}>
            Nouvelle habitude
          </h2>
          <button onClick={onFermer} className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', color: '#9CA3AF' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={soumettre}>
          {/* Nom */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: '#9CA3AF' }}>Nom de l'habitude</label>
            <input
              type="text"
              value={nom}
              onChange={e => setNom(e.target.value)}
              placeholder="Ex: 20 min de yoga..."
              maxLength={40}
              autoFocus
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#F9FAFB',
                fontFamily: 'DM Sans, sans-serif',
                caretColor: '#10B981',
              }}
            />
          </div>

          {/* Choix icône */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: '#9CA3AF' }}>Icône</label>
            <div className="grid grid-cols-8 gap-2">
              {ICONES_DISPONIBLES.map(ic => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcone(ic)}
                  className="aspect-square rounded-xl text-xl flex items-center justify-center transition-all duration-150"
                  style={{
                    background: icone === ic ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.04)',
                    border: icone === ic ? '1.5px solid #10B981' : '1.5px solid transparent',
                    transform: icone === ic ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Choix couleur */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: '#9CA3AF' }}>Couleur</label>
            <div className="flex gap-2 flex-wrap">
              {COULEURS_DISPONIBLES.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCouleur(c)}
                  className="w-8 h-8 rounded-full transition-all duration-150"
                  style={{
                    background: c,
                    transform: couleur === c ? 'scale(1.2)' : 'scale(1)',
                    boxShadow: couleur === c ? `0 0 12px ${c}80` : 'none',
                    border: couleur === c ? '2px solid white' : '2px solid transparent',
                  }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={nom.trim().length < 2}
            className="btn-primary w-full"
            style={{ opacity: nom.trim().length < 2 ? 0.5 : 1 }}
          >
            Ajouter l'habitude
          </button>
        </form>
      </div>
    </div>
  );
}

function CarteHabitude({ habitude, faite, onValider, onAnnuler, onSupprimer, heure }) {
  const [animCheck, setAnimCheck] = useState(false);
  const rappelVisuel = heure >= 18 && !faite;

  function handleToggle() {
    if (!faite) {
      setAnimCheck(true);
      setTimeout(() => setAnimCheck(false), 400);
      onValider(habitude.id);
    } else {
      onAnnuler(habitude.id);
    }
  }

  return (
    <div
      className="rounded-2xl p-4 transition-all duration-300"
      style={{
        background: faite
          ? `linear-gradient(135deg, ${habitude.couleur}18, ${habitude.couleur}08)`
          : 'rgba(30, 30, 58, 0.6)',
        border: faite
          ? `1px solid ${habitude.couleur}40`
          : rappelVisuel
          ? '1px solid rgba(239, 68, 68, 0.3)'
          : '1px solid rgba(255,255,255,0.06)',
        transform: faite ? 'scale(1)' : 'scale(1)',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Icône */}
        <div
          className="flex items-center justify-center rounded-xl text-2xl shrink-0"
          style={{
            width: '48px',
            height: '48px',
            background: `${habitude.couleur}20`,
            border: `1px solid ${habitude.couleur}30`,
          }}
        >
          {habitude.icone}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-sm truncate"
                style={{ fontFamily: 'Outfit, sans-serif', color: faite ? '#F9FAFB' : '#D1D5DB' }}>
              {habitude.nom}
            </h3>
            {rappelVisuel && (
              <div className="w-2 h-2 rounded-full shrink-0 animate-neon-pulse"
                   style={{ background: '#EF4444', boxShadow: '0 0 6px #EF4444' }} />
            )}
          </div>
          <div className="flex items-center gap-1">
            <Flame size={11} style={{ color: habitude.couleur }} />
            <span className="text-xs" style={{ color: '#6B7280' }}>+{habitude.xp} XP</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Supprimer */}
          <button
            onClick={() => onSupprimer(habitude.id)}
            className="p-2 rounded-lg transition-all duration-150"
            style={{ color: '#6B7280', background: 'transparent' }}
            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
          >
            <Trash2 size={14} />
          </button>

          {/* Bouton Done */}
          <button
            onClick={handleToggle}
            className="flex items-center justify-center rounded-xl transition-all duration-200"
            style={{
              width: '44px',
              height: '44px',
              background: faite ? habitude.couleur : 'rgba(255,255,255,0.06)',
              border: faite ? 'none' : `1.5px solid rgba(255,255,255,0.15)`,
              boxShadow: faite ? `0 0 16px ${habitude.couleur}50` : 'none',
              transform: animCheck ? 'scale(0.9)' : 'scale(1)',
            }}
          >
            {faite
              ? <CheckCircle2 size={22} style={{ color: 'white' }} />
              : <Circle size={22} style={{ color: '#6B7280' }} />
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Habitudes() {
  const { donnees, completionsAujourdhui, validerHabitude, devaliderHabitude, supprimerHabitude, ajouterHabitude } = useApp();
  const [modalOuvert, setModalOuvert] = useState(false);
  const [jourParfaitAffiche, setJourParfaitAffiche] = useState(false);
  const heure = obtenirHeure();

  if (!donnees) return null;

  const { habitudes } = donnees;
  const habitudesActives = habitudes.filter(h => h.actif);
  const nbCompletes = completionsAujourdhui.filter(id => habitudesActives.find(h => h.id === id)).length;
  const toutesCompletes = habitudesActives.length > 0 && nbCompletes === habitudesActives.length;

  // Déclencher confettis si jour parfait
  if (toutesCompletes && !jourParfaitAffiche) {
    setJourParfaitAffiche(true);
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#06B6D4', '#8B5CF6', '#F59E0B'],
      });
    }, 200);
  }

  function handleAjouter(habitude) {
    const ok = ajouterHabitude(habitude);
    if (ok) setModalOuvert(false);
  }

  const pourcentage = habitudesActives.length > 0
    ? Math.round((nbCompletes / habitudesActives.length) * 100)
    : 0;

  return (
    <div className="flex flex-col min-h-screen pb-24"
         style={{ background: 'linear-gradient(160deg, #0F0F0F 0%, #1A1A2E 100%)' }}>

      {/* Header */}
      <div className="px-5 pt-12 pb-4 animate-fade-in">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Sora, sans-serif', color: '#F9FAFB' }}>
          Mes Habitudes
        </h1>
        <p className="text-sm" style={{ color: '#9CA3AF' }}>
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Progression du jour */}
      <div className="px-5 mb-4 animate-slide-up">
        <div className="rounded-2xl p-4"
             style={{
               background: toutesCompletes
                 ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.1))'
                 : 'rgba(30, 30, 58, 0.6)',
               border: toutesCompletes
                 ? '1px solid rgba(16, 185, 129, 0.4)'
                 : '1px solid rgba(255,255,255,0.06)',
             }}>
          {toutesCompletes ? (
            <div className="flex items-center justify-center gap-3 py-2 animate-perfect-day">
              <span className="text-3xl">🏆</span>
              <div>
                <div className="font-black text-lg gradient-text" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  PERFECT DAY !
                </div>
                <div className="text-xs" style={{ color: '#9CA3AF' }}>+50 XP bonus débloqué !</div>
              </div>
              <span className="text-3xl">🏆</span>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold" style={{ color: '#F9FAFB', fontFamily: 'Outfit, sans-serif' }}>
                  {nbCompletes} / {habitudesActives.length} complétées
                </span>
                <span className="text-sm font-bold" style={{ color: pourcentage >= 50 ? '#10B981' : '#9CA3AF' }}>
                  {pourcentage}%
                </span>
              </div>
              <div className="rounded-full overflow-hidden" style={{ height: '6px', background: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full xp-bar-fill"
                  style={{
                    width: `${pourcentage}%`,
                    background: 'linear-gradient(90deg, #10B981, #06B6D4)',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Liste des habitudes */}
      <div className="px-5 flex flex-col gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {habitudesActives.map((habitude) => (
          <CarteHabitude
            key={habitude.id}
            habitude={habitude}
            faite={completionsAujourdhui.includes(habitude.id)}
            onValider={validerHabitude}
            onAnnuler={devaliderHabitude}
            onSupprimer={supprimerHabitude}
            heure={heure}
          />
        ))}
      </div>

      {/* Bouton ajouter + limite freemium */}
      <div className="px-5 mt-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        {habitudesActives.length < 5 ? (
          <button
            onClick={() => setModalOuvert(true)}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 transition-all duration-200"
            style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1.5px dashed rgba(16, 185, 129, 0.3)',
              color: '#10B981',
            }}
          >
            <Plus size={20} />
            <span className="font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Ajouter une habitude ({habitudesActives.length}/5)
            </span>
          </button>
        ) : (
          <div className="rounded-2xl p-4 flex items-center gap-3"
               style={{
                 background: 'rgba(139, 92, 246, 0.08)',
                 border: '1px solid rgba(139, 92, 246, 0.2)',
               }}>
            <Lock size={18} style={{ color: '#8B5CF6' }} />
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: '#F9FAFB', fontFamily: 'Outfit, sans-serif' }}>
                Limite atteinte (5/5)
              </p>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>
                Passe à Pro pour des habitudes illimitées
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal d'ajout */}
      {modalOuvert && (
        <ModalAjoutHabitude
          onFermer={() => setModalOuvert(false)}
          onAjouter={handleAjouter}
        />
      )}
    </div>
  );
}
