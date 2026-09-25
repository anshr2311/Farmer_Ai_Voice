import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { listQueue, scope } from '../lib/offlineStore';

export const useLedger = () => {
  const [records, setRecords] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(false);
  const currentScope = scope();
  const reload = useCallback(async () => {
    try {
      const pending = (await listQueue()).filter(item => item.kind === 'ledger');
      let saved = [];
      try { saved = (await api.get('/ecosystem/ledger')).data; setError(false); } catch (_) { setError(navigator.onLine); }
      if (scope() !== currentScope) return;
      const merged = new Map(saved.map(record => [record.id, record]));
      pending.forEach(item => merged.set(item.id, { ...item.body, id: item.id, status: item.status === 'failed' ? 'failed' : 'queued', demo_units: 0, created_at: item.createdAt }));
      setRecords([...merged.values()].sort((a, b) => b.created_at.localeCompare(a.created_at)));
    } catch (_) { setError(true); } finally { setLoading(false); }
  }, [currentScope]);
  useEffect(() => { reload(); window.addEventListener('kg-offline-change', reload); return () => window.removeEventListener('kg-offline-change', reload); }, [reload]);
  return { records, loading, error, reload };
};