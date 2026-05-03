const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Your CarAPIS API Key
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
        
        // TRY DIFFERENT AUTHENTICATION METHODS:
        
        // Method 1: Bearer Token (current)
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${CARAPIS_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        // If Method 1 fails with 403, uncomment and try Method 2:
        /*
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'x-api-key': CARAPIS_API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        */
        
        // If Method 2 fails, try Method 3 (API key as query param):
        /*
        const urlWithKey = new URL(url.toString());
        urlWithKey.searchParams.append('api_key', CARAPIS_API_KEY);
        const response = await fetch(urlWithKey.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        */
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ CarAPIS Error:', response.status, errorText);
            return res.status(response.status).json({ 
                error: `CarAPIS API Error: ${response.status}`,
                details: errorText,
                suggested_fix: "Check API key format or contact CarAPIS support"
            });
        }
        
        const data = await response.json();
        console.log('✅ Success! Fetched', data.count || data.results?.length || 0, 'vehicles');
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
        api_key_configured: true,
        api_key_prefix: CARAPIS_API_KEY.substring(0, 10) + '...'
    });
});

app.get('/', (req, res) => {
    res.json({
        name: 'AAB CarAPIS Proxy',
        status: 'running',
        endpoints: ['/health', '/api/vehicles']
    });
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ API Key configured: ${CARAPIS_API_KEY.substring(0, 10)}...`);
});
