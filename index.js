const express = require('express');
const axios = require('axios');
const http = require('http');
const WebSocket = require('ws');
const app = express();

// ✅ CORSヘッダーを設定（最上部に追加）
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // ← 必要に応じて特定のURLに制限可
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use(express.json());

// HTTPサーバーとWSサーバーを統合
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];

// WebSocket接続処理
wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    clients.push(ws);

    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
        console.log('WebSocket client disconnected');
    });
});

// WordPress → 中継サーバへPOSTされた時
app.post('/send-to-wp', async (req, res) => {
    const { title, content } = req.body;

    // 🔔 WebSocketクライアントにブロードキャスト
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ title, content }));
        }
    });

    res.json({ result: 'relayed' });
});

// 動作確認ルート
app.get('/', (req, res) => {
    res.send('WebSocket relay server is running!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
