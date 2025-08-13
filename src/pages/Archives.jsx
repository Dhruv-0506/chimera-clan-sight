/* backend/server.js */
const express = require('express');
const axios   = require('axios');
const cors    = require('cors');
require('dotenv').config();

const app       = express();
const PORT      = process.env.PORT || 3001;
const API_TOKEN = process.env.CLASH_API_TOKEN;
const CLAN_TAG  = '#2G8LRGU2Q';

app.use(cors());

const cocApi = axios.create({
  baseURL: 'https://api.clashofclans.com/v1',
  headers: { Authorization: `Bearer ${API_TOKEN}` }
});

const makeApiRequest = async (endpoint) => {
  try {
    const { data } = await cocApi.get(endpoint);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: `API Error: ${err.response?.status || err.message}` };
  }
};

/* ------------------------ */
/*   War-score helper       */
/* ------------------------ */
const calculateAttackScore = (attack, attacker_th, team_size, opponent_map) => {
  const star_power = { 3: 207, 2: 89, 1: 32, 0: 0 }[attack.stars] || 0;
  const destruction_factor = 1 + (attack.destructionPercentage || 0) / 250;

  const defender = opponent_map.get(attack.defenderTag);
  if (!defender) return 0;

  const defender_th = defender.townhallLevel || attacker_th;
  const th_diff     = attacker_th - defender_th;
  const th_mod      = Math.pow(1.6, -th_diff);

  const map_rank = defender.mapPosition || team_size;
  let map_mod = 1.0;
  if (map_rank <= team_size / 3) map_mod = 1.15;
  else if (map_rank > (team_size / 3) * 2) map_mod = 0.85;

  const first_hit_bonus = attack.order === 1 ? (team_size - map_rank) * 0.5 : 0;

  return star_power * destruction_factor * th_mod * map_mod + first_hit_bonus;
};

/* ------------------------ */
/*         Routes           */
/* ------------------------ */

app.get('/api/archive', async (_req, res) => {
  const encodedTag = encodeURIComponent(CLAN_TAG);
  const { data, error } = await makeApiRequest(`/clans/${encodedTag}/warlog?limit=50`);
  if (error) return res.status(500).json({ data: null, error });
  res.json({ data });
});

app.get('/api/war-log-stats', async (_req, res) => {
  const encodedTag = encodeURIComponent(CLAN_TAG);
  const result = await makeApiRequest(`/clans/${encodedTag}/warlog?limit=50`);
  res.json(result);
});

app.get('/api/current-war', async (_req, res) => {
  const encodedTag = encodeURIComponent(CLAN_TAG);
  const result = await makeApiRequest(`/clans/${encodedTag}/currentwar`);
  res.json(result);
});

/* NEW: CWL group (correct endpoint) */
app.get('/api/cwl-group', async (_req, res) => {
  const encodedTag = encodeURIComponent(CLAN_TAG);
  const result = await makeApiRequest(`/clans/${encodedTag}/currentwar/leaguegroup`);
  // When not in CWL, the API may return 404 or empty; normalize it.
  if (result.error && String(result.error).includes('404')) {
    return res.json({ data: null, error: 'Not currently in a CWL group.' });
  }
  res.json(result);
});

/* NEW: fetch a single CWL war by warTag */
app.get('/api/cwl-war/:warTag', async (req, res) => {
  const warTag = req.params.warTag.startsWith('#') ? req.params.warTag : `#${req.params.warTag}`;
  const result = await makeApiRequest(`/clanwarleagues/wars/${encodeURIComponent(warTag)}`);
  res.json(result);
});

app.get('/api/clan-info', async (_req, res) => {
  const result = await makeApiRequest(`/clans/${encodeURIComponent(CLAN_TAG)}`);
  res.json(result);
});

/* NEW: roster with average war scores for each player */
app.get('/api/player-roster', async (_req, res) => {
  try {
    const encTag = encodeURIComponent(CLAN_TAG);

    // Current clan members (for names/roles/townhall)
    const { data: clan, error: clanErr } = await makeApiRequest(`/clans/${encTag}`);
    if (clanErr) return res.status(500).json({ data: null, error: clanErr });

    // War log (for historical performance)
    const { data: warLog, error: logErr } = await makeApiRequest(`/clans/${encTag}/warlog?limit=50`);
    if (logErr) return res.status(500).json({ data: null, error: logErr });

    const currentMembers = new Map((clan.memberList || []).map(m => [m.tag, m]));

    const playerMap = new Map(); // tag -> stats aggregate

    for (const war of (warLog.items || [])) {
      if (war.state !== 'warEnded') continue;
      if (!war?.clan?.members || !war?.opponent?.members) continue;

      // Only compute scores for OUR clan's players
      const isOurClan = war.clan?.tag === CLAN_TAG;
      const ourSide = isOurClan ? war.clan : (war.opponent?.tag === CLAN_TAG ? war.opponent : null);
      const theirSide = isOurClan ? war.opponent : war.clan;
      if (!ourSide || !theirSide) continue;

      const opponentMap = new Map((theirSide.members || []).map(m => [m.tag, m]));
      const teamSize = war.teamSize || 15;

      for (const member of (ourSide.members || [])) {
        const attacks = member.attacks || [];
        if (!attacks.length) continue;

        const th = member.townhallLevel || 0;
        const warScore = attacks
          .map(a => calculateAttackScore(a, th, teamSize, opponentMap))
          .reduce((a, b) => a + b, 0);

        const key = member.tag;
        const agg = playerMap.get(key) || {
          tag: member.tag,
          name: member.name,
          totalScore: 0,
          wars: 0,
          attacks: 0,
          destructionSum: 0,
          warHistory: []
        };

        agg.totalScore += warScore;
        agg.wars += 1;
        agg.attacks += attacks.length;
        agg.destructionSum += attacks.reduce((s, a) => s + (a.destructionPercentage || 0), 0);
        agg.warHistory.push({ war: `War ${agg.warHistory.length + 1}`, score: warScore });

        playerMap.set(key, agg);
      }
    }

    const result = Array.from(playerMap.values()).map(p => {
      const cm = currentMembers.get(p.tag);
      const avg = p.wars ? p.totalScore / p.wars : 0;
      const avgDestr = p.attacks ? p.destructionSum / p.attacks : 0;
      return {
        tag: p.tag,
        name: p.name || cm?.name || 'Unknown',
        role: cm?.role || 'member',
        townHallLevel: cm?.townHallLevel || null,
        averageWarScore: Math.round(avg * 100) / 100,
        averageDestruction: Math.round(avgDestr * 10) / 10,
        warsParticipated: p.wars,
        attacks: p.attacks,
        warHistory: p.warHistory.slice(-15).reverse()
      };
    });

    // Sort desc by averageWarScore
    result.sort((a, b) => (b.averageWarScore || 0) - (a.averageWarScore || 0));

    res.json({ data: result, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: `Backend Error: ${err.message}` });
  }
});

app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
