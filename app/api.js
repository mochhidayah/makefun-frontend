const API = 'https://make.fun/api';
const memory = new Map();
const pending = new Map();

async function get(path) {
  if (pending.has(path)) return pending.get(path);
  const cached = memory.get(path);
  if (cached && Date.now() - cached.time < 60000) return cached.data;
  const request = refresh(path, cached).finally(() => pending.delete(path));
  pending.set(path, request);
  return request;
}

async function refresh(path, cached) {
  const headers = cached?.etag ? { 'If-None-Match': cached.etag } : {};
  const response = await fetch(API + path, { headers, signal: AbortSignal.timeout(15000) });
  if (response.status === 304 && cached) {
    cached.time = Date.now();
    return cached.data;
  }
  if (!response.ok) throw new Error(`API request failed (${response.status})`);
  const data = await response.json();
  memory.set(path, { data, time: Date.now(), etag: response.headers.get('etag') });
  return data;
}

export const getBounties = () => get('/competitions?status=open&activity=times');
export const getBounty = (slug) => get(`/competitions/${encodeURIComponent(slug)}`);
export const getLeaderboard = (slug) => get(`/competitions/${encodeURIComponent(slug)}/leaderboard`);
export const getProfile = (handle) => get(`/profiles/${encodeURIComponent(handle)}`);
