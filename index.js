const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// ✅ ルート追加（GET /）
app.get('/', (req, res) => {
    res.send('WordPress Relay Server is running!');
});

app.post('/send-to-wp', async (req, res) => {
    const { title, content } = req.body;

    try {
        const response = await axios.post(
            'https://あなたのwordpressサイト.com/wp-json/wp/v2/posts',
            {
                title,
                content,
                status: 'publish'
            },
            {
                auth: {
                    username: 'your_wp_user',
                    password: 'your_application_password'
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({ result: 'success', wp_response: response.data });
    } catch (error) {
        res.status(500).json({ result: 'error', error: error.toString() });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log('中間サーバー起動中...');
});
