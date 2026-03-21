// ============================
// ÉCRAN HABITUDES — Liste + Actions + Catalogue
// ============================

import { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Flame, X, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { obtenirDateAujourdhui, obtenirHeure, CATEGORIES_HABITUDES } from '../data/storage';
import confetti from 'canvas-confetti';

const ICONES_DISPONIBLES = ['⭐', '💪', '🎯', '📚', '🧠', '🌿', '🎨', '🎵', '🚶', '🏃', '🥗', '☕', '💤', '🧘', '🏊', '🚴', '✍️', '🧹', '💰', '📸'];
const COULEURS_DISPONIBLES = ['#10B981', '#06B6D4', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#F97316', '#84CC16'];

function ModalAjoutHabitude({ onFermer, onAjouter }) {
  const [vue, setVue] = useState('catalogue'); // 'catalogue' | 'custom'
  const [categorieActive, setCategorieActive] = useState(CATEGORIES_HABITUDES[0].id);
  const [nom, setNom] = useState('');
  const [icone, setIcone] = useState('⭐');
  const [couleur, setCouleur] = useState('#10B981');

  const categorieActuelle = CATEGORIES_HABITUDES.find(c => c.id === categorieActive);

  function ajouterDepuisCatalogue(hab) {
    const cat = CATEGORIES_HABITUDES.find(c => c.id === categorieActive);
    onAjouter({ nom: hab.nom, icone: hab.icone, couleur: cat?.couleur || '#10B981', categorie: categorieActive, xp: hab.xp });
  }

  function soumettre(e) {
    e.preventDefault();
    if (nom.trim().length < 2) return;
    onAjouter({ nom: nom.trim(), icone, couleur, categorie: 'custom', xp: 10 });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
         style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
         onClick={e => e.target === e.currentTarget && onFermer()}>
      <div className="w-full rounded-t-3xl animate-slide-up overflow-y-auto"
           style={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '85vh', maxWidth: '430px' }}>

        <div className="flex items-center justify-between p-5 pb-0">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#F9FAFB' }}>
            Ajouter une habitude
          </h2>
          <button onClick={onFermer} className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', color: '#9CA3AF' }}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-5 mt-4 mb-4">
          {[{ id: 'catalogue', label: '📋 Catalogue' }, { id: 'custom', label: '✏️ Personnalisé' }].map(t => (
            <button
              key={t.id}
              onClick={() => setVue(t.id)}
              className="px-3 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: vue === t.id ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                color: vue === t.id ? '#10B981' : '#6B7280',
                border: vue === t.id ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {vue === 'catalogue' ? (
          <div className="px-5 pb-8">
            {/* Catégories */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
              {CATEGORIES_HABITUDES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategorieActive(cat.id)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: categorieActive === cat.id ? `${cat.couleur}18` : 'rgba(255,255,255,0.04)',
                    color: categorieActive === cat.id ? cat.couleur : '#6B7280',
                    border: categorieActive === cat.id ? `1px solid ${cat.couleur}40` : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {cat.emoji} {cat.nom.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Habitudes de la catégorie */}
            <div className="flex flex-col gap-2">
              {categorieActuelle?.habitudes.map((hab, i) => (
                <button
                  key={i}
                  onClick={() => ajouterDepuisCatalogue(hab)}
                  className="flex items-center gap-3 rounded-xl p-3 text-left transition-all"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <span className="text-xl">{hab.icone}</span>
                  <span className="flex-1 text-sm" style={{ color: '#F9FAFB', fontFamily: 'DM Sans, sans-serif' }}>
                    {hab.nom}
                  </span>
                  <span className="text-xs font-bold" style={{ color: categorieActuelle.couleur }}>
                    +{hab.xp} XP
                  </span>
                  <ChevronRight size={14} style={{ color: '#6B7280' }} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={soumettre} className="px-5 pb-8">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#9CA3AF' }}>Nom</label>
              <input
                type="text"
                value={nom}
                onChange={e => setNom(e.target.value)}
                placeholder="Mon habitude..."
                maxLength={40}
                autoFocus
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#F9FAFB', fontFamily: 'DM Sans, sans-serif', caretColor: '#10B981' }}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#9CA3AF' }}>Icône</label>
              <div className="grid grid-cols-10 gap-1.5">
                {ICONES_DISPONIBLES.map(ic => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcone(ic)}
                    className="aspect-square rounded-xl text-lg flex items-center justify-center transition-all"
                    style={{
                      background: icone === ic ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.04)',
                      border: icone === ic ? '1.5px solid #10B981' : '1.5px solid transparent',
                    }}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: '#9CA3AF' }}>Couleur</label>
              <div className="flex gap-2 flex-wrap">
                {COULEURS_DISPONIBLES.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCouleur(c)}
                    className="w-8 h-8 rounded-full transition-all"
                    style={{ background: c, transform: couleur === c ? 'scale(1.2)' : 'scale(1)', boxShadow: couleur === c ? `0 0 12px ${c}80` : 'none', border: couleur === c ? '2px solid white' : '2px solid transparent' }}
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
        )}
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
        background: faite ? `linear-gradient(135deg, ${habitude.couleur}18, ${habitude.couleur}08)` : 'rgba(30, 30, 58, 0.6)',
        border: faite ? `1px solid ${habitude.couleur}40` : rappelVisuel ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center rounded-xl text-2xl shrink-0"
          style={{ width: '48px', height: '48px', background: `${habitude.couleur}20`, border: `1px solid ${habitude.couleur}30` }}
        >
          {habitude.icone}
        </div>

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

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSupprimer(habitude.id)}
            className="p-2 rounded-lg transition-all"
            style={{ color: '#6B7280' }}
          >
            <Trash2 size={14} />
          </button>

          <button
            onClick={handleToggle}
            className="flex items-center justify-center rounded-xl transition-all duration-200"
            style={{
              width: '44px',
              height: '44px',
              background: faite ? habitude.couleur : 'rgba(255,255,255,0.06)',
              border: faite ? 'none' : '1.5px solid rgba(255,255,255,0.15)',
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

  if (toutesCompletes && !jourParfaitAffiche) {
    setJourParfaitAffiche(true);
    setTimeout(() => {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#10B981', '#06B6D4', '#8B5CF6', '#F59E0B'] });
    }, 200);
  }

  function handleAjouter(habitude) {
    const ok = ajouterHabitude(habitude);
    if (ok) setModalOuvert(false);
  }

  const pourcentage = habitudesActives.length > 0 ? Math.round((nbCompletes / habitudesActives.length) * 100) : 0;
  const peutAjouter = habitudesActives.length < 8;

  return (
    <div className="flex flex-col min-h-screen pb-24"
         style={{ background: 'linear-gradient(160deg, #0F0F0F 0%, #1A1A2E 100%)' }}>

      <div className="px-5 pt-12 pb-4 animate-fade-in">
        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#10B981' }}>
          Mes habitudes
        </p>
        <h1 className="text-2xl font-bold mb-0.5" style={{ fontFamily: 'Sora, sans-serif', color: '#F9FAFB' }}>
          Aujourd'hui
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
               border: toutesCompletes ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255,255,255,0.06)',
             }}>
          {toutesCompletes ? (
            <div className="flex items-center justify-center gap-3 py-2 animate-perfect-day">
              <span className="text-3xl">🏆</span>
              <div>
                <div className="font-black text-lg gradient-text" style={{ fontFamily: 'Outfit, sans-serif' }}>PERFECT DAY !</div>
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
                <div className="h-full rounded-full xp-bar-fill" style={{ width: `${pourcentage}%`, background: 'linear-gradient(90deg, #10B981, #06B6D4)' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Liste */}
      <div className="px-5 flex flex-col gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {habitudesActives.map(habitude => (
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

      {/* Bouton ajouter */}
      <div className="px-5 mt-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <button
          onClick={() => setModalOuvert(true)}
          disabled={!peutAjouter}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 transition-all duration-200"
          style={{
            background: peutAjouter ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.03)',
            border: peutAjouter ? '1.5px dashed rgba(16, 185, 129, 0.3)' : '1.5px dashed rgba(255,255,255,0.08)',
            color: peutAjouter ? '#10B981' : '#4B5563',
          }}
        >
          <Plus size={20} />
          <span className="font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {peutAjouter
              ? `Ajouter une habitude (${habitudesActives.length}/8)`
              : `Limite atteinte (8/8)`}
          </span>
        </button>
      </div>

      {modalOuvert && (
        <ModalAjoutHabitude
          onFermer={() => setModalOuvert(false)}
          onAjouter={handleAjouter}
        />
      )}
    </div>
  );
}
