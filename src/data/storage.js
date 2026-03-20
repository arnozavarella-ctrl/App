// ============================
// COUCHE DE DONNÉES - localStorage
// Structure principale : levelUpData
// ============================

const CLE_STOCKAGE = 'levelUpData';

// Habitudes par défaut
const HABITUDES_DEFAUT = [
  { id: 'eau', icone: '💧', nom: 'Boire 2L d\'eau', xp: 10, couleur: '#06B6D4', actif: true },
  { id: 'sport', icone: '🏋️', nom: '30 min d\'exercice', xp: 10, couleur: '#10B981', actif: true },
  { id: 'meditation', icone: '🧘', nom: '10 min de méditation', xp: 10, couleur: '#8B5CF6', actif: true },
  { id: 'sommeil', icone: '😴', nom: '8h de sommeil', xp: 10, couleur: '#F59E0B', actif: true },
  { id: 'lecture', icone: '📖', nom: '20 min de lecture', xp: 10, couleur: '#EF4444', actif: true },
];

// Données initiales
const donneesInitiales = {
  profil: {
    prenom: '',
    avatar: '🦁',
    niveauXP: 0,
    niveau: 1,
    streak: 0,
    meilleurStreak: 0,
    totalHabitudesCompletes: 0,
    dateCreation: new Date().toISOString(),
    dernierJourActif: null,
    emailPremium: null,
    notificationsActives: true,
    modeSombre: true,
    langue: 'fr',
  },
  habitudes: HABITUDES_DEFAUT,
  historique: {}, // { 'YYYY-MM-DD': ['id1', 'id2', ...] }
  badges: {
    enFeu: { id: 'enFeu', nom: 'En Feu', emoji: '🔥', description: '7 jours de streak', debloque: false, dateDeblocage: null },
    inarretable: { id: 'inarretable', nom: 'Inarrêtable', emoji: '⚡', description: '30 jours de streak', debloque: false, dateDeblocage: null },
    jourParfait: { id: 'jourParfait', nom: 'Jour Parfait', emoji: '🏆', description: 'Toutes les habitudes en 1 jour', debloque: false, dateDeblocage: null },
    diamant: { id: 'diamant', nom: 'Diamant', emoji: '💎', description: '100 habitudes complétées', debloque: false, dateDeblocage: null },
    leveTot: { id: 'leveTot', nom: 'Lève-tôt', emoji: '🌅', description: 'Habitude complétée avant 8h', debloque: false, dateDeblocage: null },
    sniper: { id: 'sniper', nom: 'Sniper', emoji: '🎯', description: '7 jours parfaits d\'affilée', debloque: false, dateDeblocage: null },
  },
  onboardingTermine: false,
};

// ============================
// Fonctions utilitaires
// ============================

export function chargerDonnees() {
  try {
    const donnees = localStorage.getItem(CLE_STOCKAGE);
    if (!donnees) return null;
    return JSON.parse(donnees);
  } catch (e) {
    console.error('Erreur chargement données:', e);
    return null;
  }
}

export function sauvegarderDonnees(donnees) {
  try {
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(donnees));
  } catch (e) {
    console.error('Erreur sauvegarde données:', e);
  }
}

export function initialiserDonnees() {
  const donnees = { ...donneesInitiales, habitudes: HABITUDES_DEFAUT };
  sauvegarderDonnees(donnees);
  return donnees;
}

export function reinitialiserDonnees() {
  localStorage.removeItem(CLE_STOCKAGE);
  return initialiserDonnees();
}

// ============================
// Gamification
// ============================

export function calculerNiveau(xpTotal) {
  let niveau = 1;
  let xpRequis = 100;
  let xpCumule = 0;

  while (xpTotal >= xpCumule + xpRequis) {
    xpCumule += xpRequis;
    niveau++;
    xpRequis = Math.round(xpRequis * 1.5);
  }

  return {
    niveau,
    xpDansNiveau: xpTotal - xpCumule,
    xpPourProchainNiveau: xpRequis,
    pourcentage: Math.round(((xpTotal - xpCumule) / xpRequis) * 100),
  };
}

export function obtenirNomNiveau(niveau) {
  if (niveau <= 5) return 'Débutant';
  if (niveau <= 10) return 'Régulier';
  if (niveau <= 20) return 'Athlète';
  if (niveau <= 35) return 'Champion';
  return 'Légende';
}

export function obtenirDateAujourdhui() {
  return new Date().toISOString().split('T')[0];
}

export function obtenirHeure() {
  return new Date().getHours();
}

export function obtenirSalutation(prenom) {
  const heure = obtenirHeure();
  let moment;
  if (heure < 6) moment = 'Bonne nuit';
  else if (heure < 12) moment = 'Bonjour';
  else if (heure < 18) moment = 'Bon après-midi';
  else moment = 'Bonne soirée';
  return `${moment}, ${prenom} 🔥`;
}

export function calculerStreak(historique) {
  const aujourd_hui = obtenirDateAujourdhui();
  let streak = 0;
  let date = new Date();

  for (let i = 0; i < 365; i++) {
    const dateStr = date.toISOString().split('T')[0];
    if (dateStr === aujourd_hui && i === 0) {
      // On compte aujourd'hui seulement s'il y a des habitudes complétées
      if (historique[dateStr] && historique[dateStr].length > 0) {
        streak++;
      }
    } else if (dateStr !== aujourd_hui) {
      if (historique[dateStr] && historique[dateStr].length > 0) {
        streak++;
      } else {
        break;
      }
    }
    date.setDate(date.getDate() - 1);
  }

  return streak;
}

export function verifierBadges(donnees) {
  const nouveauxBadges = [];
  const { profil, badges, historique, habitudes } = donnees;
  const aujourd_hui = obtenirDateAujourdhui();

  // 🔥 En Feu — 7 jours de streak
  if (!badges.enFeu.debloque && profil.streak >= 7) {
    badges.enFeu.debloque = true;
    badges.enFeu.dateDeblocage = new Date().toISOString();
    nouveauxBadges.push(badges.enFeu);
  }

  // ⚡ Inarrêtable — 30 jours de streak
  if (!badges.inarretable.debloque && profil.streak >= 30) {
    badges.inarretable.debloque = true;
    badges.inarretable.dateDeblocage = new Date().toISOString();
    nouveauxBadges.push(badges.inarretable);
  }

  // 🏆 Jour Parfait — toutes habitudes en 1 jour
  const habitudesActives = habitudes.filter(h => h.actif);
  const completionsAujourdhui = historique[aujourd_hui] || [];
  const toutesCompletes = habitudesActives.length > 0 &&
    habitudesActives.every(h => completionsAujourdhui.includes(h.id));

  if (!badges.jourParfait.debloque && toutesCompletes) {
    badges.jourParfait.debloque = true;
    badges.jourParfait.dateDeblocage = new Date().toISOString();
    nouveauxBadges.push(badges.jourParfait);
  }

  // 💎 Diamant — 100 habitudes complétées
  if (!badges.diamant.debloque && profil.totalHabitudesCompletes >= 100) {
    badges.diamant.debloque = true;
    badges.diamant.dateDeblocage = new Date().toISOString();
    nouveauxBadges.push(badges.diamant);
  }

  // 🌅 Lève-tôt — complété avant 8h
  if (!badges.leveTot.debloque && obtenirHeure() < 8 && completionsAujourdhui.length > 0) {
    badges.leveTot.debloque = true;
    badges.leveTot.dateDeblocage = new Date().toISOString();
    nouveauxBadges.push(badges.leveTot);
  }

  // 🎯 Sniper — 7 jours parfaits d'affilée
  if (!badges.sniper.debloque) {
    let joursParfaits = 0;
    const dateTest = new Date();
    for (let i = 0; i < 7; i++) {
      const dateStr = dateTest.toISOString().split('T')[0];
      const completions = historique[dateStr] || [];
      const parfait = habitudesActives.length > 0 &&
        habitudesActives.every(h => completions.includes(h.id));
      if (parfait) joursParfaits++;
      else break;
      dateTest.setDate(dateTest.getDate() - 1);
    }
    if (joursParfaits >= 7) {
      badges.sniper.debloque = true;
      badges.sniper.dateDeblocage = new Date().toISOString();
      nouveauxBadges.push(badges.sniper);
    }
  }

  return { donneesMaj: { ...donnees, badges }, nouveauxBadges };
}

export function completerHabitude(donnees, habitudeId) {
  const aujourd_hui = obtenirDateAujourdhui();
  const historique = { ...donnees.historique };

  if (!historique[aujourd_hui]) historique[aujourd_hui] = [];

  // Déjà complétée ?
  if (historique[aujourd_hui].includes(habitudeId)) {
    return donnees; // Pas de changement
  }

  // Ajouter à l'historique
  historique[aujourd_hui] = [...historique[aujourd_hui], habitudeId];

  // Calculer XP
  const habitude = donnees.habitudes.find(h => h.id === habitudeId);
  const xpGagne = habitude ? habitude.xp : 10;

  // Vérifier jour parfait
  const habitudesActives = donnees.habitudes.filter(h => h.actif);
  const toutesCompletes = habitudesActives.every(h => historique[aujourd_hui].includes(h.id));
  const bonusXP = toutesCompletes ? 50 : 0;

  // Mettre à jour profil
  const nouveauXPTotal = donnees.profil.niveauXP + xpGagne + bonusXP;
  const infoNiveau = calculerNiveau(nouveauXPTotal);
  const streak = calculerStreak(historique);

  const profil = {
    ...donnees.profil,
    niveauXP: nouveauXPTotal,
    niveau: infoNiveau.niveau,
    streak,
    meilleurStreak: Math.max(streak, donnees.profil.meilleurStreak),
    totalHabitudesCompletes: donnees.profil.totalHabitudesCompletes + 1,
    dernierJourActif: aujourd_hui,
  };

  const nouvellesDonnees = { ...donnees, historique, profil };

  // Vérifier badges
  const { donneesMaj, nouveauxBadges } = verifierBadges(nouvellesDonnees);

  sauvegarderDonnees(donneesMaj);

  return { donneesMaj, nouveauxBadges, xpGagne, bonusXP, jourParfait: toutesCompletes };
}

export function annulerHabitude(donnees, habitudeId) {
  const aujourd_hui = obtenirDateAujourdhui();
  const historique = { ...donnees.historique };

  if (!historique[aujourd_hui]) return donnees;

  const habitude = donnees.habitudes.find(h => h.id === habitudeId);
  const xpPerdu = habitude ? habitude.xp : 10;

  historique[aujourd_hui] = historique[aujourd_hui].filter(id => id !== habitudeId);

  const nouvelXPTotal = Math.max(0, donnees.profil.niveauXP - xpPerdu);
  const infoNiveau = calculerNiveau(nouvelXPTotal);
  const streak = calculerStreak(historique);

  const profil = {
    ...donnees.profil,
    niveauXP: nouvelXPTotal,
    niveau: infoNiveau.niveau,
    streak,
    totalHabitudesCompletes: Math.max(0, donnees.profil.totalHabitudesCompletes - 1),
  };

  const nouvellesDonnees = { ...donnees, historique, profil };
  sauvegarderDonnees(nouvellesDonnees);
  return nouvellesDonnees;
}

export function obtenirDonneesHebdo(historique, habitudes) {
  const jours = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const resultat = [];
  const habitudesActives = habitudes.filter(h => h.actif);

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const completions = historique[dateStr] || [];
    const total = habitudesActives.length;
    const faites = completions.filter(id => habitudesActives.find(h => h.id === id)).length;
    const pourcentage = total > 0 ? Math.round((faites / total) * 100) : 0;

    resultat.push({
      jour: jours[date.getDay()],
      date: dateStr,
      faites,
      total,
      pourcentage,
    });
  }

  return resultat;
}

export function obtenirCalendrierMensuel(historique, habitudes) {
  const habitudesActives = habitudes.filter(h => h.actif);
  const resultat = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const completions = historique[dateStr] || [];
    const faites = completions.filter(id => habitudesActives.find(h => h.id === id)).length;
    const total = habitudesActives.length;
    const intensite = total > 0 ? faites / total : 0;

    resultat.push({ date: dateStr, intensite, faites, total });
  }

  return resultat;
}

// ============================
// Leaderboard fictif
// ============================
export const FAUX_JOUEURS = [
  { id: 'j1', pseudo: 'MaxFitness', avatar: '🐯', niveau: 28, xp: 8420, streak: 45 },
  { id: 'j2', pseudo: 'SaraWellness', avatar: '🦋', niveau: 24, xp: 6890, streak: 32 },
  { id: 'j3', pseudo: 'LucasAthlete', avatar: '🦅', niveau: 22, xp: 5960, streak: 28 },
  { id: 'j4', pseudo: 'EmmaZen', avatar: '🌸', niveau: 19, xp: 4750, streak: 21 },
  { id: 'j5', pseudo: 'NoahPower', avatar: '🐺', niveau: 17, xp: 3980, streak: 15 },
  { id: 'j6', pseudo: 'ChloeRun', avatar: '🦊', niveau: 14, xp: 2890, streak: 10 },
  { id: 'j7', pseudo: 'ThomasGrit', avatar: '🐻', niveau: 11, xp: 1960, streak: 7 },
  { id: 'j8', pseudo: 'AliceMove', avatar: '🦁', niveau: 8, xp: 980, streak: 4 },
];

// ============================
// Citations motivantes
// ============================
export const CITATIONS = [
  { texte: "Le succès n'est pas final, l'échec n'est pas fatal : c'est le courage de continuer qui compte.", auteur: "Winston Churchill" },
  { texte: "La discipline est le pont entre les objectifs et les accomplissements.", auteur: "Jim Rohn" },
  { texte: "Chaque jour est une nouvelle chance de changer ta vie.", auteur: "Unknown" },
  { texte: "Ta seule limite, c'est toi-même.", auteur: "Unknown" },
  { texte: "Le corps réalise ce que l'esprit croit.", auteur: "Napoleon Hill" },
  { texte: "Les habitudes façonnent ton futur. Choisis-les bien.", auteur: "Unknown" },
  { texte: "Sois le changement que tu veux voir dans le monde.", auteur: "Mahatma Gandhi" },
  { texte: "La seule mauvaise séance d'entraînement est celle que tu n'as pas faite.", auteur: "Unknown" },
  { texte: "L'excellence n'est pas un acte, mais une habitude.", auteur: "Aristote" },
  { texte: "Avance pas à pas. Chaque action compte.", auteur: "Unknown" },
];

export function obtenirCitationDuJour() {
  const index = new Date().getDate() % CITATIONS.length;
  return CITATIONS[index];
}

// Avatars prédéfinis
export const AVATARS = ['🦁', '🐯', '🦅', '🐺', '🦋', '🐻', '🦊', '🌸', '⚡', '🔥', '💎', '🌊'];
