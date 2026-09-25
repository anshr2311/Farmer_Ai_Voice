import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

const AppContext = createContext();
export function AppProvider({ children }) {
  const [language, setLanguageState] = useState(localStorage.getItem('kg-language') || 'hi');
  const [user, setUser] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [request, setRequest] = useState(null);
  const [location, setLocation] = useState(localStorage.getItem('kg-location') || 'Bareilly');
  useEffect(() => {
    if (localStorage.getItem('kg-token')) api.get('/auth/me').then(r => setUser(r.data)).catch(error => { if (error.response?.status === 401) localStorage.removeItem('kg-token'); });
  }, []);
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  const setLanguage = lang => { setLanguageState(lang); localStorage.setItem('kg-language', lang); };
  const changeLocation = value => { setLocation(value); localStorage.setItem('kg-location', value); };
  const t = (hi, en) => language === 'hi' ? hi : en;
  return <AppContext.Provider value={{ language, setLanguage, user, setUser, loginOpen, setLoginOpen, request, setRequest, location, changeLocation, t }}>{children}</AppContext.Provider>;
}
export const useApp = () => useContext(AppContext);