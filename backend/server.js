import express from 'express';
import axios from 'axios';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3001;
const API_TOKEN = process.env.CLASH_API_TOKEN;
const CLAN_TAG = "#2G8LRGU2Q";

app.use(cors()); // Allow your frontend to call this backend

const cocApi = axios.create({
    baseURL: 'https://api.clashofclans.com/v1',
    headers: { 'Authorization': `Bearer ${API_TOKEN}` }
});

const makeApiRequest = async (endpoint) => {
    try {
        const response = await cocApi.get(endpoint);
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: `API Error: Status ${error.response?.status}` };
    }
};

app.get('/api/clan-info', async (req, res) => {
    const encodedTag = CLAN_TAG.replace('#', '%23');
    const result = await makeApiRequest(`/clans/${encodedTag}`);
    res.json(result);
});

app.get('/api/war-log', async (req, res) => {
    const encodedTag = CLAN_TAG.replace('#', '%23');
    const result = await makeApiRequest(`/clans/${encodedTag}/warlog`);
    res.json(result);
});

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
