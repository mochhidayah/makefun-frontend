import { getBounties, getBounty, getLeaderboard, getProfile } from './api.js';
import { board, bounty, leaderboard, profile } from './views.js';
import { esc } from './format.js';

const app = document.getElementById('app');
let revision = 0;
window.__shotReady = false;

function route() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  if (parts[0] === 'bounty' && parts[1]) return { type: 'bounty', slug: parts[1] };
  if (parts[0] === 'leaderboard' && parts[1]) return { type: 'leaderboard', slug: parts[1] };
  if (parts[0] === 'profile' && parts[1]) return { type: 'profile', handle: parts[1] };
  return { type: 'board' };
}

async function render() {
  const version = ++revision;
  window.__shotReady = false;
  app.innerHTML = '<div class="loading"><span class="spinner"></span><p>Loading live data…</p></div>';
  try {
    const current = route();
    if (current.type === 'board') {
      document.title = 'Open bounties · make.fun';
      const data = await getBounties();
      if (version !== revision) return;
      app.innerHTML = board(data);
    } else if (current.type === 'bounty') {
      const data = await getBounty(current.slug);
      if (version !== revision) return;
      document.title = `${data.title || data.name || 'Bounty'} · make.fun`;
      app.innerHTML = bounty(data);
    } else if (current.type === 'leaderboard') {
      const data = await getLeaderboard(current.slug);
      if (version !== revision) return;
      document.title = `Leaderboard · make.fun`;
      app.innerHTML = leaderboard(data, current.slug);
    } else {
      const data = await getProfile(current.handle);
      if (version !== revision) return;
      document.title = `@${current.handle} · make.fun`;
      app.innerHTML = profile(data);
    }
  } catch (error) {
    if (version !== revision) return;
    app.innerHTML = `<div class="error"><div class="card-kicker">COULDN’T LOAD THAT VIEW</div><h1>Something went sideways.</h1><p>${esc(error.message || 'Please try again.')}</p><button class="button" id="retry">Try again <span>↻</span></button></div>`;
    document.getElementById('retry')?.addEventListener('click', render);
  }
  window.scrollTo(0, 0);
  window.__shotReady = !app.querySelector('.error');
}

window.addEventListener('hashchange', render);
render();
