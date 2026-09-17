// =====================================================================
// server.js
// Ponto de entrada da aplicação Express.
// =====================================================================
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const interessadosRouter = require('./routes/interessados');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Middlewares ----------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Arquivos estáticos do frontend (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Rotas da API ----------
app.use('/api/interessados', interessadosRouter);

// Rota de verificação de saúde do servidor
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback: qualquer rota não-API devolve o index.html (SPA-friendly)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---------- Tratamento de erros genérico ----------
app.use((err, req, res, next) => {
  console.error('[Erro não tratado]', err);
  res.status(500).json({ sucesso: false, erros: ['Erro interno do servidor.'] });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
