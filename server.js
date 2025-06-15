import express from 'express';
import dotenv from 'dotenv';
import {
  getProfileInsights,
  getRecentPostsInsights
} from './services/instagramServices.js';
import {
  getReach,
  getByDate,
  getByCountry,
  getByDevice
} from './services/websiteServices.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/insights/perfil', async (_req, res) => {
  try {
    const data = await getProfileInsights();
    res.json(data);
  } catch (err) {
    console.error('Erro /insights/perfil:', err.message);
    res.status(500).json({ error: 'Erro ao buscar insights do perfil' });
  }
});

app.get('/insights/postagens', async (_req, res) => {
  try {
    const data = await getRecentPostsInsights();
    res.json(data);
  } catch (err) {
    console.error('Erro /insights/postagens:', err.message);
    res.status(500).json({ error: 'Erro ao buscar insights das postagens' });
  }
});

app.get('/analytics/reach', async (_req, res) => {
  try {
    const data = await getReach();
    res.json(data);
  } catch (err) {
    console.error('Erro /analytics/reach:', err.message);
    res.status(500).json({ error: 'Erro ao buscar alcance do site' });
  }
});

app.get('/analytics/by-date', async (req, res) => {
  const { startDate, endDate, type } = req.query;
  try {
    const data = await getByDate(startDate, endDate, type);
    res.json(data);
  } catch (err) {
    console.error('Erro /analytics/by-date:', err.message);
    res.status(500).json({ error: 'Erro ao buscar dados por data' });
  }
});

app.get('/analytics/by-country', async (req, res) => {
  const { startDate, endDate, type } = req.query;
  try {
    const data = await getByCountry(startDate, endDate, type);
    res.json(data);
  } catch (err) {
    console.error('Erro /analytics/by-country:', err.message);
    res.status(500).json({ error: 'Erro ao buscar dados por país' });
  }
});

app.get('/analytics/by-device', async (req, res) => {
  const { startDate, endDate, type } = req.query;
  try {
    const data = await getByDevice(startDate, endDate, type);
    res.json(data);
  } catch (err) {
    console.error('Erro /analytics/by-device:', err.message);
    res.status(500).json({ error: 'Erro ao buscar dados por dispositivo' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});