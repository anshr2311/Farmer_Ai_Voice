import { openDB } from 'idb';

const db = openDB('kisangyan-offline-v1', 1, { upgrade(database) {
  database.createObjectStore('cache');
  database.createObjectStore('queue', { keyPath: 'id' });
  database.createObjectStore('advice', { keyPath: 'id' });
} });
export const workspaceKey = () => {
  let key = localStorage.getItem('kg-workspace-key');
  if (!key) { key = crypto.randomUUID(); localStorage.setItem('kg-workspace-key', key); }
  return key;
};
export const scope = () => {
  const token = localStorage.getItem('kg-token');
  return token ? `profile:${token.slice(0, 20)}` : `device:${workspaceKey()}`;
};
export const signal = () => window.dispatchEvent(new Event('kg-offline-change'));
export const cacheKey = config => `${scope()}:${config.url}:${JSON.stringify(config.params || {})}`;
export const readCache = async key => (await db).get('cache', key);
export const writeCache = async (key, value) => { const database = await db; await database.put('cache', { value, savedAt: new Date().toISOString() }, key); };
export const invalidateWorkspace = async () => {
  const database = await db;
  const keys = await database.getAllKeys('cache');
  await Promise.all(keys.filter(k => k.startsWith(scope()) && (k.includes('/ecosystem/ledger') || k.includes('/ecosystem/overview'))).map(k => database.delete('cache', k)));
};
export const listQueue = async (all = false) => (await (await db).getAll('queue')).filter(item => all || item.scope === scope()).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
export const putQueue = async item => { await (await db).put('queue', item); signal(); };
export const removeQueue = async id => { await (await db).delete('queue', id); signal(); };
export const saveAdvice = async advice => { await (await db).put('advice', { ...advice, scope: scope() }); signal(); };
export const listAdvice = async () => (await (await db).getAll('advice')).filter(a => a.scope === scope()).sort((a, b) => b.created_at.localeCompare(a.created_at));
export const clearAdvice = async () => { const database = await db; for (const item of await listAdvice()) await database.delete('advice', item.id); signal(); };