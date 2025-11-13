const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { MessagingResponse } = require('twilio').twiml;

const DB_PATH = path.join(__dirname, 'db.json');
function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')) || { gastos: [] };
  } catch (e) {
    return { gastos: [] };
  }
}
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

if (!fs.existsSync(DB_PATH)) writeDB({ gastos: [] });

app.get('/', (req, res) => res.send('Painel WhatsApp - backend ok'));

// rota gastos 
app.get('/gastos', (req, res) => {
  const db = readDB();
  res.json(db.gastos);
});

// webhook Twilio (WhatsApp Sandbox)
app.post('/incoming', (req, res) => {
  const twiml = new MessagingResponse();
  const mensagem = (req.body.Body || '').toLowerCase().trim();

  console.log('---------- NOVA MENSAGEM ----------');
  console.log('From:', req.body.From);
  console.log('To:', req.body.To);
  console.log('Body:', req.body.Body);
  console.log('----------------------------------');

  if (mensagem.startsWith('gastei')) {
    const regex = /gastei\s+(\d+[\,\.]?\d*)\s*(.*)/i;
    const match = mensagem.match(regex);
    if (match) {
      let raw = match[1].replace(',', '.');
      const valor = parseFloat(raw);
      const descricao = (match[2] || 'despesa').trim();

      const db = readDB();
      const registro = {
        id: Date.now(),
        data: new Date().toISOString(),
        valor: Number(valor.toFixed(2)),
        descricao,
        from: req.body.From || null
      };
      db.gastos.unshift(registro);
      writeDB(db);

      const resposta = `✅ Registrado: R$${registro.valor} em ${registro.descricao}`;
      twiml.message(resposta);
      console.log('Resposta gerada:', resposta);
    } else {
      const resposta = 'Não entendi. Use: gastei 20 lanche';
      twiml.message(resposta);
      console.log('Resposta gerada:', resposta);
    }
  } else if (mensagem === 'resumo') {
    const db = readDB();
    if (db.gastos.length === 0) {
      const resposta = '📊 Nenhum gasto registrado ainda.';
      twiml.message(resposta);
      console.log('Resposta gerada:', resposta);
    } else {
      const total = db.gastos.reduce((s, g) => s + Number(g.valor), 0);
      const resposta = `📊 Seu total registrado: R$${total.toFixed(2)}`;
      twiml.message(resposta);
      console.log('Resposta gerada:', resposta);
    }
  } else {
    const resposta = 'Comandos disponíveis:\\n👉 gastei 20 lanche\\n👉 resumo';
    twiml.message(resposta);
    console.log('Resposta gerada:', resposta);
  }

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
