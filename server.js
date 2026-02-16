require('dotenv').config();
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

        const response = await axios.post('https://modelslab.com/api/v6/interior/make', {
            key: apiKey,
            init_image: image,
            prompt: (style || "modern") + " interior design, professional photography, high quality, 8k, realistic, highly detailed",
            negative_prompt: "blurry, low quality, distorted, extra limbs, ugly, messy",
            num_inference_steps: 30,
            guidance_scale: 7.5,
            strength: 7, // 1-10 scale based on documentation
            samples: 1
        });

        console.log('AI API Response Status:', response.data.status);

        if (response.data.status === 'error' || response.data.status === 'failed') {
            console.error('AI API Error Details:', response.data);
            return res.status(400).json({
                error: response.data.message || response.data.error || 'AI service error',
                details: response.data
            });
        }

        res.json(response.data);
    } catch (error) {
        console.error('Server/API Error:', error.response ? error.response.data : error.message);
        const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
        res.status(500).json({ error: 'AI generation failed: ' + errorMessage });
    }
});

// Fallback to index.html (Simplified for compatibility)
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Bind to 0.0.0.0 is crucial for external access on almost all hosting platforms
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Deployment successful! Server running on port ${port}`);
});
