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
        if (status === 404) {
            return { data: null, error: "Required data not found (e.g., no active war or public war log disabled)." };
        }
        return { data: null, error: `Clash of Clans API Error: Status ${status}` };
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

const calculateHistoricalPerformance = (clan_members, war_log) => {
    const player_map = new Map(clan_members.map(m => [m.tag, { ...m, war_scores: [] }]));

    for (const war of (war_log.items || [])) {
        if (war.state !== 'warEnded' || !war.clan?.members) continue;
        const opponent_map = new Map((war.opponent?.members || []).map(m => [m.tag, m]));
        const team_size = war.teamSize || 1;
        for (const member_in_war of war.clan.members) {
            if (player_map.has(member_in_war.tag) && member_in_war.attacks) {
                const player_data = player_map.get(member_in_war.tag);
                const attacker_th = player_data.townHallLevel;
                const wps = member_in_war.attacks
                    .map(att => calculateAttackScore(att, attacker_th, team_size, opponent_map))
                    .reduce((a, b) => a + b, 0);
                player_map.get(member_in_war.tag).war_scores.push(wps);
            }
        }
    }

    return Array.from(player_map.values()).map(data => {
        const total_score = data.war_scores.reduce((a, b) => a + b, 0);
        const avg_wps = data.war_scores.length > 0 ? total_score / data.war_scores.length : 0;
        return {
            ...data,
            averageWarScore: avg_wps,
            warHistory: data.war_scores.slice(-15).reverse().map((score, i) => ({ war: `War ${i + 1}`, score }))
        };
    });
};

app.get('/api/player-roster', async (req, res) => {
    const encodedTag = CLAN_TAG.replace('#', '%23');
    try {
        const [clanRes, warLogRes] = await Promise.all([
            cocApi.get(`/clans/${encodedTag}`),
            cocApi.get(`/clans/${encodedTag}/warlog`)
        ]);
        const final_data = calculateHistoricalPerformance(clanRes.data.memberList, warLogRes.data);
        res.json({ data: final_data, error: null });
    } catch (error) {
        res.status(500).json({ data: null, error: `Backend API Error: ${error.message}` });
    }
});

app.get('/api/current-war', async (req, res) => {
    const encodedTag = CLAN_TAG.replace('#', '%23');
    const result = await makeApiRequest(`/clans/${encodedTag}/currentwar`);
    res.json(result);
});

app.get('/api/war-log', async (req, res) => {
    const encodedTag = CLAN_TAG.replace('#', '%23');
    const result = await makeApiRequest(`/clans/${encodedTag}/warlog`);
    res.json(result);
});

app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
