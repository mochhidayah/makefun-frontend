import { date, esc, list, money, timeLeft, value } from './format.js';

const pot = (b) => money(value(b, 'potUsd', 'livePotUsd', 'rewardAmount', 'reward'));
const fee = (b) => value(b, 'entryFeeUsd', 'entryFee', 'feeUsd');
const count = (b) => value(b, 'submissionCount', 'entryCount', 'entriesCount', 'entries') ?? 0;
const slug = (b) => value(b, 'slug', 'id');
const deadline = (b) => value(b, 'deadline', 'endsAt', 'endDate');
const avatar = (p) => value(p, 'picture', 'avatarUrl', 'avatar', 'image');

function stat(label, body, accent = '') {
  return `<div class="stat ${accent}"><span>${label}</span><strong>${body}</strong></div>`;
}

export function layout(content, eyebrow = '') {
  return `<div class="page-head"><div class="eyebrow">${eyebrow}</div>${content}</div>`;
}

export function board(data) {
  const items = list(data).filter((b) => b);
  const rows = items.map((b) => `<article class="bounty-card">
    <div class="card-main"><div class="card-kicker">${timeLeft(deadline(b)) === 'ended' ? 'AWAITING RESULTS' : 'LIVE BOUNTY'}</div><h2><a href="#/bounty/${encodeURIComponent(slug(b))}">${esc(value(b, 'title', 'name'))}</a></h2><p>${esc(value(b, 'summary', 'description') || 'Build something remarkable.')}</p>${fee(b) ? `<small>${esc(count(b))} entries</small>` : ''}</div>
    <div class="card-stats">${stat('Live pot', pot(b), 'gold')}${fee(b) ? stat('Entry fee', money(fee(b))) : stat('Entries', count(b))}${stat('Time left', timeLeft(deadline(b)), 'time')}</div>
    <a class="arrow-link" aria-label="Open ${esc(value(b, 'title', 'name'))}" href="#/bounty/${encodeURIComponent(slug(b))}">↗</a>
  </article>`).join('');
  return layout(`<h1>Build what’s next.</h1><p class="lead">Live competitions for curious builders. Find a brief, ship your edge, and earn your place.</p><div class="board-meta"><span>${items.length} open ${items.length === 1 ? 'bounty' : 'bounties'}</span><span class="live-dot">Updated live</span></div><section class="bounty-list" aria-label="Open bounties">${rows || '<div class="empty">No open bounties right now.</div>'}</section>`, 'MAKE.FUN / OPEN CALLS');
}

export function bounty(b) {
  const bSlug = slug(b);
  const rewards = list(value(b, 'rewards', 'prizes', 'rewardTiers'));
  const rules = value(b, 'rules', 'requirements', 'guidelines');
  return layout(`<a class="back" href="#/">← All bounties</a><div class="hero-row"><div><div class="card-kicker">LIVE BOUNTY</div><h1>${esc(value(b, 'title', 'name'))}</h1><p class="lead">${esc(value(b, 'summary') || '')}</p></div><div class="hero-pot"><span>Live pot</span><strong>${pot(b)}</strong></div></div><div class="detail-stats">${stat('Entries', count(b))}${stat('Time left', timeLeft(deadline(b)), 'time')}${stat('Entry fee', fee(b) ? money(fee(b)) : 'Free')}${stat('Deadline', date(deadline(b)))}</div><div class="content-grid"><article class="prose"><h2>The brief</h2><div class="description">${esc(value(b, 'description') || 'No description provided.')}</div>${rules ? `<h2>Rules</h2><div class="description">${esc(Array.isArray(rules) ? rules.join('\n') : rules)}</div>` : ''}</article><aside class="side-card"><h2>Rewards</h2>${rewards.length ? rewards.map((r, i) => `<div class="reward-row"><b>${esc(value(r, 'place', 'rank') || `${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : 'rd'}`)}</b><strong>${money(value(r, 'amountUsd', 'amount', 'reward'))}</strong></div>`).join('') : `<div class="reward-row"><b>Prize pool</b><strong>${pot(b)}</strong></div>`}<a class="button" href="#/leaderboard/${encodeURIComponent(bSlug)}">View leaderboard <span>→</span></a></aside></div>`, 'MAKE.FUN / BOUNTY');
}

export function leaderboard(data, bSlug) {
  const rows = list(data);
  const rankKey = data?.rank_key;
  const buildCost = (cost) => {
    if (cost?.micro_usd == null) return '—';
    const formatted = money(Number(cost.micro_usd) / 1e6);
    return formatted === '—' || formatted.includes('.') ? formatted : `${formatted}.00`;
  };
  const buildTime = (ms) => {
    if (ms == null || !Number.isFinite(ms) || ms < 0) return '—';
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days) return `${days}d ${hours % 24}h`;
    if (hours) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };
  return layout(`<a class="back" href="#/bounty/${encodeURIComponent(bSlug)}">← Back to bounty</a><h1>Leaderboard</h1><p class="lead">The builders setting the pace.</p><div class="table-wrap"><table><caption class="sr-only">Ranked entries</caption><thead><tr><th>Rank</th><th>Entrant</th><th>Score</th><th>Build cost</th><th>Build time</th></tr></thead><tbody>${rows.map((r, i) => { const entrant = value(r, 'handle', 'username', 'entrant', 'author', 'name') || 'Anonymous'; return `<tr><td><span class="rank">${value(r, 'rank', 'position') || i + 1}</span></td><td><a href="#/profile/${encodeURIComponent(entrant.replace(/^@/, ''))}">${esc(entrant)}</a></td><td class="score">${esc(r.display?.[rankKey] ?? r.values?.[rankKey] ?? '—')}</td><td>${esc(buildCost(r.cost))}</td><td>${esc(buildTime(r.build_wall_ms))}</td></tr>`; }).join('')}</tbody></table></div>`, 'MAKE.FUN / STANDINGS');
}

export function profile(p) {
  const entries = list(value(p, 'entries', 'submissions')); const prizes = list(value(p, 'prizes', 'wins', 'awards')); const handle = value(p, 'handle', 'username', 'name');
  return layout(`<div class="profile-head">${avatar(p) ? `<img crossorigin="anonymous" src="${esc(avatar(p))}" alt="" class="avatar">` : '<div class="avatar placeholder">◎</div>'}<div><div class="card-kicker">PUBLIC PROFILE</div><h1>${esc(handle || 'Builder')}</h1><p class="lead">${esc(value(p, 'bio', 'description') || 'A make.fun builder.')}</p></div></div><div class="detail-stats">${stat('Entries', entries.length || value(p, 'entryCount') || 0)}${stat('Prizes', prizes.length || value(p, 'prizeCount') || 0)}</div><div class="content-grid"><article class="prose"><h2>Entries</h2>${entries.length ? `<ul class="profile-list">${entries.map((e) => `<li>${esc(value(e, 'title', 'competition', 'name') || 'Competition entry')} <span>${esc(value(e, 'score', 'status') || '')}</span></li>`).join('')}</ul>` : '<p>No public entries listed.</p>'}</article><aside class="side-card"><h2>Prizes</h2>${prizes.length ? prizes.map((r) => `<div class="reward-row"><b>${esc(value(r, 'title', 'competition', 'name') || 'Prize')}</b><strong>${money(value(r, 'amountUsd', 'amount'))}</strong></div>`).join('') : '<p>No prizes listed yet.</p>'}</aside></div>`, 'MAKE.FUN / BUILDER');
}
