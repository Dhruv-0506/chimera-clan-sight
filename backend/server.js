/* backend/server.js */
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const API_TOKEN = process.env.CLASH_API_TOKEN;
const CLAN_TAG = '#2G8LRGU2Q';

app.use(cors());

const cocApi = axios.create({
  baseURL: 'https://api.clashofclans.com/v1',
  headers: { Authorization: `Bearer ${API_TOKEN}` },
});

const makeApiRequest = async (endpoint) => {
  try {
    const { data } = await cocApi.get(endpoint);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: `API Error: ${err.response?.status || err.message}` };
  }
};

/* ---------- War Score Helper ---------- */
const calculateAttackScore = (attack, attacker_th, team_size, opponent_map) => {
  const star_power = { 3: 207, 2: 89, 1: 32, 0: 0 }[attack.stars] || 0;
  const destruction_factor = 1 + attack.destructionPercentage / 250;
  const defender = opponent_map.get(attack.defenderTag);
  if (!defender) return 0;
  const defender_th = defender.townhallLevel || attacker_th;
  const th_diff = attacker_th - defender_th;
  const th_mod = Math.pow(1.6, -th_diff);
  const map_rank = defender.mapPosition || team_size;
  let map_mod = 1.0;
  if (map_rank <= team_size / 3) map_mod = 1.15;
  else if (map_rank > (team_size / 3) * 2) map_mod = 0.85;
  const first_hit_bonus = attack.order === 1 ? (team_size - map_rank) * 0.5 : 0;
  return star_power * destruction_factor * th_mod * map_mod + first_hit_bonus;
};

/* ---------- Routes ---------- */

// Full clan roster for frontend
app.get('/api/player-roster', async (_req, res) => {
  const encodedTag = encodeURIComponent(CLAN_TAG);
  const { data, error } = await makeApiRequest(`/clans/${encodedTag}`);
  if (error) return res.status(500).json({ data: null, error });

  // Map API fields to frontend-friendly keys
  const members = (data.members ?? []).map(m => ({
    tag: m.tag,
    name: m.name,
    townhallLevel: m.townHallLevel, // lowercase for frontend
    role: m.role,
    donations: m.donations ?? 0,
    donationsReceived: m.donationsReceived ?? 0,
    attackWins: m.attackWins ?? 0,
    defenseWins: m.defenseWins ?? 0,
  }));

  res.json({ data: members, error: null });
});

// Alias route for frontend compatibility
app.get('/api/clan-info', async (_req, res) => {
  const encodedTag = encodeURIComponent(CLAN_TAG);
  const { data, error } = await makeApiRequest(`/clans/${encodedTag}`);
  if (error) return res.status(500).json({ data: null, error });

  const memberList = (data.members ?? []).map(m => ({
    tag: m.tag,
    name: m.name,
    townhallLevel: m.townHallLevel,
    role: m.role,
    donations: m.donations ?? 0,
    donationsReceived: m.donationsReceived ?? 0,
    attackWins: m.attackWins ?? 0,
    defenseWins: m.defenseWins ?? 0,
  }));

  res.json({ data: { memberList }, error: null });
});

// Archive wars
app.get('/api/archive', async (_req, res) => {
  const encodedTag = encodeURIComponent(CLAN_TAG);
  const { data, error } = await makeApiRequest(`/clans/${encodedTag}/warlog?limit=50`);
  if (error) return res.status(500).json({ data: null, error });

  const filtered = (data.items || []).filter(w => w.opponent?.members?.length);
  res.json({ data: filtered, error: null });
});

// War log stats
app.get('/api/war-log-stats', async (_req, res) => {
  const encodedTag = encodeURIComponent(CLAN_TAG);
  const { data, error } = await makeApiRequest(`/clans/${encodedTag}/warlog?limit=50`);
  if (error) return res.status(500).json({ data: null, error });

  const filtered = (data.items || []).filter(w => w.opponent?.members?.length);
  res.json({ data: filtered, error: null });
});

// Current War
app.get('/api/current-war', async (_req, res) => {
  const encodedTag = encodeURIComponent(CLAN_TAG);
  const { data, error } = await makeApiRequest(`/clans/${encodedTag}/currentwar`);
  res.json({ data, error });
});

// CWL normalized
app.get('/api/cwl', async (_req, res) => {
  const encodedTag = encodeURIComponent(CLAN_TAG);
  const { data, error } = await makeApiRequest(`/clans/${encodedTag}/currentwar`);
  if (error) return res.status(500).json({ data: null, error });

  const clans = [];
  if (data.clan) clans.push({ ...data.clan, tag: data.clan.tag, name: data.clan.name, stars: data.clan.stars ?? 0 });
  if (data.opponent) clans.push({ ...data.opponent, tag: data.opponent.tag, name: data.opponent.name, stars: data.opponent.stars ?? 0 });

  res.json({ data: { clans, state: data.state ?? 'notInWar' }, error: null });
});

// Player performance history
app.get('/api/player-performance/:playerTag', async (req, res) => {
  const playerTag = `#${req.params.playerTag}`;
  const clanEnc = encodeURIComponent(CLAN_TAG);

  try {
    const { data: warLog, error } = await makeApiRequest(`/clans/${clanEnc}/warlog?limit=50`);
    if (error) throw new Error(error);

    const warScores = [];
    for (const war of warLog.items || []) {
      if (war.state !== 'warEnded' || !war.clan?.members) continue;
      const member = war.clan.members.find(m => m.tag === playerTag);
      if (!member?.attacks?.length) continue;

      const opponentMap = new Map((war.opponent?.members || []).map(m => [m.tag, m]));
      const teamSize = war.teamSize || 1;
      const thLevel = member.townhallLevel;

      const wps = member.attacks
        .map(a => calculateAttackScore(a, thLevel, teamSize, opponentMap))
        .reduce((a, b) => a + b, 0);
      warScores.push(wps);
    }

    const avg = warScores.length ? warScores.reduce((a, b) => a + b, 0) / warScores.length : 0;
    const history = warScores.slice(-15).reverse().map((s, i) => ({ war: `War ${i + 1}`, score: s }));
    res.json({ data: { averageWarScore: avg, warHistory: history }, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: `Backend Error: ${err.message}` });
  }
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
