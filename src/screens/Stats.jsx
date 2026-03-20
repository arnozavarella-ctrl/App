// ============================
// ÉCRAN STATS & PROGRESSION
// ============================

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Flame, Zap, CheckSquare, Trophy, Star, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  obtenirDonneesHebdo,
  obtenirCalendrierMensuel,
  obtenirNomNiveau,
  calculerNiveau,
} from '../data/storage';

// Tooltip personnalisé pour le bar chart
function TooltipPersonnalise({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl px-3 py-2"
         style={{ background: '#1E1E3A', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '13px' }}>
      <p style={{ color: '#F9FAFB', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>{label}</p>
      <p style={{ color: '#10B981' }}>{payload[0].value}%</p>
    </div>
  );
}

// Carte de stat
function CarteStats({ emoji, valeur, label, couleur = '#10B981' }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col items-center text-center"
         style={{
           background: 'rgba(30, 30, 58, 0.6)',
           border: '1px solid rgba(255,255,255,0.06)',
         }}>
      <span className="text-2xl mb-1">{emoji}</span>
      <div className="text-3xl font-black mb-0.5"
           style={{ fontFamily: 'Outfit, sans-serif', color: couleur }}>
        {valeur}
      </div>
      <div className="text-xs" style={{ color: '#9CA3AF' }}>{label}</div>
    </div>
  );
}

// Badge card
function CarteBadge({ badge }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-200"
         style={{
           background: badge.debloque
             ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.08))'
             : 'rgba(30, 30, 58, 0.4)',
           border: badge.debloque
             ? '1px solid rgba(16, 185, 129, 0.3)'
             : '1px solid rgba(255,255,255,0.04)',
           filter: badge.debloque ? 'none' : 'grayscale(100%) brightness(0.5)',
         }}>
      <span className={`text-3xl mb-2 ${badge.debloque ? '' : 'opacity-40'}`}>{badge.emoji}</span>
      <div className="text-xs font-bold mb-1"
           style={{ color: badge.debloque ? '#F9FAFB' : '#4B5563', fontFamily: 'Outfit, sans-serif' }}>
        {badge.nom}
      </div>
      <div className="text-xs" style={{ color: badge.debloque ? '#9CA3AF' : '#374151', lineHeight: '1.3' }}>
        {badge.description}
      </div>
      {badge.debloque && (
        <div className="mt-2 text-xs font-semibold px-2 py-0.5 rounded-full"
             style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
          ✓ Débloqué
        </div>
      )}
    </div>
  );
}

// Heatmap calendrier
function HeatmapMensuel({ donnees }) {
  return (
    <div className="flex flex-wrap gap-1">
      {donnees.map((jour, idx) => {
        const intensite = jour.intensite;
        let bg;
        if (intensite === 0) bg = 'rgba(255,255,255,0.04)';
        else if (intensite < 0.33) bg = 'rgba(16, 185, 129, 0.2)';
        else if (intensite < 0.66) bg = 'rgba(16, 185, 129, 0.5)';
        else if (intensite < 1) bg = 'rgba(16, 185, 129, 0.75)';
        else bg = '#10B981';

        return (
          <div
            key={idx}
            title={`${jour.date}: ${jour.faites}/${jour.total} habitudes`}
            className="rounded"
            style={{
              width: 'calc((100% - 29 * 4px) / 30)',
              aspectRatio: '1',
              background: bg,
              boxShadow: intensite === 1 ? '0 0 6px rgba(16, 185, 129, 0.5)' : 'none',
            }}
          />
        );
      })}
    </div>
  );
}

export default function Stats() {
  const { donnees, infoNiveau } = useApp();

  const donneesHebdo = useMemo(() =>
    donnees ? obtenirDonneesHebdo(donnees.historique, donnees.habitudes) : [],
    [donnees]
  );

  const donneesCalendrier = useMemo(() =>
    donnees ? obtenirCalendrierMensuel(donnees.historique, donnees.habitudes) : [],
    [donnees]
  );

  if (!donnees) return null;

  const { profil, badges } = donnees;
  const nomNiveau = obtenirNomNiveau(profil.niveau);
  const listeBadges = Object.values(badges);
  const nbBadgesDebloques = listeBadges.filter(b => b.debloque).length;

  return (
    <div className="flex flex-col min-h-screen pb-24"
         style={{ background: 'linear-gradient(160deg, #0F0F0F 0%, #1A1A2E 100%)' }}>

      {/* Header */}
      <div className="px-5 pt-12 pb-4 animate-fade-in">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Sora, sans-serif', color: '#F9FAFB' }}>
          Progression
        </h1>
        <p className="text-sm" style={{ color: '#9CA3AF' }}>
          Tes stats de champion
        </p>
      </div>

      {/* Stats clés */}
      <div className="px-5 mb-4 animate-slide-up">
        <div className="grid grid-cols-2 gap-3">
          <CarteStats emoji="🔥" valeur={profil.streak} label="Streak actuel" couleur="#F59E0B" />
          <CarteStats emoji="⚡" valeur={profil.meilleurStreak} label="Meilleur streak" couleur="#06B6D4" />
          <CarteStats emoji="✅" valeur={profil.totalHabitudesCompletes} label="Total complétées" couleur="#10B981" />
          <CarteStats emoji="🏆" valeur={`Niv. ${profil.niveau}`} label={nomNiveau} couleur="#8B5CF6" />
        </div>
      </div>

      {/* Niveau + XP */}
      <div className="px-5 mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="rounded-2xl p-5"
             style={{
               background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.08))',
               border: '1px solid rgba(139, 92, 246, 0.25)',
             }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#8B5CF6' }}>
                {nomNiveau}
              </div>
              <div className="text-2xl font-black" style={{ fontFamily: 'Outfit, sans-serif', color: '#F9FAFB' }}>
                Niveau {profil.niveau}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black gradient-text-purple" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {profil.niveauXP}
              </div>
              <div className="text-xs" style={{ color: '#9CA3AF' }}>XP total</div>
            </div>
          </div>
          <div className="rounded-full overflow-hidden mb-2" style={{ height: '8px', background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full xp-bar-fill"
              style={{
                width: `${infoNiveau?.pourcentage || 0}%`,
                background: 'linear-gradient(90deg, #8B5CF6, #06B6D4)',
                boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
              }}
            />
          </div>
          <div className="text-xs" style={{ color: '#9CA3AF' }}>
            {infoNiveau?.xpDansNiveau} / {infoNiveau?.xpPourProchainNiveau} XP vers le niveau {profil.niveau + 1}
          </div>
        </div>
      </div>

      {/* Graphique hebdomadaire */}
      <div className="px-5 mb-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="rounded-2xl p-4"
             style={{ background: 'rgba(30, 30, 58, 0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="font-bold mb-4 text-base" style={{ fontFamily: 'Outfit, sans-serif', color: '#F9FAFB' }}>
            7 derniers jours
          </h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={donneesHebdo} margin={{ top: 5, right: 0, left: -30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="jour"
                tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'DM Sans' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#6B7280', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<TooltipPersonnalise />} />
              <Bar dataKey="pourcentage" radius={[6, 6, 0, 0]}>
                {donneesHebdo.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.pourcentage === 100 ? '#10B981' : entry.pourcentage > 50 ? '#06B6D4' : '#1E3A5F'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap mensuel */}
      <div className="px-5 mb-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="rounded-2xl p-4"
             style={{ background: 'rgba(30, 30, 58, 0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base" style={{ fontFamily: 'Outfit, sans-serif', color: '#F9FAFB' }}>
              30 derniers jours
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(255,255,255,0.04)' }} />
              <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(16, 185, 129, 0.3)' }} />
              <div className="w-3 h-3 rounded-sm" style={{ background: '#10B981' }} />
            </div>
          </div>
          <HeatmapMensuel donnees={donneesCalendrier} />
        </div>
      </div>

      {/* Badges */}
      <div className="px-5 mb-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-base" style={{ fontFamily: 'Outfit, sans-serif', color: '#F9FAFB' }}>
            Achievements
          </h2>
          <span className="text-sm" style={{ color: '#9CA3AF' }}>
            {nbBadgesDebloques}/{listeBadges.length} débloqués
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {listeBadges.map(badge => (
            <CarteBadge key={badge.id} badge={badge} />
          ))}
        </div>
      </div>

      {/* Stats avancées Premium teaser */}
      <div className="px-5 mb-4 animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <div className="rounded-2xl p-4 relative overflow-hidden"
             style={{
               background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.05))',
               border: '1px solid rgba(139, 92, 246, 0.2)',
             }}>
          <div className="flex items-center gap-3 mb-2">
            <Lock size={18} style={{ color: '#8B5CF6' }} />
            <h3 className="font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#F9FAFB' }}>
              Stats avancées Pro
            </h3>
          </div>
          <p className="text-xs mb-3" style={{ color: '#9CA3AF' }}>
            Tendances, export CSV, comparaison inter-semaines et bien plus...
          </p>
          <div className="flex gap-2">
            <div className="flex-1 rounded-xl py-2 text-center text-xs font-semibold"
                 style={{ background: 'rgba(255,255,255,0.04)', color: '#6B7280', filter: 'blur(2px)' }}>
              Tendances 📈
            </div>
            <div className="flex-1 rounded-xl py-2 text-center text-xs font-semibold"
                 style={{ background: 'rgba(255,255,255,0.04)', color: '#6B7280', filter: 'blur(2px)' }}>
              Export 📊
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
