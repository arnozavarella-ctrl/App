// ============================
// ÉCRAN JOURNAL — Réflexion quotidienne
// ============================

import { useState, useEffect } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Save, Smile } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { obtenirDateAujourdhui } from '../data/storage';

const HUMEURS = [
  { valeur: 1, emoji: '😔', label: 'Difficile', couleur: '#EF4444' },
  { valeur: 2, emoji: '😕', label: 'Moyen', couleur: '#F59E0B' },
  { valeur: 3, emoji: '😐', label: 'Ça va', couleur: '#6B7280' },
  { valeur: 4, emoji: '😊', label: 'Bien', couleur: '#10B981' },
  { valeur: 5, emoji: '🤩', label: 'Top !', couleur: '#8B5CF6' },
];

const QUESTIONS_REFLEXION = [
  "Qu'est-ce qui m'a rendu fier(e) aujourd'hui ?",
  "Qu'est-ce que j'aurais pu mieux faire ?",
  "Quelle leçon j'ai apprise aujourd'hui ?",
  "Comment je me suis senti(e) globalement ?",
  "Qu'est-ce qui m'a motivé(e) aujourd'hui ?",
];

function formatDateFr(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(year, month - 1, day);
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return date.toLocaleDateString('fr-FR', options);
}

function obtenirDateRelative(dateStr) {
  const aujourd_hui = obtenirDateAujourdhui();
  const hier = new Date();
  hier.setDate(hier.getDate() - 1);
  const hierStr = hier.toISOString().split('T')[0];
  if (dateStr === aujourd_hui) return "Aujourd'hui";
  if (dateStr === hierStr) return 'Hier';
  return formatDateFr(dateStr);
}

export default function Journal() {
  const { donnees, sauvegarderJournal, entreeJournalAujourdhui } = useApp();
  const [vue, setVue] = useState('aujourd_hui'); // 'aujourd_hui' | 'historique'
  const [humeur, setHumeur] = useState(entreeJournalAujourdhui?.humeur || null);
  const [gratitude, setGratitude] = useState(entreeJournalAujourdhui?.gratitude || ['', '', '']);
  const [reflexion, setReflexion] = useState(entreeJournalAujourdhui?.reflexion || '');
  const [intention, setIntention] = useState(entreeJournalAujourdhui?.intentionDemain || '');
  const [sauvegarde, setSauvegarde] = useState(false);
  const [questionIdx, setQuestionIdx] = useState(0);

  useEffect(() => {
    if (entreeJournalAujourdhui) {
      setHumeur(entreeJournalAujourdhui.humeur || null);
      setGratitude(entreeJournalAujourdhui.gratitude || ['', '', '']);
      setReflexion(entreeJournalAujourdhui.reflexion || '');
      setIntention(entreeJournalAujourdhui.intentionDemain || '');
    }
  }, [entreeJournalAujourdhui]);

  if (!donnees) return null;

  const { journal } = donnees;
  const journalDates = Object.keys(journal || {}).sort((a, b) => b.localeCompare(a));
  const aujourd_hui = obtenirDateAujourdhui();

  function sauvegarder() {
    sauvegarderJournal({ humeur, gratitude, reflexion, intentionDemain: intention });
    setSauvegarde(true);
    setTimeout(() => setSauvegarde(false), 2000);
  }

  const dejaRempli = entreeJournalAujourdhui?.reflexion || entreeJournalAujourdhui?.gratitude?.some(g => g);

  return (
    <div className="flex flex-col min-h-screen pb-24"
         style={{ background: 'linear-gradient(160deg, #0F0F0F 0%, #1A1A2E 80%, #0F0F0F 100%)' }}>

      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#8B5CF6' }}>
              Mon journal
            </p>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: '#F9FAFB' }}>
              Réflexion
            </h1>
          </div>
          <div className="flex items-center justify-center rounded-2xl text-2xl"
               style={{ width: '48px', height: '48px', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            📝
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          {[{ id: 'aujourd_hui', label: "Aujourd'hui" }, { id: 'historique', label: 'Historique' }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setVue(tab.id)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: vue === tab.id ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.04)',
                color: vue === tab.id ? '#8B5CF6' : '#6B7280',
                border: vue === tab.id ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {vue === 'aujourd_hui' ? (
        <div className="flex flex-col gap-4 px-5">

          {/* Humeur */}
          <div className="rounded-2xl p-4"
               style={{ background: 'rgba(30, 30, 58, 0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Smile size={16} style={{ color: '#8B5CF6' }} />
              <h2 className="font-bold text-sm" style={{ color: '#F9FAFB', fontFamily: 'Outfit, sans-serif' }}>
                Comment tu te sens aujourd'hui ?
              </h2>
            </div>
            <div className="flex justify-between">
              {HUMEURS.map(h => (
                <button
                  key={h.valeur}
                  onClick={() => setHumeur(h.valeur)}
                  className="flex flex-col items-center gap-1 transition-all duration-200"
                  style={{ transform: humeur === h.valeur ? 'scale(1.2)' : 'scale(1)' }}
                >
                  <div
                    className="text-2xl rounded-xl p-2 transition-all"
                    style={{
                      background: humeur === h.valeur ? `${h.couleur}20` : 'transparent',
                      border: humeur === h.valeur ? `1.5px solid ${h.couleur}` : '1.5px solid transparent',
                    }}
                  >
                    {h.emoji}
                  </div>
                  <span className="text-xs" style={{ color: humeur === h.valeur ? h.couleur : '#6B7280', fontFamily: 'DM Sans, sans-serif' }}>
                    {h.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Gratitude */}
          <div className="rounded-2xl p-4"
               style={{ background: 'rgba(30, 30, 58, 0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">🙏</span>
              <h2 className="font-bold text-sm" style={{ color: '#F9FAFB', fontFamily: 'Outfit, sans-serif' }}>
                3 choses pour lesquelles je suis reconnaissant(e)
              </h2>
            </div>
            <div className="flex flex-col gap-2">
              {gratitude.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: '#F59E0B', fontFamily: 'Outfit, sans-serif', minWidth: '20px' }}>
                    {i + 1}.
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={e => {
                      const nouv = [...gratitude];
                      nouv[i] = e.target.value;
                      setGratitude(nouv);
                    }}
                    placeholder={['Ma famille, mes amis...', 'Un moment de la journée...', 'Une opportunité...'][i]}
                    className="flex-1 rounded-xl px-3 py-2 text-sm outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#F9FAFB',
                      fontFamily: 'DM Sans, sans-serif',
                    }}
                    onFocus={e => { e.target.style.border = '1px solid rgba(245,158,11,0.5)'; }}
                    onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.08)'; }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Réflexion */}
          <div className="rounded-2xl p-4"
               style={{ background: 'rgba(30, 30, 58, 0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">💭</span>
                <h2 className="font-bold text-sm" style={{ color: '#F9FAFB', fontFamily: 'Outfit, sans-serif' }}>
                  Ma réflexion du jour
                </h2>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setQuestionIdx((questionIdx - 1 + QUESTIONS_REFLEXION.length) % QUESTIONS_REFLEXION.length)}
                  className="p-1 rounded-lg"
                  style={{ color: '#6B7280' }}
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setQuestionIdx((questionIdx + 1) % QUESTIONS_REFLEXION.length)}
                  className="p-1 rounded-lg"
                  style={{ color: '#6B7280' }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
            <p className="text-xs mb-2 italic" style={{ color: '#8B5CF6', fontFamily: 'DM Sans, sans-serif' }}>
              💡 {QUESTIONS_REFLEXION[questionIdx]}
            </p>
            <textarea
              value={reflexion}
              onChange={e => setReflexion(e.target.value)}
              placeholder="Écris librement, sans te juger..."
              rows={4}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-all resize-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#F9FAFB',
                fontFamily: 'DM Sans, sans-serif',
                lineHeight: '1.6',
              }}
              onFocus={e => { e.target.style.border = '1px solid rgba(139,92,246,0.5)'; }}
              onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.08)'; }}
            />
          </div>

          {/* Intention de demain */}
          <div className="rounded-2xl p-4"
               style={{ background: 'rgba(30, 30, 58, 0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">🌅</span>
              <h2 className="font-bold text-sm" style={{ color: '#F9FAFB', fontFamily: 'Outfit, sans-serif' }}>
                Mon intention pour demain
              </h2>
            </div>
            <input
              type="text"
              value={intention}
              onChange={e => setIntention(e.target.value)}
              placeholder="Je vais me concentrer sur..."
              className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#F9FAFB',
                fontFamily: 'DM Sans, sans-serif',
              }}
              onFocus={e => { e.target.style.border = '1px solid rgba(6,182,212,0.5)'; }}
              onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.08)'; }}
            />
          </div>

          {/* Bouton sauvegarder */}
          <button
            onClick={sauvegarder}
            className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-200"
            style={{
              background: sauvegarde
                ? 'linear-gradient(135deg, #10B981, #059669)'
                : 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
              color: 'white',
              fontFamily: 'Outfit, sans-serif',
              boxShadow: sauvegarde ? '0 4px 20px rgba(16,185,129,0.4)' : '0 4px 20px rgba(139,92,246,0.4)',
            }}
          >
            {sauvegarde ? (
              <>✓ Sauvegardé</>
            ) : (
              <><Save size={18} /> Sauvegarder {!dejaRempli && '(+15 XP)'}</>
            )}
          </button>

          {/* Info XP */}
          {!dejaRempli && (
            <p className="text-center text-xs" style={{ color: '#6B7280' }}>
              Tu gagneras 15 XP en complétant ton journal aujourd'hui ✨
            </p>
          )}
        </div>
      ) : (
        /* Historique */
        <div className="flex flex-col gap-3 px-5">
          {journalDates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="text-5xl">📖</div>
              <p className="text-center" style={{ color: '#6B7280', fontFamily: 'DM Sans, sans-serif' }}>
                Aucune entrée pour l'instant.<br />
                Commence à écrire aujourd'hui !
              </p>
            </div>
          ) : (
            journalDates.map(date => {
              const entree = journal[date];
              const humeurInfo = HUMEURS.find(h => h.valeur === entree.humeur);
              const hasContent = entree.reflexion || entree.gratitude?.some(g => g);
              if (!hasContent && !entree.humeur) return null;

              return (
                <div
                  key={date}
                  className="rounded-2xl p-4"
                  style={{
                    background: date === aujourd_hui
                      ? 'rgba(139, 92, 246, 0.08)'
                      : 'rgba(30, 30, 58, 0.6)',
                    border: date === aujourd_hui
                      ? '1px solid rgba(139, 92, 246, 0.3)'
                      : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold" style={{ color: '#F9FAFB', fontFamily: 'Outfit, sans-serif' }}>
                      {obtenirDateRelative(date)}
                    </span>
                    {humeurInfo && (
                      <span className="text-xl">{humeurInfo.emoji}</span>
                    )}
                  </div>

                  {entree.gratitude?.some(g => g) && (
                    <div className="mb-2">
                      <p className="text-xs mb-1" style={{ color: '#F59E0B' }}>🙏 Gratitude</p>
                      {entree.gratitude.filter(g => g).map((g, i) => (
                        <p key={i} className="text-xs" style={{ color: '#9CA3AF' }}>• {g}</p>
                      ))}
                    </div>
                  )}

                  {entree.reflexion && (
                    <div>
                      <p className="text-xs mb-1" style={{ color: '#8B5CF6' }}>💭 Réflexion</p>
                      <p className="text-xs" style={{ color: '#9CA3AF', lineHeight: '1.5' }}>
                        {entree.reflexion.length > 120 ? entree.reflexion.slice(0, 120) + '...' : entree.reflexion}
                      </p>
                    </div>
                  )}

                  {entree.intentionDemain && (
                    <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="text-xs" style={{ color: '#06B6D4' }}>🌅 {entree.intentionDemain}</p>
                    </div>
                  )}
                </div>
              );
            }).filter(Boolean)
          )}
        </div>
      )}
    </div>
  );
}
