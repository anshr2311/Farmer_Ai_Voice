import { api } from './api';
import { listQueue, putQueue, removeQueue, scope, saveAdvice, listAdvice, signal } from './offlineStore';

let syncing = false;
export const submitDurable = async (path, payload, kind) => {
  const body = { ...payload, client_id: payload.client_id || crypto.randomUUID() };
  const item = { id: body.client_id, scope: scope(), path, body, kind, createdAt: new Date().toISOString(), status: 'queued', error: '' };
  if (navigator.onLine) {
    try { const { data } = await api.post(path, body); return { data, queued: false }; }
    catch (error) { if (error.response && error.response.status < 500) throw error; }
  }
  await putQueue(item);
  return { data: { ...body, id: item.id, status: 'queued', created_at: item.createdAt }, queued: true };
};
export const sendAdvice = async (question, language) => {
  const result = await submitDurable('/advice', { question, language }, 'advice');
  if (result.queued) {
    const cached = (await listAdvice()).find(a => a.question === question && a.language === language && !a.queued);
    result.data = { ...result.data, answer: cached?.answer || (language === 'hi' ? 'आपका सवाल इस डिवाइस पर सुरक्षित है। इंटरनेट लौटने पर जवाब मिलेगा। अभी नई सलाह उपलब्ध नहीं है।' : 'Your question is saved on this device. A reply will be requested when the connection returns; no new advice is available yet.'), language, question, queued: true, cached: !!cached };
  }
  await saveAdvice(result.data);
  return result.data;
};
export const syncQueue = async () => {
  if (syncing || !navigator.onLine) return;
  syncing = true; signal();
  try {
    for (const item of await listQueue()) {
      if (item.scope !== scope()) break;
      if (item.status === 'failed') continue;
      try {
        const { data } = await api.post(item.path, item.body);
        if (item.kind === 'advice') await saveAdvice(data);
        await removeQueue(item.id);
      } catch (error) {
        const detail = error.response?.data?.detail;
        await putQueue({ ...item, status: error.response && error.response.status < 500 ? 'failed' : 'queued', error: typeof detail === 'string' ? detail : 'Connection unavailable; waiting to retry.' });
        if (!error.response || error.response.status >= 500) break;
      }
    }
  } finally { syncing = false; signal(); }
};
export const isSyncing = () => syncing;