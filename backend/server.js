import express from 'express';
import axios from 'axios';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3001;
const API_TOKEN = process.env.CLASH_API_TOKEN;
const CLAN_TAG = "#2G8LRGU2Q";

app.use(cors());

const cocApi = axios.create({
    baseURL: 'https://api.clashofclans.com/v1',
    headers: { 'Authorization': `Bearer ${API_TOKEN}` }
});

const makeApiRequest = async (endpoint) => {
    try {
        const response = await cocApi.get(endpoint);
        return { data: response.data, error: null };
    } catch (error) {
        const status = error.response?.status;
        return { data: null, error: `API Error: Status ${status}` };
    }
};

const calculateAttackScore = (attack, attacker_th, team_size, opponent_map) => {
    const star_power = {3: 207, 2: 89, 1: 32, 0: 0}[attack.stars] || 0;
    const destruction_factor = 1 + (attack.destructionPercentage / 250);
    const defender_details = opponent_map.get(attack.defenderTag);
    if (!defender_details) return 0;
    const defender_th = defender_details.townhallLevel || attacker_th;
    const th_differential = attacker_th - defender_th;
    const th_modifier = Math.pow(1.6, -th_differential);
    const map_rank = defender_details.mapPosition || team_size;
    let map_modifier = 1.0;
    if (map_rank <= team_size / 3) map_modifier = 1.15;
    else if (map_rank > (team_size / 3) * 2) map_modifier = 0.85;
    const first_hit_bonus = (attack.order === 1) ? (team_size - map_rank) * 0.5 : 0;
    return ((star_power * destruction_factor) * (th_modifier * map_modifier)) + first_hit_bonus;
};

// --- API ROUTES ---

app.get('/api/clan-info', async (req, res) => {
    const encodedTag = CLAN_TAG.replace('#', '%23');
    const result = await makeApiRequest(`/clans/${encodedTag}`);
    res.json(result);
});

app.get('/api/player-performance/:playerTag', async (req, res) => {
    // THE FIX IS HERE: The playerTag from the URL already includes the '#'.
    // We no longer add an extra one.
    const playerTagWithHash = `#${req.params.playerTag}`;
    const encodedClanTag = CLAN_TAG.replace('#', '%23');
    
    try {
        const { data: warLog, error } = await makeApiRequest(`/clans/${encodedClanTag}/warlog?limit=50`);
        if (error) throw new Error(error);

        const war_scores = [];
        for (const war of (warLog?.items || [])) {
            if (war.state !== 'warEnded' || !war.clan?.members) continue;

            const member_in_war = war.clan.members.find(m => m.tag === playerTagWithHash);
            if (member_in_war && member_in_war.attacks) {
                const opponent_map = new Map((war.opponent?.members || []).map(m => [m.tag, m]));
                const team_size = war.teamSize || 1;
                const attacker_th = member_in_war.townhallLevel;
                const wps = member_in_war.attacks.map(att => calculateAttackScore(att, attacker_th, team_size, opponent_map)).reduce((a, b) => a + b, 0);
                war_scores.push(wps);
            }
        }

        const total_score = war_scores.reduce((a, b) => a + b, 0);
        const averageWarScore = war_scores.length > 0 ? total_score / war_scores.length : 0;
        const warHistory = war_scores.slice(-15).reverse().map((score, i) => ({ war: `War ${i + 1}`, score }));

        res.json({ data: { averageWarScore, warHistory }, error: null });

    } catch (error) {
        res.status(500).json({ data: null, error: `Backend Error: ${error.message}` });
    }
});

app.get('/api/current-war', async (req, res) => {
    const encodedTag = CLAN_TAG.replace('#', '%23');
    const result = await makeApiRequest(`/clans/${encodedTag}/currentwar`);
    res.json(result);
});

app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
