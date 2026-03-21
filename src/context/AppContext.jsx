// ============================
// CONTEXTE GLOBAL DE L'APPLICATION
// ============================

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  chargerDonnees,
  initialiserDonnees,
  sauvegarderDonnees,
  completerHabitude,
  annulerHabitude,
  calculerNiveau,
  obtenirDateAujourdhui,
  verifierBadges,
} from '../data/storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [donnees, setDonnees] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);

  useEffect(() => {
    const data = chargerDonnees();
    setDonnees(data ?? initialiserDonnees());
    setChargement(false);
  }, []);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const afficherToast = useCallback((message, type = 'success', emoji = '✅') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, emoji }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const validerHabitude = useCallback((habitudeId) => {
    if (!donnees) return;
    const resultat = completerHabitude(donnees, habitudeId);
    if (resultat.donneesMaj) {
      setDonnees(resultat.donneesMaj);
      const msgXP = resultat.bonusXP > 0
        ? `+${resultat.xpGagne + resultat.bonusXP} XP (dont +${resultat.bonusXP} bonus !)`
        : `+${resultat.xpGagne} XP`;
      afficherToast(msgXP, 'xp', '⚡');
      if (resultat.jourParfait) setTimeout(() => afficherToast('PERFECT DAY ! 🏆 +50 XP bonus !', 'perfect', '🏆'), 500);
      if (resultat.nouveauxBadges?.length > 0) {
        resultat.nouveauxBadges.forEach((badge, idx) => {
          setTimeout(() => afficherToast(`Badge débloqué : ${badge.emoji} ${badge.nom} !`, 'badge', badge.emoji), 1000 + idx * 500);
        });
      }
    }
  }, [donnees, afficherToast]);

  const devaliderHabitude = useCallback((habitudeId) => {
    if (!donnees) return;
    setDonnees(annulerHabitude(donnees, habitudeId));
  }, [donnees]);

  const mettreAJourProfil = useCallback((miseAJour) => {
    if (!donnees) return;
    const nouvellesDonnees = { ...donnees, profil: { ...donnees.profil, ...miseAJour } };
    sauvegarderDonnees(nouvellesDonnees);
    setDonnees(nouvellesDonnees);
  }, [donnees]);

  const ajouterHabitude = useCallback((habitude) => {
    if (!donnees) return false;
    const habitudesActives = donnees.habitudes.filter(h => h.actif);
    if (habitudesActives.length >= 8) {
      afficherToast('Maximum 8 habitudes actives.', 'warning', '🔒');
      return false;
    }
    const nouvelleHabitude = {
      id: `custom_${Date.now()}`,
      icone: habitude.icone || '⭐',
      nom: habitude.nom,
      xp: habitude.xp || 10,
      couleur: habitude.couleur || '#10B981',
      categorie: habitude.categorie || 'sante',
      actif: true,
    };
    const nouvellesDonnees = { ...donnees, habitudes: [...donnees.habitudes, nouvelleHabitude] };
    sauvegarderDonnees(nouvellesDonnees);
    setDonnees(nouvellesDonnees);
    afficherToast(`"${habitude.nom}" ajoutée !`, 'success', '✅');
    return true;
  }, [donnees, afficherToast]);

  const supprimerHabitude = useCallback((habitudeId) => {
    if (!donnees) return;
    const nouvellesDonnees = { ...donnees, habitudes: donnees.habitudes.filter(h => h.id !== habitudeId) };
    sauvegarderDonnees(nouvellesDonnees);
    setDonnees(nouvellesDonnees);
    afficherToast('Habitude supprimée.', 'info', '🗑️');
  }, [donnees, afficherToast]);

  const terminerOnboarding = useCallback((prenom, avatar, domainesFocus = []) => {
    if (!donnees) return;
    const nouvellesDonnees = {
      ...donnees,
      profil: { ...donnees.profil, prenom, avatar, domainesFocus },
      onboardingTermine: true,
    };
    sauvegarderDonnees(nouvellesDonnees);
    setDonnees(nouvellesDonnees);
  }, [donnees]);

  // ============================
  // Journal
  // ============================
  const sauvegarderJournal = useCallback((entree) => {
    if (!donnees) return;
    const aujourd_hui = obtenirDateAujourdhui();
    const journalExistant = donnees.journal?.[aujourd_hui] || {};
    const journal = { ...donnees.journal, [aujourd_hui]: { ...journalExistant, ...entree } };
    let nouvellesDonnees = { ...donnees, journal };

    const etaitVide = !journalExistant.reflexion && !journalExistant.gratitude?.some(g => g);
    const estMaintenant = entree.reflexion || entree.gratitude?.some(g => g);
    if (etaitVide && estMaintenant) {
      const xpAvec = donnees.profil.niveauXP + 15;
      const infoNiveau = calculerNiveau(xpAvec);
      nouvellesDonnees.profil = { ...nouvellesDonnees.profil, niveauXP: xpAvec, niveau: infoNiveau.niveau };
      afficherToast('+15 XP — Journal complété !', 'xp', '📝');
    }

    const { donneesMaj, nouveauxBadges } = verifierBadges(nouvellesDonnees);
    sauvegarderDonnees(donneesMaj);
    setDonnees(donneesMaj);
    if (nouveauxBadges?.length > 0) {
      nouveauxBadges.forEach((badge, idx) => {
        setTimeout(() => afficherToast(`Badge débloqué : ${badge.emoji} ${badge.nom} !`, 'badge', badge.emoji), 500 + idx * 500);
      });
    }
  }, [donnees, afficherToast]);

  // ============================
  // Objectifs
  // ============================
  const ajouterObjectif = useCallback((objectif) => {
    if (!donnees) return;
    const nouvelObjectif = {
      id: `obj_${Date.now()}`,
      titre: objectif.titre,
      description: objectif.description || '',
      categorie: objectif.categorie || 'sante',
      icone: objectif.icone || '🎯',
      couleur: objectif.couleur || '#10B981',
      etapes: (objectif.etapes || []).filter(t => t.trim()).map((texte, i) => ({ id: `step_${Date.now()}_${i}`, texte, fait: false })),
      dateEcheance: objectif.dateEcheance || null,
      dateCreation: new Date().toISOString(),
      termine: false,
    };
    const nouvellesDonnees = { ...donnees, objectifs: [...(donnees.objectifs || []), nouvelObjectif] };
    sauvegarderDonnees(nouvellesDonnees);
    setDonnees(nouvellesDonnees);
    afficherToast(`Objectif "${objectif.titre}" créé !`, 'success', '🎯');
  }, [donnees, afficherToast]);

  const toggleEtapeObjectif = useCallback((objectifId, etapeId) => {
    if (!donnees) return;
    let objectifTermineAujourdHui = false;
    const objectifs = donnees.objectifs.map(obj => {
      if (obj.id !== objectifId) return obj;
      const etapes = obj.etapes.map(e => e.id === etapeId ? { ...e, fait: !e.fait } : e);
      const toutFait = etapes.length > 0 && etapes.every(e => e.fait);
      if (toutFait && !obj.termine) objectifTermineAujourdHui = true;
      return { ...obj, etapes, termine: toutFait };
    });
    let nouvellesDonnees = { ...donnees, objectifs };

    if (objectifTermineAujourdHui) {
      const xpAvec = donnees.profil.niveauXP + 30;
      const infoNiveau = calculerNiveau(xpAvec);
      nouvellesDonnees.profil = { ...nouvellesDonnees.profil, niveauXP: xpAvec, niveau: infoNiveau.niveau };
      afficherToast('Objectif atteint ! 🚀 +30 XP', 'perfect', '🚀');
    }

    const { donneesMaj, nouveauxBadges } = verifierBadges(nouvellesDonnees);
    sauvegarderDonnees(donneesMaj);
    setDonnees(donneesMaj);
    if (nouveauxBadges?.length > 0) {
      nouveauxBadges.forEach((badge, idx) => {
        setTimeout(() => afficherToast(`Badge débloqué : ${badge.emoji} ${badge.nom} !`, 'badge', badge.emoji), 300 + idx * 500);
      });
    }
  }, [donnees, afficherToast]);

  const supprimerObjectif = useCallback((objectifId) => {
    if (!donnees) return;
    const nouvellesDonnees = { ...donnees, objectifs: donnees.objectifs.filter(o => o.id !== objectifId) };
    sauvegarderDonnees(nouvellesDonnees);
    setDonnees(nouvellesDonnees);
    afficherToast('Objectif supprimé.', 'info', '🗑️');
  }, [donnees, afficherToast]);

  const marquerDefiTermine = useCallback(() => {
    if (!donnees) return;
    const aujourd_hui = obtenirDateAujourdhui();
    const journalExistant = donnees.journal?.[aujourd_hui] || {};
    if (journalExistant.defiTermine) return;
    const journal = { ...donnees.journal, [aujourd_hui]: { ...journalExistant, defiTermine: true } };
    const xpAvec = donnees.profil.niveauXP + 20;
    const infoNiveau = calculerNiveau(xpAvec);
    const profil = { ...donnees.profil, niveauXP: xpAvec, niveau: infoNiveau.niveau };
    const nouvellesDonnees = { ...donnees, journal, profil };
    sauvegarderDonnees(nouvellesDonnees);
    setDonnees(nouvellesDonnees);
    afficherToast('+20 XP — Défi du jour relevé !', 'xp', '⚡');
  }, [donnees, afficherToast]);

  const aujourd_hui = obtenirDateAujourdhui();
  const completionsAujourdhui = donnees?.historique?.[aujourd_hui] || [];
  const infoNiveau = donnees ? calculerNiveau(donnees.profil.niveauXP) : null;
  const entreeJournalAujourdhui = donnees?.journal?.[aujourd_hui] || null;

  const valeur = {
    donnees,
    setDonnees,
    chargement,
    toasts,
    afficherToast,
    validerHabitude,
    devaliderHabitude,
    mettreAJourProfil,
    ajouterHabitude,
    supprimerHabitude,
    terminerOnboarding,
    completionsAujourdhui,
    infoNiveau,
    deferredInstallPrompt,
    sauvegarderJournal,
    entreeJournalAujourdhui,
    ajouterObjectif,
    toggleEtapeObjectif,
    supprimerObjectif,
    marquerDefiTermine,
  };

  return <AppContext.Provider value={valeur}>{children}</AppContext.Provider>;
}

export function useApp() {
  const contexte = useContext(AppContext);
  if (!contexte) throw new Error('useApp doit être utilisé dans AppProvider');
  return contexte;
}
