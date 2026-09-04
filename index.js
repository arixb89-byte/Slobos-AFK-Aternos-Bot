const express = require('express');
const mineflayer = require('mineflayer');
const path = require('path');

// ==========================================
// ⚙️ INSERISCI QUI I DATI DEL TUO SERVER
// ==========================================
const SERVER_IP = "SosticeMC.aternos.me"; // es: mio-server.aternos.me
const SERVER_PORT = 41807;                   // es: 27586 (senza virgolette)
const BOT_USERNAME = "Giginoilgoat";           // Nome del bot in gioco
// ==========================================

const app = express();
const PORT = process.env.PORT || 3000;

let bot = null;
let logs = [];

function addLog(msg) {
  const timestamp = new Date().toLocaleTimeString();
  const formattedMsg = `[${timestamp}] ${msg}`;
  console.log(formattedMsg);
  logs.push(formattedMsg);
  if (logs.length > 100) logs.shift();
}

function startBot() {
  addLog(`Tentativo di connessione a ${SERVER_IP}:${SERVER_PORT}...`);
  
  bot = mineflayer.createBot({
    host: SosticeMC.aternos.me,
    port: 41807,
    username: Giginoilgoat,
    auth: 'offline',
    version: false,
    hideErrors: false,
    checkTimeoutInterval: 60000
  });

  bot.on('spawn', () => {
    addLog(`✅ Bot entrato nel server come ${bot.username}!`);
    
    // Anti-AFK semplice: muove la testa ogni 30 secondi
    setInterval(() => {
      if (bot) {
        const yaw = Math.random() * Math.PI * 2;
        const pitch = (Math.random() - 0.5) * Math.PI;
        bot.look(yaw, pitch, true);
        bot.swingArm('right');
      }
    }, 30000);
  });

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    addLog(`[CHAT] <${username}> ${message}`);
  });

  bot.on('kicked', (reason) => {
    addLog(`⚠️ Bot espulso: ${reason}`);
  });

  bot.on('error', (err) => {
    addLog(`❌ Errore bot: ${err.message}`);
  });

  bot.on('end', () => {
    addLog('🔌 Bot disconnesso. Riconnessione tra 10 secondi...');
    setTimeout(startBot, 10000);
  });
}

// Web Server Express
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Bot AFK Dashboard</title></head>
      <body style="font-family: sans-serif; padding: 20px; background: #121212; color: #fff;">
        <h1>🤖 Bot AFK Minecraft</h1>
        <p><strong>Server Target:</strong> ${SERVER_IP}:${SERVER_PORT}</p>
        <p><strong>Stato Bot:</strong> ${bot && bot.entity ? '🟢 Online' : '🔴 Offline'}</p>
        <h2>Ultime attività (Logs):</h2>
        <div style="background: #000; padding: 15px; border-radius: 5px; height: 300px; overflow-y: scroll; font-family: monospace;">
          ${logs.map(l => `<div>${l}</div>`).join('')}
        </div>
      </body>
    </html>
  `);
});

app.get('/logs', (req, res) => res.json(logs));
app.get('/health', (req, res) => res.send('OK'));

app.listen(PORT, () => {
  addLog(`Server Web avviato sulla porta ${PORT}`);
  startBot();
});
