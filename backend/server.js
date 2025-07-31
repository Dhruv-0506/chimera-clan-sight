import express from 'express';
import axios from 'axios';
import cors from 'cors';
import 'dotenv/config';

// --- VERSION & DEBUG ---
const BACKEND_VERSION = `2024-07-31-v1.0`; // Update this manually when you make changes
console.log(`--- Chimera Backend Starting ---`);
console.log(`--- VERSION: ${BACKEND_VERSION} ---`);
console.log(`--------------------------------`);

// ----------------------------------
// --- SERVER & API CONFIGURATION ---
// ----------------------------------
const app = express();
const PORT = process.env.PORT || 3001;
const API_TOKEN = process.env.CLASH_API_TOKEN;
const CLAN_TAG = "#2G8LRGU2Q";


const allowedOrigins = [
  'http://localhost:3000',
  'https://chimera-clan-sight-1.onrender.com'
];

// --- CORS DEBUGGING ---
app.use(cors({
  origin: function (origin, callback) {
    // Log every single CORS check
    console.log(`[CORS] Request received from origin: ${origin}`);
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      console.log(`[CORS] Origin allowed.`);
      callback(null, true);
    } else {
      console.error(`[CORS] Origin DENIED: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

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
        console.error(`[Clash API Error] Endpoint: ${endpoint}, Status: ${status}`);
        if (status === 404) {
            return { data: null, error: "Required data not found (e.g., no active war or public war log disabled)." };
        }
        return { data: null, error: `Clash of Clans API Error: Status ${status}` };
    }
};

// ... (Your scoring logic functions remain unchanged) ...
const calculateAttackScore = (attack, attacker_th, team_size, opponent_map) => { /* ... no changes needed ... */ };
const calculateHistoricalPerformance = (clan_members, war_log) => { /* ... no changes needed ... */ };
const calculateArchiveStats = (war_list) => { /* ... no changes needed ... */ };


// -------------------------------------
// --- API ROUTES WITH DEBUGGING ---
// -------------------------------------

app.get('/api/player-roster', async (req, res) => {
    console.log(`[API] Received request for /api/player-roster`);
    const encodedTag = CLAN_TAG.replace('#', '%23');
    try {
        const [clanRes, warLogRes] = await Promise.all([
            cocApi.get(`/clans/${encodedTag}`),
            cocApi.get(`/clans/${encodedTag}/warlog`)
        ]);
        const final_data = calculateHistoricalPerformance(clanRes.data.memberList, warLogRes.data);
        res.json({ data: final_data, error: null });
    } catch (error) {
        console.error(`[API Error] in /api/player-roster: ${error.message}`);
        res.status(500).json({ data: null, error: `Backend Error: ${error.message}` });
    }
});

app.get('/api/war-log-stats', async (req, res) => {
    console.log(`[API] Received request for /api/war-log-stats`);
    const encodedTag = CLAN_TAG.replace('#', '%23');
    const { data, error } = await makeApiRequest(`/clans/${encodedTag}/warlog`);
    if (error) return res.status(500).json({ data: null, error });
    
    // ... (rest of the logic)
    const regular_wars = (data.items || []).filter(war => war.clan.attacks !== undefined);
    const regular_stats = calculateArchiveStats(regular_wars);
    const cwl_wars = (data.items || []).filter(war => war.clan.attacks === undefined);
    const cwl_stats = calculateArchiveStats(cwl_wars);
    res.json({ data: { regular: { wars: regular_wars, stats: regular_stats }, cwl: { wars: cwl_wars, stats: cwl_stats } }, error: null });
});

app.get('/api/current-war', async (req, res) => {
    console.log(`[API] Received request for /api/current-war`);
    const encodedTag = CLAN_TAG.replace('#', '%23');
    const result = await makeApiRequest(`/clans/${encodedTag}/currentwar`);
    res.json(result);
});

app.get('/api/cwl', async (req, res) => {
    console.log(`[API] Received request for /api/cwl`);
    const encodedTag = CLAN_TAG.replace('#', '%23');
    const result = await makeApiRequest(`/clans/${encodedTag}/currentwar/leaguegroup`);
    res.json(result);
});

// --- SERVER INITIALIZATION ---
app.listen(PORT, () => {
    console.log(`Server with version ${BACKEND_VERSION} is running on port ${PORT}`);
});
