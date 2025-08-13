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

/* ---------- helper: safe CoC fetch ---------- */
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

/* ---------- routes ---------- */
// 1. clan info
app.get('/api/clan-info', async (_req, res) => {
  const result = await makeApiRequest(`/clans/${encodeURIComponent(CLAN_TAG)}`);
  res.json(result);
});

// 2. current war
app.get('/api/current-war', async (_req, res) => {
  const result = await makeApiRequest(`/clans/${encodeURIComponent(CLAN_TAG)}/currentwar`);
  res.json(result);
});

// 3. war log
app.get('/api/war-log-stats', async (_req, res) => {
  const result = await makeApiRequest(`/clans/${encodeURIComponent(CLAN_TAG)}/warlog?limit=50`);
  res.json(result);
});

// 4. player performance (single player)
app.get('/api/player-performance/:playerTag', async (req, res) => {
  const playerTag = `#${req.params.playerTag}`;
  const clanEnc   = encodeURIComponent(CLAN_TAG);

  try {
    const { data: warLog, error } = await makeApiRequest(`${clanEnc}/warlog?limit=50`);
    if (error) throw new Error(error);

    const warScores = [];
    for (const war of warLog.items || []) {
      if (war.state !== 'warEnded' || !war.clan?.members) continue;

      const member = war.clan.members.find(m => m.tag === playerTag);
      if (!member?.attacks?.length) continue;

      const opponentMap = new Map((war.opponent?.members || []).map(m => [m.tag, m]));
      const teamSize    = war.teamSize || 1;
      const thLevel     = member.townhallLevel;

      const wps = member.attacks.reduce((sum, atk) => {
        const starsMap = { 3: 207, 2: 89, 1: 32, 0: 0 };
        const starPower = starsMap[atk.stars] || 0;
        const destructionFactor = 1 + (atk.destructionPercentage / 250);
        const defender = opponentMap.get(atk.defenderTag);
        if (!defender) return sum;
        const thDiff = thLevel - (defender.townhallLevel || thLevel);
        const thMod  = Math.pow(1.6, -thDiff);
        const rank   = defender.mapPosition || teamSize;
        let mapMod   = 1.0;
        if (rank <= teamSize / 3) mapMod = 1.15;
        else if (rank > (teamSize / 3) * 2) mapMod = 0.85;
        const firstHit = atk.order === 1 ? (teamSize - rank) * 0.5 : 0;
        return sum + (starPower * destructionFactor * thMod * mapMod) + firstHit;
      }, 0);

      warScores.push(wps);
    }

    const avg = warScores.length ? warScores.reduce((a, b) => a + b, 0) / warScores.length : 0;
    const history = warScores.slice(-15).reverse().map((s, i) => ({ war: `War ${i + 1}`, score: s }));
    res.json({ data: { averageWarScore: avg, warHistory: history }, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// 5. clan roster (full member list)
app.get('/api/roster', async (_req, res) => {
  const encodedTag = encodeURIComponent(CLAN_TAG);
  const { data, error } = await makeApiRequest(`/clans/${encodedTag}/members`);
  if (error) return res.status(500).json({ data: null, error });

  const roster = (data?.items || []).map(m => ({
    tag: m.tag,
    name: m.name,
    role: m.role?.replace('coLeader', 'Co-Leader') || 'Member',
    townHall: m.townHallLevel ?? 0,
    trophies: m.trophies ?? 0,
    donations: m.donations ?? 0,
    received: m.donationsReceived ?? 0
  }));
  res.json({ data: roster, error: null });
});

/* ---------- start ---------- */
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
