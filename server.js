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

// Proxy endpoint for vehicles
app.get('/api/vehicles', async (req, res) => {
    try {
        // Get all query parameters
        const queryParams = { ...req.query };
        
        // Remove page_size as CarAPIS might use different param
        // Let's use limit instead
        if (queryParams.page_size) {
            queryParams.limit = queryParams.page_size;
            delete queryParams.page_size;
        }
        
        // Build URL with parameters
        const url = new URL(BASE_URL);
        Object.keys(queryParams).forEach(key => {
            if (queryParams[key] && queryParams[key] !== '') {
                url.searchParams.append(key, queryParams[key]);
            }
        });
        
        console.log('📡 Fetching from CarAPIS:', url.toString());
        
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${CARAPIS_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ CarAPIS Error:', response.status, errorText);
            return res.status(response.status).json({ 
                error: `CarAPIS API Error: ${response.status}`,
                details: errorText 
            });
        }
        
        const data = await response.json();
        console.log('✅ Successfully fetched', data.count || data.results?.length || 0, 'vehicles');
        res.json(data);
        
    } catch (error) {
        console.error('❌ Proxy Error:', error.message);
        res.status(500).json({ 
            error: 'Internal Server Error',
            message: error.message,
            stack: error.stack
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        api_configured: true
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'AAB CarAPIS Proxy',
        status: 'running',
        endpoints: ['/health', '/api/vehicles'],
        documentation: 'Use /api/vehicles?brand=Hyundai&min_year=2018'
    });
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Health check: http://localhost:${PORT}/health`);
    console.log(`✅ API endpoint: http://localhost:${PORT}/api/vehicles`);
});
