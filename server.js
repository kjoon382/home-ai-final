const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
// Unified port setting for Vercel, Railway, and Render
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve static files from the root directory safely
app.use(express.static(__dirname));

app.post('/api/generate', async (req, res) => {
    try {
        const { image, style } = req.body;
        const apiKey = process.env.MODELSLAB_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'API Key is missing in environment variables.' });
        }

        const response = await axios.post('https://modelslab.com/api/v6/realtime/interior_render', {
            key: apiKey,
            init_image: image,
            prompt: (style || "modern") + " interior design, professional photography, high quality, 8k",
            model_id: "interior-design-xl",
            samples: 1
        });

        res.json(response.data);
    } catch (error) {
        console.error('API Error:', error.message);
        res.status(500).json({ error: 'AI generation failed: ' + error.message });
    }
});

// Always serve index.html for any frontend request
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Bind to 0.0.0.0 is crucial for external access on almost all hosting platforms
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Deployment successful! Server running on port ${port}`);
});
