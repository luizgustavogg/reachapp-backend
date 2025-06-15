import express from "express";
import dotenv from "dotenv";
import {
  getProfileInsights,
  getRecentPostsInsights,
} from "./services/instagramServices.js";
import {
  initAnalyticsClient,
  getReach,
  getByDate,
  getByCountry,
  getByDevice,
  getTrafficSources,
  getEngagement,
  getUserRetention,
} from "./services/websiteServices.js";

// Carrega variáveis locais (opcional em produção)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializa cliente GA4 via BASE64 (seguro e compatível com Vercel)
try {
  const base64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
  if (!base64) throw new Error("Variável GOOGLE_SERVICE_ACCOUNT_BASE64 não está definida");

  const json = Buffer.from(base64, "base64").toString("utf8");
  const credentials = JSON.parse(json);

  initAnalyticsClient(credentials);
  console.log("✅ Cliente GA4 inicializado com sucesso");
} catch (err) {
  console.error("❌ Erro ao carregar credenciais GA4:", err.message);
  process.exit(1);
}

// ROTAS INSTAGRAM
app.get("/insights/perfil", async (_req, res) => {
  try {
    const data = await getProfileInsights();
    res.json(data);
  } catch (err) {
    console.error("Erro /insights/perfil:", err.message);
    res.status(500).json({ error: "Erro ao buscar insights do perfil" });
  }
});

app.get("/insights/postagens", async (_req, res) => {
  try {
    const data = await getRecentPostsInsights();
    res.json(data);
  } catch (err) {
    console.error("Erro /insights/postagens:", err.message);
    res.status(500).json({ error: "Erro ao buscar insights das postagens" });
  }
});

// ROTAS ANALYTICS
app.get("/analytics/reach", async (_req, res) => {
  try {
    const data = await getReach();
    res.json(data);
  } catch (err) {
    console.error("Erro /analytics/reach:", err.message);
    res.status(500).json({ error: "Erro ao buscar alcance do site" });
  }
});

app.get("/analytics/by-date", async (req, res) => {
  const { startDate, endDate, type } = req.query;
  try {
    const data = await getByDate(startDate, endDate, type);
    res.json(data);
  } catch (err) {
    console.error("🔥 Erro /analytics/by-date:", err.message);
    res.status(500).json({ error: "Erro ao buscar dados por data" });
  }
});

app.get("/analytics/by-country", async (req, res) => {
  const { startDate, endDate, type } = req.query;
  try {
    const data = await getByCountry(startDate, endDate, type);
    res.json(data);
  } catch (err) {
    console.error("Erro /analytics/by-country:", err.message);
    res.status(500).json({ error: "Erro ao buscar dados por país" });
  }
});

app.get("/analytics/by-device", async (req, res) => {
  const { startDate, endDate, type } = req.query;
  try {
    const data = await getByDevice(startDate, endDate, type);
    res.json(data);
  } catch (err) {
    console.error("Erro /analytics/by-device:", err.message);
    res.status(500).json({ error: "Erro ao buscar dados por dispositivo" });
  }
});

app.get("/analytics/traffic-sources", async (req, res) => {
  const { type } = req.query;
  try {
    const data = await getTrafficSources(type);
    res.json(data);
  } catch (err) {
    console.error("Erro /analytics/traffic-sources:", err.message);
    res.status(500).json({ error: "Erro ao buscar fontes de tráfego" });
  }
});

app.get("/analytics/engagement", async (req, res) => {
  const { type } = req.query;
  try {
    const data = await getEngagement(type);
    res.json(data);
  } catch (err) {
    console.error("Erro /analytics/engagement:", err.message);
    res.status(500).json({ error: "Erro ao buscar dados de engajamento" });
  }
});

app.get("/analytics/user-retention", async (req, res) => {
  const { type } = req.query;
  try {
    const data = await getUserRetention(type);
    res.json(data);
  } catch (err) {
    console.error("Erro /analytics/user-retention:", err.message);
    res.status(500).json({ error: "Erro ao buscar dados de retenção" });
  }
});
console.log("🔍 GA4_PROPERTY_ID:", process.env.GA4_PROPERTY_ID);

// INICIA SERVIDOR
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
