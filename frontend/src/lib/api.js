import axios from 'axios';
import { workspaceKey, cacheKey, readCache, writeCache } from './offlineStore';

const backendUrl = process.env.REACT_APP_BACKEND_URL;
if (!backendUrl) throw new Error('REACT_APP_BACKEND_URL is required. Set your backend origin before building the frontend.');
export const api = axios.create({ baseURL: `${backendUrl.replace(/\/$/, '')}/api`, timeout: 20000 });
api.interceptors.request.use(config => {
  config.headers['X-Workspace-Key'] = workspaceKey();
  config.offlineCacheKey = cacheKey(config);
  const token = localStorage.getItem('kg-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(async response => {
  if (response.config.method === 'get') {
    try { await writeCache(response.config.offlineCacheKey, response.data); } catch (_) { /* Storage may be unavailable in private browsing. */ }
  }
  return response;
}, async error => {
  if (error.config?.method === 'get' && (!error.response || error.response.status >= 500)) {
    const cached = await readCache(error.config.offlineCacheKey).catch(() => null);
    if (cached) return { data: cached.value, status: 200, config: error.config, headers: { 'x-kisangyan-cached-at': cached.savedAt } };
  }
  return Promise.reject(error);
});
export const errorText = err => {
  const detail = err.response?.data?.detail;
  return typeof detail === 'string' ? detail : 'Please check your details and try again. / कृपया जानकारी जाँचकर फिर प्रयास करें।';
};
export const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);