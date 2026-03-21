// ============================
// ÉCRAN ONBOARDING
// ============================

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AVATARS, DOMAINES } from '../data/storage';
import { ChevronRight, Zap, Target, Trophy, BookOpen } from 'lucide-react';

const SLIDES = [
  {
    icone: <Zap size={64} className="text-yellow-400" />,
    titre: 'Développe-toi chaque jour',
    description: 'LevelUp t\'aide à construire des habitudes solides, te fixer des objectifs et réfléchir à ta progression — un jour à la fois.',
    gradient: 'from-yellow-500/20 to-orange-500/10',
    accent: '#F59E0B',
  },
  {
    icone: <Target size={64} className="text-emerald-400" />,
    titre: 'Fixe tes objectifs',
    description: 'Crée des objectifs SMART, découpe-les en étapes et coche-les une par une. Visualise ta progression en temps réel.',
    gradient: 'from-emerald-500/20 to-cyan-500/10',
    accent: '#10B981',
  },
  {
    icone: <BookOpen size={64} className="text-purple-400" />,
    titre: 'Reflète-toi chaque jour',
    description: 'Le journal quotidien t\'aide à suivre ton humeur, pratiquer la gratitude et ancrer tes apprentissages.',
    gradient: 'from-purple-500/20 to-pink-500/10',
    accent: '#8B5CF6',
  },
  {
    icone: <Trophy size={64} className="text-cyan-400" />,
    titre: 'Gamifie ta vie',
    description: 'Gagne de l\'XP, monte en niveau, débloques des badges et maintiens ton streak. Le jeu de ta vraie vie commence ici.',
    gradient: 'from-cyan-500/20 to-blue-500/10',
    accent: '#06B6D4',
  },
];

export default function Onboarding() {
  const { terminerOnboarding } = useApp();
  const [slide, setSlide] = useState(0);
  const [etape, setEtape] = useState('slides'); // 'slides' | 'prenom' | 'domaines' | 'avatar'
  const [prenom, setPrenom] = useState('');
  const [domainesFocus, setDomainesFocus] = useState([]);
  const [avatarChoisi, setAvatarChoisi] = useState('🦁');

  const slideActuel = SLIDES[slide];

  function allerSlide(direction) {
    const prochain = slide + direction;
    if (prochain >= SLIDES.length) {
      setEtape('prenom');
    } else if (prochain < 0) {
      return;
    } else {
      setSlide(prochain);
    }
  }

  function validerPrenom() {
    if (prenom.trim().length < 2) return;
    setEtape('domaines');
  }

  function toggleDomaine(id) {
    setDomainesFocus(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  }

  function commencer() {
    terminerOnboarding(prenom.trim(), avatarChoisi, domainesFocus);
  }

  // Saisie prénom
  if (etape === 'prenom') {
    return (
      <div className="flex flex-col min-h-screen px-6 py-10 animate-fade-in"
           style={{ background: 'linear-gradient(160deg, #0F0F0F 0%, #1A1A2E 100%)' }}>
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-10">
            <div className="text-6xl mb-4 animate-float">👋</div>
            <h1 className="text-3xl font-bold mb-3"
                style={{ fontFamily: 'Sora, sans-serif', color: '#F9FAFB' }}>
              On commence !
            </h1>
            <p style={{ color: '#9CA3AF', fontFamily: 'DM Sans, sans-serif' }}>
              Comment tu t'appelles ?
            </p>
          </div>

          <div className="mb-8">
            <input
              type="text"
              value={prenom}
              onChange={e => setPrenom(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && validerPrenom()}
              placeholder="Ton prénom..."
              autoFocus
              maxLength={20}
              className="w-full text-center text-2xl font-bold rounded-2xl px-6 py-5 outline-none transition-all duration-200"
              style={{
                background: 'rgba(30, 30, 58, 0.8)',
                border: '2px solid rgba(16, 185, 129, 0.3)',
                color: '#F9FAFB',
                fontFamily: 'Outfit, sans-serif',
                caretColor: '#10B981',
              }}
              onFocus={e => { e.target.style.border = '2px solid rgba(16, 185, 129, 0.8)'; e.target.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.2)'; }}
              onBlur={e => { e.target.style.border = '2px solid rgba(16, 185, 129, 0.3)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <button
            onClick={validerPrenom}
            disabled={prenom.trim().length < 2}
            className="btn-primary w-full text-lg flex items-center justify-center gap-2"
            style={{ opacity: prenom.trim().length < 2 ? 0.5 : 1 }}
          >
            Continuer <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // Choix domaines de focus
  if (etape === 'domaines') {
    return (
      <div className="flex flex-col min-h-screen px-6 py-10 animate-fade-in"
           style={{ background: 'linear-gradient(160deg, #0F0F0F 0%, #1A1A2E 100%)' }}>
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4 animate-float">🎯</div>
            <h1 className="text-2xl font-bold mb-2"
                style={{ fontFamily: 'Sora, sans-serif', color: '#F9FAFB' }}>
              Quels domaines veux-tu développer ?
            </h1>
            <p className="text-sm" style={{ color: '#9CA3AF', fontFamily: 'DM Sans, sans-serif' }}>
              Sélectionne un ou plusieurs domaines, {prenom} 👇
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {DOMAINES.map(d => {
              const selectionne = domainesFocus.includes(d.id);
              return (
                <button
                  key={d.id}
                  onClick={() => toggleDomaine(d.id)}
                  className="flex flex-col items-start gap-2 rounded-2xl p-4 text-left transition-all duration-200"
                  style={{
                    background: selectionne ? `${d.couleur}18` : 'rgba(30, 30, 58, 0.6)',
                    border: selectionne ? `2px solid ${d.couleur}` : '2px solid rgba(255,255,255,0.06)',
                    boxShadow: selectionne ? `0 0 20px ${d.couleur}25` : 'none',
                    transform: selectionne ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <span className="text-2xl">{d.emoji}</span>
                  <span className="text-sm font-semibold" style={{ color: selectionne ? d.couleur : '#9CA3AF', fontFamily: 'DM Sans, sans-serif' }}>
                    {d.nom}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setEtape('avatar')}
            className="btn-primary w-full text-lg flex items-center justify-center gap-2"
          >
            {domainesFocus.length === 0 ? 'Passer' : `Continuer (${domainesFocus.length} choix)`} <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // Choix avatar
  if (etape === 'avatar') {
    return (
      <div className="flex flex-col min-h-screen px-6 py-10 animate-fade-in"
           style={{ background: 'linear-gradient(160deg, #0F0F0F 0%, #1A1A2E 100%)' }}>
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-10">
            <div className="text-7xl mb-4 animate-float">{avatarChoisi}</div>
            <h1 className="text-3xl font-bold mb-3"
                style={{ fontFamily: 'Sora, sans-serif', color: '#F9FAFB' }}>
              Choisis ton avatar
            </h1>
            <p style={{ color: '#9CA3AF' }}>
              Prêt(e) à te surpasser, <span className="text-emerald-400 font-semibold">{prenom}</span> ?
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-8">
            {AVATARS.map((avatar) => (
              <button
                key={avatar}
                onClick={() => setAvatarChoisi(avatar)}
                className="flex items-center justify-center rounded-2xl text-3xl transition-all duration-200 aspect-square"
                style={{
                  background: avatarChoisi === avatar ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 30, 58, 0.6)',
                  border: avatarChoisi === avatar ? '2px solid #10B981' : '2px solid rgba(255,255,255,0.06)',
                  boxShadow: avatarChoisi === avatar ? '0 0 20px rgba(16, 185, 129, 0.3)' : 'none',
                  transform: avatarChoisi === avatar ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                {avatar}
              </button>
            ))}
          </div>

          <button onClick={commencer} className="btn-primary w-full text-lg flex items-center justify-center gap-2">
            C'est parti ! 🚀
          </button>
        </div>
      </div>
    );
  }

  // Slides d'onboarding
  return (
    <div className="flex flex-col min-h-screen"
         style={{ background: 'linear-gradient(160deg, #0F0F0F 0%, #1A1A2E 100%)' }}>
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
        <div className={`absolute inset-0 bg-gradient-to-br ${slideActuel.gradient} pointer-events-none transition-all duration-500`} />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="animate-float mb-8 p-6 rounded-3xl"
               style={{
                 background: 'rgba(30, 30, 58, 0.6)',
                 border: `1px solid ${slideActuel.accent}30`,
                 boxShadow: `0 0 40px ${slideActuel.accent}20`,
               }}>
            {slideActuel.icone}
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight"
              style={{ fontFamily: 'Sora, sans-serif', color: '#F9FAFB' }}>
            {slideActuel.titre}
          </h1>
          <p className="text-base leading-relaxed" style={{ color: '#9CA3AF', maxWidth: '300px' }}>
            {slideActuel.description}
          </p>
        </div>
      </div>

      <div className="px-8 pb-12 flex flex-col items-center gap-6">
        <div className="flex items-center gap-2">
          {SLIDES.map((_, idx) => (
            <div
              key={idx}
              style={{
                width: idx === slide ? '20px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: idx === slide ? slideActuel.accent : 'rgba(255,255,255,0.2)',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>

        <button
          onClick={() => allerSlide(1)}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-semibold text-lg transition-all duration-200"
          style={{
            background: `linear-gradient(135deg, ${slideActuel.accent}, ${slideActuel.accent}CC)`,
            color: 'white',
            fontFamily: 'Outfit, sans-serif',
            boxShadow: `0 4px 24px ${slideActuel.accent}40`,
          }}
        >
          {slide < SLIDES.length - 1 ? (
            <>Suivant <ChevronRight size={20} /></>
          ) : (
            <>Commencer <ChevronRight size={20} /></>
          )}
        </button>

        {slide < SLIDES.length - 1 && (
          <button
            onClick={() => setEtape('prenom')}
            className="text-sm"
            style={{ color: '#6B7280' }}
          >
            Passer →
          </button>
        )}
      </div>
    </div>
  );
}
