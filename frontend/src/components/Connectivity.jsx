import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { listQueue, signal } from '../lib/offlineStore';
import { syncQueue, isSyncing } from '../lib/offlineQueue';

export const useConnectivity = () => {
  const [online, setOnline] = useState(navigator.onLine);
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);
  useEffect(() => {
    const update = () => { setOnline(navigator.onLine); setSyncing(isSyncing()); listQueue().then(items => setPending(items.length)).catch(() => {}); };
    update();
    ['online', 'offline', 'kg-offline-change'].forEach(event => window.addEventListener(event, update));
    return () => ['online', 'offline', 'kg-offline-change'].forEach(event => window.removeEventListener(event, update));
  }, []);
  return { online, pending, syncing };
};
export const Connectivity = () => {
  const { t, user } = useApp();
  const { online, pending, syncing } = useConnectivity();
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/offline-worker.js').then(() => navigator.serviceWorker.ready).then(registration => {
      const channel = new MessageChannel();
      channel.port1.onmessage = () => { localStorage.setItem('kg-shell-ready', 'true'); signal(); };
      const urls = [...document.querySelectorAll('script[src],link[rel="stylesheet"]')].map(e => e.src || e.href).concat(performance.getEntriesByType('resource').map(e => e.name));
      registration.active?.postMessage({ type: 'CACHE_ASSETS', urls }, [channel.port2]);
      const saver = localStorage.getItem('kg-data-saver') === 'true';
      document.documentElement.classList.toggle('data-saver', saver);
      registration.active?.postMessage({ type: 'DATA_SAVER', enabled: saver });
    }).catch(() => {});
  }, []);
  useEffect(() => {
    const resume = () => syncQueue();
    window.addEventListener('online', resume);
    const interval = setInterval(resume, 30000);
    resume();
    if (navigator.onLine) ['/ecosystem/monitoring', '/ecosystem/analytics', '/ecosystem/offers', '/ecosystem/overview', '/ecosystem/ledger', '/ecosystem/exchanges', '/products', '/prices', '/telemetry'].forEach(path => api.get(path).catch(() => {}));
    return () => { window.removeEventListener('online', resume); clearInterval(interval); };
  }, [user?.id]);
  return <Link to="/offline" className={`connectivity-bar ${online ? '' : 'disconnected'}`} data-testid="connectivity-status"><span>{online ? <Wifi size={13} /> : <WifiOff size={13} />}{online ? t('कनेक्टेड', 'Connected') : t('ऑफ़लाइन · इस डिवाइस पर सुरक्षित', 'Offline · saved on this device')}</span><span>{syncing ? <RefreshCw size={12} className="animate-spin" /> : null}{pending ? t(`${pending} अनुरोध बाकी`, `${pending} requests pending`) : t('कम इंटरनेट में भी साथ', 'Ready for the last mile')}<span aria-hidden="true">↗</span></span></Link>;
};