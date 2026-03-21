// ============================
// ÉCRAN OBJECTIFS — Goals tracking
// ============================

import { useState } from 'react';
import { Plus, ChevronDown, ChevronUp, Trash2, Check, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DOMAINES } from '../data/storage';

const ICONES_OBJECTIFS = ['🎯', '🚀', '💪', '📚', '🏆', '💡', '🎨', '💰', '🌍', '❤️', '🎵', '⚽', '🧠', '✍️', '🏋️', '🌱'];

function ProgressBar({ etapes }) {
  const total = etapes.length;
  const faites = etapes.filter(e => e.fait).length;
  const pct = total > 0 ? Math.round((faites / total) * 100) : 0;
  const domaine = DOMAINES[0];

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs" style={{ color: '#9CA3AF' }}>{faites}/{total} étapes</span>
        <span className="text-xs font-semibold" style={{ color: pct === 100 ? '#10B981' : '#8B5CF6' }}>{pct}%</span>
      </div>
      <div className="rounded-full overflow-hidden" style={{ height: '6px', background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: pct === 100
              ? 'linear-gradient(90deg, #10B981, #059669)'
              : 'linear-gradient(90deg, #8B5CF6, #7C3AED)',
            boxShadow: pct === 100 ? '0 0 8px rgba(16,185,129,0.5)' : '0 0 8px rgba(139,92,246,0.4)',
          }}
        />
      </div>
    </div>
  );
}

function CarteObjectif({ objectif, onToggleEtape, onSupprimer }) {
  const [ouvert, setOuvert] = useState(false);
  const domaine = DOMAINES.find(d => d.id === objectif.categorie) || DOMAINES[0];
  const pct = objectif.etapes.length > 0
    ? Math.round((objectif.etapes.filter(e => e.fait).length / objectif.etapes.length) * 100)
    : 0;

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        background: objectif.termine
          ? 'rgba(16, 185, 129, 0.08)'
          : 'rgba(30, 30, 58, 0.6)',
        border: objectif.termine
          ? '1px solid rgba(16, 185, 129, 0.3)'
          : '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <button
        className="w-full p-4 text-left"
        onClick={() => setOuvert(!ouvert)}
      >
        <div className="flex items-start gap-3">
          <div
            className="text-2xl flex-shrink-0 rounded-xl flex items-center justify-center"
            style={{
              width: '44px',
              height: '44px',
              background: `${domaine.couleur}15`,
              border: `1px solid ${domaine.couleur}30`,
            }}
          >
            {objectif.icone}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: `${domaine.couleur}15`, color: domaine.couleur }}
              >
                {domaine.emoji} {domaine.nom}
              </span>
              {objectif.termine && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
                  ✓ Atteint !
                </span>
              )}
            </div>
            <p className="font-bold text-sm mb-2" style={{ color: '#F9FAFB', fontFamily: 'Outfit, sans-serif' }}>
              {objectif.titre}
            </p>
            {objectif.etapes.length > 0 && <ProgressBar etapes={objectif.etapes} />}
          </div>
          <div style={{ color: '#6B7280' }}>
            {ouvert ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </button>

      {ouvert && (
        <div className="px-4 pb-4">
          {objectif.description && (
            <p className="text-sm mb-3 italic" style={{ color: '#9CA3AF', lineHeight: '1.5' }}>
              {objectif.description}
            </p>
          )}

          {objectif.etapes.length > 0 && (
            <div className="flex flex-col gap-2 mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7280' }}>
                Étapes
              </p>
              {objectif.etapes.map(etape => (
                <button
                  key={etape.id}
                  onClick={() => onToggleEtape(objectif.id, etape.id)}
                  className="flex items-center gap-3 text-left rounded-xl px-3 py-2 transition-all duration-200"
                  style={{
                    background: etape.fait ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)',
                    border: etape.fait ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <div
                    className="flex-shrink-0 rounded-full flex items-center justify-center transition-all"
                    style={{
                      width: '22px',
                      height: '22px',
                      background: etape.fait ? '#10B981' : 'transparent',
                      border: etape.fait ? 'none' : '1.5px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    {etape.fait && <Check size={12} color="white" strokeWidth={3} />}
                  </div>
                  <span
                    className="text-sm flex-1"
                    style={{
                      color: etape.fait ? '#6B7280' : '#F9FAFB',
                      textDecoration: etape.fait ? 'line-through' : 'none',
                      fontFamily: 'DM Sans, sans-serif',
                    }}
                  >
                    {etape.texte}
                  </span>
                </button>
              ))}
            </div>
          )}

          {objectif.dateEcheance && (
            <p className="text-xs mb-3" style={{ color: '#6B7280' }}>
              📅 Échéance : {new Date(objectif.dateEcheance).toLocaleDateString('fr-FR')}
            </p>
          )}

          <button
            onClick={() => onSupprimer(objectif.id)}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{ color: '#EF4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <Trash2 size={12} /> Supprimer
          </button>
        </div>
      )}
    </div>
  );
}

function FormulaireObjectif({ onAjouter, onFermer }) {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [categorie, setCategorie] = useState('sante');
  const [icone, setIcone] = useState('🎯');
  const [etapes, setEtapes] = useState(['', '']);
  const [dateEcheance, setDateEcheance] = useState('');

  const domaineChoisi = DOMAINES.find(d => d.id === categorie);

  function soumettre() {
    if (!titre.trim()) return;
    onAjouter({ titre: titre.trim(), description: description.trim(), categorie, icone, couleur: domaineChoisi?.couleur, etapes, dateEcheance: dateEcheance || null });
    onFermer();
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#F9FAFB',
    fontFamily: 'DM Sans, sans-serif',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
         style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div
        className="w-full rounded-t-3xl p-5 animate-slide-up overflow-y-auto"
        style={{
          background: '#1A1A2E',
          border: '1px solid rgba(255,255,255,0.1)',
          maxHeight: '90vh',
          maxWidth: '430px',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ fontFamily: 'Sora, sans-serif', color: '#F9FAFB' }}>
            Nouvel objectif
          </h2>
          <button onClick={onFermer} className="text-2xl" style={{ color: '#6B7280' }}>✕</button>
        </div>

        {/* Icône */}
        <div className="mb-4">
          <p className="text-xs font-semibold mb-2" style={{ color: '#9CA3AF' }}>Icône</p>
          <div className="grid grid-cols-8 gap-2">
            {ICONES_OBJECTIFS.map(ic => (
              <button
                key={ic}
                onClick={() => setIcone(ic)}
                className="text-xl rounded-xl p-2 transition-all"
                style={{
                  background: icone === ic ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)',
                  border: icone === ic ? '1.5px solid #8B5CF6' : '1.5px solid transparent',
                }}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        {/* Titre */}
        <div className="mb-3">
          <p className="text-xs font-semibold mb-1" style={{ color: '#9CA3AF' }}>Titre *</p>
          <input
            type="text"
            value={titre}
            onChange={e => setTitre(e.target.value)}
            placeholder="Mon objectif..."
            maxLength={60}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={inputStyle}
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <p className="text-xs font-semibold mb-1" style={{ color: '#9CA3AF' }}>Pourquoi ? (optionnel)</p>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Pourquoi cet objectif est important pour moi..."
            rows={2}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-none"
            style={inputStyle}
          />
        </div>

        {/* Catégorie */}
        <div className="mb-3">
          <p className="text-xs font-semibold mb-2" style={{ color: '#9CA3AF' }}>Domaine</p>
          <div className="grid grid-cols-2 gap-2">
            {DOMAINES.map(d => (
              <button
                key={d.id}
                onClick={() => setCategorie(d.id)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all"
                style={{
                  background: categorie === d.id ? `${d.couleur}15` : 'rgba(255,255,255,0.04)',
                  border: categorie === d.id ? `1.5px solid ${d.couleur}` : '1.5px solid rgba(255,255,255,0.06)',
                  color: categorie === d.id ? d.couleur : '#9CA3AF',
                }}
              >
                {d.emoji} {d.nom}
              </button>
            ))}
          </div>
        </div>

        {/* Étapes */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold" style={{ color: '#9CA3AF' }}>Étapes (optionnel)</p>
            <button
              onClick={() => setEtapes([...etapes, ''])}
              className="text-xs px-2 py-1 rounded-lg"
              style={{ color: '#8B5CF6', background: 'rgba(139,92,246,0.1)' }}
            >
              + Ajouter
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {etapes.map((etape, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs" style={{ color: '#6B7280', minWidth: '20px' }}>{i + 1}.</span>
                <input
                  type="text"
                  value={etape}
                  onChange={e => { const n = [...etapes]; n[i] = e.target.value; setEtapes(n); }}
                  placeholder={`Étape ${i + 1}...`}
                  className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
                  style={inputStyle}
                />
                {etapes.length > 1 && (
                  <button
                    onClick={() => setEtapes(etapes.filter((_, idx) => idx !== i))}
                    style={{ color: '#6B7280' }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Date échéance */}
        <div className="mb-5">
          <p className="text-xs font-semibold mb-1" style={{ color: '#9CA3AF' }}>Date limite (optionnel)</p>
          <input
            type="date"
            value={dateEcheance}
            onChange={e => setDateEcheance(e.target.value)}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={{ ...inputStyle, colorScheme: 'dark' }}
          />
        </div>

        <button
          onClick={soumettre}
          disabled={!titre.trim()}
          className="w-full py-4 rounded-2xl font-bold text-base transition-all duration-200"
          style={{
            background: titre.trim() ? 'linear-gradient(135deg, #8B5CF6, #7C3AED)' : 'rgba(255,255,255,0.05)',
            color: titre.trim() ? 'white' : '#6B7280',
            fontFamily: 'Outfit, sans-serif',
          }}
        >
          Créer l'objectif 🎯
        </button>
      </div>
    </div>
  );
}

export default function Objectifs() {
  const { donnees, ajouterObjectif, toggleEtapeObjectif, supprimerObjectif } = useApp();
  const [showFormulaire, setShowFormulaire] = useState(false);
  const [filtre, setFiltre] = useState('tous'); // 'tous' | 'en_cours' | 'termines'

  if (!donnees) return null;

  const objectifs = donnees.objectifs || [];
  const objectifsFiltres = objectifs.filter(o => {
    if (filtre === 'en_cours') return !o.termine;
    if (filtre === 'termines') return o.termine;
    return true;
  });

  const nbEnCours = objectifs.filter(o => !o.termine).length;
  const nbTermines = objectifs.filter(o => o.termine).length;

  return (
    <div className="flex flex-col min-h-screen pb-24"
         style={{ background: 'linear-gradient(160deg, #0F0F0F 0%, #1A1A2E 80%, #0F0F0F 100%)' }}>

      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#06B6D4' }}>
              Mes objectifs
            </p>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: '#F9FAFB' }}>
              Vision & Goals
            </h1>
          </div>
          <button
            onClick={() => setShowFormulaire(true)}
            className="flex items-center justify-center rounded-2xl transition-all"
            style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #06B6D4, #0891B2)',
              boxShadow: '0 4px 15px rgba(6,182,212,0.4)',
            }}
          >
            <Plus size={22} color="white" />
          </button>
        </div>

        {/* Stats rapides */}
        <div className="flex gap-3 mt-4">
          <div className="flex-1 rounded-2xl p-3 text-center"
               style={{ background: 'rgba(30,30,58,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-2xl font-black" style={{ fontFamily: 'Outfit, sans-serif', color: '#06B6D4' }}>{nbEnCours}</p>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>En cours</p>
          </div>
          <div className="flex-1 rounded-2xl p-3 text-center"
               style={{ background: 'rgba(30,30,58,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-2xl font-black" style={{ fontFamily: 'Outfit, sans-serif', color: '#10B981' }}>{nbTermines}</p>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>Atteints 🏆</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mt-3">
          {[{ id: 'tous', label: 'Tous' }, { id: 'en_cours', label: 'En cours' }, { id: 'termines', label: 'Atteints' }].map(f => (
            <button
              key={f.id}
              onClick={() => setFiltre(f.id)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: filtre === f.id ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)',
                color: filtre === f.id ? '#06B6D4' : '#6B7280',
                border: filtre === f.id ? '1px solid rgba(6,182,212,0.4)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      <div className="flex flex-col gap-3 px-5">
        {objectifsFiltres.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="text-5xl">{filtre === 'termines' ? '🏆' : '🎯'}</div>
            <p className="text-center" style={{ color: '#6B7280', fontFamily: 'DM Sans, sans-serif' }}>
              {filtre === 'termines'
                ? 'Aucun objectif atteint pour l\'instant.'
                : 'Aucun objectif en cours.\nClique sur + pour en créer un !'}
            </p>
            {filtre === 'tous' && (
              <button
                onClick={() => setShowFormulaire(true)}
                className="px-6 py-3 rounded-2xl font-bold text-sm"
                style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)', color: 'white', fontFamily: 'Outfit, sans-serif' }}
              >
                + Créer mon premier objectif
              </button>
            )}
          </div>
        ) : (
          objectifsFiltres.map(objectif => (
            <CarteObjectif
              key={objectif.id}
              objectif={objectif}
              onToggleEtape={toggleEtapeObjectif}
              onSupprimer={supprimerObjectif}
            />
          ))
        )}
      </div>

      {showFormulaire && (
        <FormulaireObjectif
          onAjouter={ajouterObjectif}
          onFermer={() => setShowFormulaire(false)}
        />
      )}
    </div>
  );
}
