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
} from '../data/storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [donnees, setDonnees] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);

  // Chargement initial
  useEffect(() => {
    const data = chargerDonnees();
    if (data) {
      setDonnees(data);
    } else {
      setDonnees(initialiserDonnees());
    }
    setChargement(false);
  }, []);

  // Capturer le prompt d'installation PWA
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Afficher un toast
  const afficherToast = useCallback((message, type = 'success', emoji = '✅') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, emoji }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // Compléter une habitude
  const validerHabitude = useCallback((habitudeId) => {
    if (!donnees) return;

    const resultat = completerHabitude(donnees, habitudeId);

    if (resultat.donneesMaj) {
      setDonnees(resultat.donneesMaj);

      // Toast XP
      const msgXP = resultat.bonusXP > 0
        ? `+${resultat.xpGagne + resultat.bonusXP} XP (dont +${resultat.bonusXP} bonus !)`
        : `+${resultat.xpGagne} XP`;
      afficherToast(msgXP, 'xp', '⚡');

      // Toast jour parfait
      if (resultat.jourParfait) {
        setTimeout(() => afficherToast('PERFECT DAY ! 🏆 +50 XP bonus !', 'perfect', '🏆'), 500);
      }

      // Toast badges débloqués
      if (resultat.nouveauxBadges && resultat.nouveauxBadges.length > 0) {
        resultat.nouveauxBadges.forEach((badge, idx) => {
          setTimeout(() => {
            afficherToast(`Badge débloqué : ${badge.emoji} ${badge.nom} !`, 'badge', badge.emoji);
          }, 1000 + idx * 500);
        });
      }
    }
  }, [donnees, afficherToast]);

  // Annuler une habitude
  const devaliderHabitude = useCallback((habitudeId) => {
    if (!donnees) return;
    const nouvellesDonnees = annulerHabitude(donnees, habitudeId);
    setDonnees(nouvellesDonnees);
  }, [donnees]);

  // Mettre à jour le profil
  const mettreAJourProfil = useCallback((miseAJour) => {
    if (!donnees) return;
    const nouvellesDonnees = {
      ...donnees,
      profil: { ...donnees.profil, ...miseAJour }
    };
    sauvegarderDonnees(nouvellesDonnees);
    setDonnees(nouvellesDonnees);
  }, [donnees]);

  // Ajouter une habitude
  const ajouterHabitude = useCallback((habitude) => {
    if (!donnees) return;
    const habitudesActives = donnees.habitudes.filter(h => h.actif);

    // Limite freemium : 5 habitudes max
    if (habitudesActives.length >= 5) {
      afficherToast('Limite atteinte ! Passez à Pro pour des habitudes illimitées.', 'warning', '🔒');
      return false;
    }

    const nouvelleHabitude = {
      id: `custom_${Date.now()}`,
      icone: habitude.icone || '⭐',
      nom: habitude.nom,
      xp: 10,
      couleur: habitude.couleur || '#10B981',
      actif: true,
    };

    const nouvellesDonnees = {
      ...donnees,
      habitudes: [...donnees.habitudes, nouvelleHabitude],
    };
    sauvegarderDonnees(nouvellesDonnees);
    setDonnees(nouvellesDonnees);
    afficherToast(`Habitude "${habitude.nom}" ajoutée !`, 'success', '✅');
    return true;
  }, [donnees, afficherToast]);

  // Supprimer une habitude
  const supprimerHabitude = useCallback((habitudeId) => {
    if (!donnees) return;
    const nouvellesDonnees = {
      ...donnees,
      habitudes: donnees.habitudes.filter(h => h.id !== habitudeId),
    };
    sauvegarderDonnees(nouvellesDonnees);
    setDonnees(nouvellesDonnees);
    afficherToast('Habitude supprimée.', 'info', '🗑️');
  }, [donnees, afficherToast]);

  // Terminer l'onboarding
  const terminerOnboarding = useCallback((prenom, avatar) => {
    if (!donnees) return;
    const nouvellesDonnees = {
      ...donnees,
      profil: { ...donnees.profil, prenom, avatar },
      onboardingTermine: true,
    };
    sauvegarderDonnees(nouvellesDonnees);
    setDonnees(nouvellesDonnees);
  }, [donnees]);

  // Données dérivées
  const aujourd_hui = obtenirDateAujourdhui();
  const completionsAujourdhui = donnees?.historique?.[aujourd_hui] || [];
  const infoNiveau = donnees ? calculerNiveau(donnees.profil.niveauXP) : null;

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
  };

  return (
    <AppContext.Provider value={valeur}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const contexte = useContext(AppContext);
  if (!contexte) throw new Error('useApp doit être utilisé dans AppProvider');
  return contexte;
}
