const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const CARAPIS_API_KEY = 'car_OBvs4gF1Z9_H0r16w6EsQaGzUzbU-FCgfIA4hdTFlv0';
const BASE_URL = 'https://api.carapis.com/apix/catalog_private/vehicles';

app.get('/api/vehicles', async (req, res) => {
    try {
        const queryParams = { ...req.query };
        
        if (queryParams.page_size) {
            queryParams.limit = queryParams.page_size;
            delete queryParams.page_size;
        }
        
        const url = new URL(BASE_URL);
        Object.keys(queryParams).forEach(key => {
            if (queryParams[key] && queryParams[key] !== '') {
                url.searchParams.append(key, queryParams[key]);
            }
        });
        
        console.log('📡 Fetching from CarAPIS:', url.toString());
        
        // Add browser-like headers to bypass Cloudflare
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${CARAPIS_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Referer': 'https://www.carapis.com/',
                'Origin': 'https://www.carapis.com'
            }
        });
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ CarAPIS Error:', response.status);
            
            // Check if it's Cloudflare challenge
            if (errorText.includes('Just a moment') || errorText.includes('cloudflare')) {
                return res.status(403).json({ 
                    error: 'Cloudflare protection detected',
                    message: 'CarAPIS API is blocking server requests. Contact CarAPIS support to whitelist your server IP.',
                    solution: 'Email support@carapis.com with your Render.com server IP'
                });
            }
            
            return res.status(response.status).json({ 
                error: `CarAPIS API Error: ${response.status}`,
                details: errorText.substring(0, 500)
            });
        }
        
        const data = await response.json();
        console.log('✅ Success!');
        res.json(data);
        
    } catch (error) {
        console.error('❌ Proxy Error:', error.message);
        res.status(500).json({ 
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        message: 'Backend is running, but CarAPIS may be blocking requests'
    });
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
