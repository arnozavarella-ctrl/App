// ============================
// COUCHE DE DONNÉES - localStorage
// ============================

const CLE_STOCKAGE = 'levelUpData';

const HABITUDES_DEFAUT = [
  { id: 'eau', icone: '💧', nom: 'Boire 2L d\'eau', xp: 10, couleur: '#06B6D4', categorie: 'sante', actif: true },
  { id: 'sport', icone: '🏋️', nom: '30 min d\'exercice', xp: 15, couleur: '#10B981', categorie: 'sante', actif: true },
  { id: 'meditation', icone: '🧘', nom: '10 min de méditation', xp: 12, couleur: '#8B5CF6', categorie: 'mental', actif: true },
  { id: 'sommeil', icone: '😴', nom: '8h de sommeil', xp: 10, couleur: '#F59E0B', categorie: 'sante', actif: true },
  { id: 'lecture', icone: '📖', nom: '20 min de lecture', xp: 12, couleur: '#EF4444', categorie: 'apprentissage', actif: true },
];

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
    domainesFocus: [],
    notificationsActives: true,
    modeSombre: true,
    langue: 'fr',
  },
  habitudes: HABITUDES_DEFAUT,
  historique: {},
  journal: {},
  objectifs: [],
  badges: {
    enFeu: { id: 'enFeu', nom: 'En Feu', emoji: '🔥', description: '7 jours de streak', debloque: false, dateDeblocage: null },
    inarretable: { id: 'inarretable', nom: 'Inarrêtable', emoji: '⚡', description: '30 jours de streak', debloque: false, dateDeblocage: null },
    jourParfait: { id: 'jourParfait', nom: 'Jour Parfait', emoji: '🏆', description: 'Toutes les habitudes en 1 jour', debloque: false, dateDeblocage: null },
    diamant: { id: 'diamant', nom: 'Diamant', emoji: '💎', description: '100 habitudes complétées', debloque: false, dateDeblocage: null },
    leveTot: { id: 'leveTot', nom: 'Lève-tôt', emoji: '🌅', description: 'Habitude complétée avant 8h', debloque: false, dateDeblocage: null },
    sniper: { id: 'sniper', nom: 'Sniper', emoji: '🎯', description: '7 jours parfaits d\'affilée', debloque: false, dateDeblocage: null },
    ecrivain: { id: 'ecrivain', nom: 'Écrivain', emoji: '✍️', description: '7 jours de journal', debloque: false, dateDeblocage: null },
    visionnaire: { id: 'visionnaire', nom: 'Visionnaire', emoji: '🚀', description: 'Premier objectif atteint', debloque: false, dateDeblocage: null },
  },
  onboardingTermine: false,
};

// ============================
// CRUD
// ============================

export function chargerDonnees() {
  try {
    const raw = localStorage.getItem(CLE_STOCKAGE);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.journal) parsed.journal = {};
    if (!parsed.objectifs) parsed.objectifs = [];
    if (!parsed.profil.domainesFocus) parsed.profil.domainesFocus = [];
    if (!parsed.badges.ecrivain) parsed.badges.ecrivain = { id: 'ecrivain', nom: 'Écrivain', emoji: '✍️', description: '7 jours de journal', debloque: false, dateDeblocage: null };
    if (!parsed.badges.visionnaire) parsed.badges.visionnaire = { id: 'visionnaire', nom: 'Visionnaire', emoji: '🚀', description: 'Premier objectif atteint', debloque: false, dateDeblocage: null };
    return parsed;
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
  const donnees = { ...donneesInitiales, habitudes: [...HABITUDES_DEFAUT] };
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
  if (niveau <= 3) return 'Novice';
  if (niveau <= 7) return 'Explorateur';
  if (niveau <= 12) return 'Motivé';
  if (niveau <= 20) return 'Champion';
  if (niveau <= 35) return 'Elite';
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
  return `${moment}, ${prenom} ⚡`;
}

export function calculerStreak(historique) {
  const aujourd_hui = obtenirDateAujourdhui();
  let streak = 0;
  const date = new Date();

  for (let i = 0; i < 365; i++) {
    const dateStr = date.toISOString().split('T')[0];
    if (dateStr === aujourd_hui && i === 0) {
      if (historique[dateStr]?.length > 0) streak++;
    } else if (dateStr !== aujourd_hui) {
      if (historique[dateStr]?.length > 0) streak++;
      else break;
    }
    date.setDate(date.getDate() - 1);
  }

  return streak;
}

export function verifierBadges(donnees) {
  const nouveauxBadges = [];
  const { profil, badges, historique, habitudes, journal, objectifs } = donnees;
  const aujourd_hui = obtenirDateAujourdhui();
  const habitudesActives = habitudes.filter(h => h.actif);
  const completionsAujourdhui = historique[aujourd_hui] || [];

  if (!badges.enFeu.debloque && profil.streak >= 7) {
    badges.enFeu = { ...badges.enFeu, debloque: true, dateDeblocage: new Date().toISOString() };
    nouveauxBadges.push(badges.enFeu);
  }
  if (!badges.inarretable.debloque && profil.streak >= 30) {
    badges.inarretable = { ...badges.inarretable, debloque: true, dateDeblocage: new Date().toISOString() };
    nouveauxBadges.push(badges.inarretable);
  }
  const toutesCompletes = habitudesActives.length > 0 && habitudesActives.every(h => completionsAujourdhui.includes(h.id));
  if (!badges.jourParfait.debloque && toutesCompletes) {
    badges.jourParfait = { ...badges.jourParfait, debloque: true, dateDeblocage: new Date().toISOString() };
    nouveauxBadges.push(badges.jourParfait);
  }
  if (!badges.diamant.debloque && profil.totalHabitudesCompletes >= 100) {
    badges.diamant = { ...badges.diamant, debloque: true, dateDeblocage: new Date().toISOString() };
    nouveauxBadges.push(badges.diamant);
  }
  if (!badges.leveTot.debloque && obtenirHeure() < 8 && completionsAujourdhui.length > 0) {
    badges.leveTot = { ...badges.leveTot, debloque: true, dateDeblocage: new Date().toISOString() };
    nouveauxBadges.push(badges.leveTot);
  }
  if (!badges.sniper.debloque) {
    let joursParfaits = 0;
    const dateTest = new Date();
    for (let i = 0; i < 7; i++) {
      const dateStr = dateTest.toISOString().split('T')[0];
      const completions = historique[dateStr] || [];
      if (habitudesActives.length > 0 && habitudesActives.every(h => completions.includes(h.id))) joursParfaits++;
      else break;
      dateTest.setDate(dateTest.getDate() - 1);
    }
    if (joursParfaits >= 7) {
      badges.sniper = { ...badges.sniper, debloque: true, dateDeblocage: new Date().toISOString() };
      nouveauxBadges.push(badges.sniper);
    }
  }
  if (badges.ecrivain && !badges.ecrivain.debloque && journal) {
    let joursJournal = 0;
    const dateTest = new Date();
    for (let i = 0; i < 7; i++) {
      const dateStr = dateTest.toISOString().split('T')[0];
      if (journal[dateStr]?.reflexion || journal[dateStr]?.gratitude?.some(g => g)) joursJournal++;
      else break;
      dateTest.setDate(dateTest.getDate() - 1);
    }
    if (joursJournal >= 7) {
      badges.ecrivain = { ...badges.ecrivain, debloque: true, dateDeblocage: new Date().toISOString() };
      nouveauxBadges.push(badges.ecrivain);
    }
  }
  if (badges.visionnaire && !badges.visionnaire.debloque && objectifs?.some(o => o.termine)) {
    badges.visionnaire = { ...badges.visionnaire, debloque: true, dateDeblocage: new Date().toISOString() };
    nouveauxBadges.push(badges.visionnaire);
  }

  return { donneesMaj: { ...donnees, badges }, nouveauxBadges };
}

export function completerHabitude(donnees, habitudeId) {
  const aujourd_hui = obtenirDateAujourdhui();
  const historique = { ...donnees.historique };

  if (!historique[aujourd_hui]) historique[aujourd_hui] = [];
  if (historique[aujourd_hui].includes(habitudeId)) return donnees;

  historique[aujourd_hui] = [...historique[aujourd_hui], habitudeId];

  const habitude = donnees.habitudes.find(h => h.id === habitudeId);
  const xpGagne = habitude ? habitude.xp : 10;
  const habitudesActives = donnees.habitudes.filter(h => h.actif);
  const toutesCompletes = habitudesActives.every(h => historique[aujourd_hui].includes(h.id));
  const bonusXP = toutesCompletes ? 50 : 0;

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
  const habitudesActives = habitudes.filter(h => h.actif);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const completions = historique[dateStr] || [];
    const total = habitudesActives.length;
    const faites = completions.filter(id => habitudesActives.find(h => h.id === id)).length;
    return { jour: jours[date.getDay()], date: dateStr, faites, total, pourcentage: total > 0 ? Math.round((faites / total) * 100) : 0 };
  });
}

export function obtenirCalendrierMensuel(historique, habitudes) {
  const habitudesActives = habitudes.filter(h => h.actif);
  const today = new Date();

  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (29 - i));
    const dateStr = date.toISOString().split('T')[0];
    const completions = historique[dateStr] || [];
    const faites = completions.filter(id => habitudesActives.find(h => h.id === id)).length;
    const total = habitudesActives.length;
    return { date: dateStr, intensite: total > 0 ? faites / total : 0, faites, total };
  });
}

// ============================
// Défis quotidiens
// ============================
export const DEFIS_QUOTIDIENS = [
  { emoji: '💬', texte: 'Envoie un message d\'encouragement à un ami', categorie: 'social' },
  { emoji: '🧊', texte: 'Prends une douche froide de 30 secondes', categorie: 'sante' },
  { emoji: '📵', texte: 'Pas de réseaux sociaux avant midi', categorie: 'mental' },
  { emoji: '🎨', texte: 'Dessine ou crée quelque chose, même petit', categorie: 'creativite' },
  { emoji: '🏃', texte: 'Marche 8000 pas aujourd\'hui', categorie: 'sante' },
  { emoji: '✍️', texte: 'Écris 3 choses pour lesquelles tu es reconnaissant', categorie: 'mental' },
  { emoji: '📞', texte: 'Appelle quelqu\'un que tu n\'as pas contacté depuis longtemps', categorie: 'social' },
  { emoji: '🍎', texte: 'Mange 5 fruits et légumes aujourd\'hui', categorie: 'sante' },
  { emoji: '📚', texte: 'Apprends 5 nouveaux mots dans une langue étrangère', categorie: 'apprentissage' },
  { emoji: '🌿', texte: 'Passe 20 minutes dans la nature sans téléphone', categorie: 'mental' },
  { emoji: '💡', texte: 'Écoute un podcast ou une vidéo éducative', categorie: 'apprentissage' },
  { emoji: '🤝', texte: 'Rends service à quelqu\'un aujourd\'hui', categorie: 'social' },
  { emoji: '🎵', texte: 'Écoute de la musique qui te donne de l\'énergie le matin', categorie: 'bien-etre' },
  { emoji: '🧹', texte: 'Range un espace de ta chambre ou bureau', categorie: 'organisation' },
  { emoji: '💪', texte: 'Fais 50 squats dans ta journée (en plusieurs fois)', categorie: 'sante' },
  { emoji: '🙏', texte: 'Dis merci sincèrement à 3 personnes aujourd\'hui', categorie: 'social' },
  { emoji: '🛌', texte: 'Couche-toi avant 23h ce soir', categorie: 'sante' },
  { emoji: '🧘', texte: 'Fais 5 min de respiration profonde ou cohérence cardiaque', categorie: 'mental' },
  { emoji: '💰', texte: 'Note toutes tes dépenses d\'aujourd\'hui', categorie: 'finance' },
  { emoji: '🎯', texte: 'Identifie ta priorité absolue du jour et fais-la en premier', categorie: 'organisation' },
  { emoji: '📷', texte: 'Prends une photo de quelque chose qui te rend heureux', categorie: 'bien-etre' },
  { emoji: '🧠', texte: 'Apprends un fait intéressant et partage-le avec quelqu\'un', categorie: 'apprentissage' },
  { emoji: '🌅', texte: 'Regarde le coucher ou lever du soleil', categorie: 'bien-etre' },
  { emoji: '📝', texte: 'Écris tes 3 objectifs principaux pour le mois', categorie: 'organisation' },
  { emoji: '🚫', texte: 'Évite toute plainte aujourd\'hui — transforme-les en solutions', categorie: 'mental' },
  { emoji: '👁️', texte: 'Fais une pause écran de 20 min toutes les 2h', categorie: 'sante' },
  { emoji: '🌍', texte: 'Lis un article sur un sujet que tu ne connais pas', categorie: 'apprentissage' },
  { emoji: '😄', texte: 'Souris à 5 inconnus aujourd\'hui', categorie: 'social' },
  { emoji: '🎤', texte: 'Exprime quelque chose qui te tient à cœur à voix haute', categorie: 'mental' },
  { emoji: '🏊', texte: 'Essaie une nouvelle activité physique ou sport', categorie: 'sante' },
];

export function obtenirDefiDuJour() {
  const aujourd_hui = obtenirDateAujourdhui();
  const seed = aujourd_hui.split('-').reduce((acc, val) => acc + parseInt(val), 0);
  return DEFIS_QUOTIDIENS[seed % DEFIS_QUOTIDIENS.length];
}

// ============================
// Catégories
// ============================
export const DOMAINES = [
  { id: 'sante', nom: 'Santé & Forme', emoji: '💪', couleur: '#10B981' },
  { id: 'mental', nom: 'Mental & Bien-être', emoji: '🧘', couleur: '#8B5CF6' },
  { id: 'apprentissage', nom: 'Études & Apprentissage', emoji: '📚', couleur: '#06B6D4' },
  { id: 'social', nom: 'Social & Relations', emoji: '🤝', couleur: '#F59E0B' },
  { id: 'creativite', nom: 'Créativité', emoji: '🎨', couleur: '#EC4899' },
  { id: 'finance', nom: 'Finance & Organisation', emoji: '💰', couleur: '#84CC16' },
];

export const CATEGORIES_HABITUDES = [
  {
    id: 'sante', nom: 'Santé & Forme', emoji: '💪', couleur: '#10B981',
    habitudes: [
      { icone: '💧', nom: 'Boire 2L d\'eau', xp: 10 },
      { icone: '🏋️', nom: '30 min d\'exercice', xp: 15 },
      { icone: '😴', nom: '8h de sommeil', xp: 10 },
      { icone: '🍎', nom: 'Manger équilibré', xp: 10 },
      { icone: '🚶', nom: '8000 pas / jour', xp: 12 },
      { icone: '🦷', nom: 'Brossage dents x2', xp: 8 },
    ]
  },
  {
    id: 'mental', nom: 'Mental & Bien-être', emoji: '🧘', couleur: '#8B5CF6',
    habitudes: [
      { icone: '🧘', nom: '10 min méditation', xp: 12 },
      { icone: '✍️', nom: 'Journal du soir', xp: 10 },
      { icone: '📵', nom: 'Digital detox 1h', xp: 15 },
      { icone: '🌿', nom: '20 min en nature', xp: 10 },
      { icone: '😮‍💨', nom: 'Cohérence cardiaque', xp: 10 },
      { icone: '🙏', nom: '3 choses de gratitude', xp: 8 },
    ]
  },
  {
    id: 'apprentissage', nom: 'Études & Apprentissage', emoji: '📚', couleur: '#06B6D4',
    habitudes: [
      { icone: '📖', nom: '20 min de lecture', xp: 12 },
      { icone: '🎧', nom: 'Podcast éducatif', xp: 10 },
      { icone: '💻', nom: 'Cours en ligne', xp: 15 },
      { icone: '🗣️', nom: 'Pratiquer une langue', xp: 12 },
      { icone: '📝', nom: 'Réviser mes notes', xp: 10 },
    ]
  },
  {
    id: 'social', nom: 'Social & Relations', emoji: '🤝', couleur: '#F59E0B',
    habitudes: [
      { icone: '📞', nom: 'Appeler un proche', xp: 10 },
      { icone: '💌', nom: 'Message bienveillant', xp: 8 },
      { icone: '😊', nom: 'Complimenter quelqu\'un', xp: 8 },
      { icone: '🤝', nom: 'Rendre un service', xp: 12 },
    ]
  },
  {
    id: 'creativite', nom: 'Créativité', emoji: '🎨', couleur: '#EC4899',
    habitudes: [
      { icone: '🎨', nom: 'Dessiner ou créer', xp: 12 },
      { icone: '🎵', nom: 'Jouer de la musique', xp: 12 },
      { icone: '✍️', nom: 'Écrire un texte', xp: 10 },
      { icone: '📸', nom: 'Prendre une photo artistique', xp: 8 },
    ]
  },
  {
    id: 'finance', nom: 'Finance & Organisation', emoji: '💰', couleur: '#84CC16',
    habitudes: [
      { icone: '💰', nom: 'Suivre mes dépenses', xp: 10 },
      { icone: '🏦', nom: 'Épargner aujourd\'hui', xp: 12 },
      { icone: '📋', nom: 'Faire ma to-do liste', xp: 8 },
      { icone: '🧹', nom: 'Ranger mon espace', xp: 8 },
      { icone: '📅', nom: 'Planifier ma semaine', xp: 10 },
    ]
  },
];

// Leaderboard fictif
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

// Citations
export const CITATIONS = [
  { texte: "Le succès n'est pas final, l'échec n'est pas fatal : c'est le courage de continuer qui compte.", auteur: "Winston Churchill" },
  { texte: "La discipline est le pont entre les objectifs et les accomplissements.", auteur: "Jim Rohn" },
  { texte: "Chaque jour est une nouvelle chance de changer ta vie.", auteur: "Inconnu" },
  { texte: "Ta seule limite, c'est toi-même.", auteur: "Inconnu" },
  { texte: "Le corps réalise ce que l'esprit croit.", auteur: "Napoleon Hill" },
  { texte: "Les habitudes façonnent ton futur. Choisis-les bien.", auteur: "Inconnu" },
  { texte: "Sois le changement que tu veux voir dans le monde.", auteur: "Mahatma Gandhi" },
  { texte: "L'excellence n'est pas un acte, mais une habitude.", auteur: "Aristote" },
  { texte: "Avance pas à pas. Chaque action compte.", auteur: "Inconnu" },
  { texte: "Investis en toi-même. C'est le meilleur investissement que tu puisses faire.", auteur: "Warren Buffett" },
  { texte: "La croissance commence là où ta zone de confort se termine.", auteur: "Inconnu" },
  { texte: "Tu n'as pas besoin d'être parfait pour progresser. Il suffit d'avancer.", auteur: "Inconnu" },
  { texte: "Chaque expert a été un débutant un jour.", auteur: "Inconnu" },
  { texte: "Ce que tu fais chaque jour compte plus que ce que tu fais de temps en temps.", auteur: "Inconnu" },
  { texte: "Vis comme si tu allais mourir demain. Apprends comme si tu allais vivre éternellement.", auteur: "Gandhi" },
];

export function obtenirCitationDuJour() {
  const index = new Date().getDate() % CITATIONS.length;
  return CITATIONS[index];
}

export const AVATARS = ['🦁', '🐯', '🦅', '🐺', '🦋', '🐻', '🦊', '🌸', '⚡', '🔥', '💎', '🌊', '🐉', '🦄', '🌟', '🎯'];
