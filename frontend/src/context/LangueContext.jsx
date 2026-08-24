import { createContext,useContext, useEffect, useState } from 'react';
import i18n from '../i18n';

const LANGUES_RTL = ['ar'];

const LanguageContext = createContext(null);

export function LangueProvider({ children }) {
  const [langue, setLangueState] = useState(() => localStorage.getItem('langue') || 'fr');

  useEffect(() => {
    const dir = LANGUES_RTL.includes(langue) ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = langue;
    localStorage.setItem('langue', langue);
    i18n.changeLanguage(langue);
  }, [langue]);

  const setLangue = (nouvelleLangue) => setLangueState(nouvelleLangue);

  return (
    <LanguageContext.Provider value={{ langue, setLangue, estRTL: LANGUES_RTL.includes(langue) }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage doit être utilisé dans LanguageProvider');
  return ctx;
}