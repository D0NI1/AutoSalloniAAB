const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const CARAPIS_API_KEY = 'car_MmD8D4AHfaMV5IwAu7cHghc7rUos0P0Np23h6ALkL08';
const BASE_URL = 'https://api.carapis.com/apix/catalog_private/vehicles';

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        message: 'Backend is running'
    });
});

// Main vehicles endpoint
app.get('/api/vehicles', async (req, res) => {
    try {
        console.log('📡 Request received with params:', req.query);
        
        // Build URL with all query parameters
        const params = new URLSearchParams();
        
        // Copy all query parameters
        Object.keys(req.query).forEach(key => {
            if (req.query[key] && req.query[key] !== '') {
                params.append(key, req.query[key]);
            }
        });
        
        // Set default page_size if not provided
        if (!params.has('page_size')) {
            params.append('page_size', '20');
        }
        
        const url = `${BASE_URL}?${params.toString()}`;
        console.log('📡 Fetching from CarAPIS:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${CARAPIS_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000 // 30 second timeout
        });
        
        console.log('📡 CarAPIS response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ CarAPIS Error:', response.status, errorText.substring(0, 500));
            return res.status(response.status).json({ 
                error: `CarAPIS API returned ${response.status}`,
                details: errorText.substring(0, 200)
            });
        }
        
        const data = await response.json();
        console.log('✅ Success! Count:', data.count || data.results?.length || 0);
        
        res.json(data);
        
    } catch (error) {
        console.error('❌ Server Error:', error.message);
        res.status(500).json({ 
            error: 'Internal Server Error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'CarAPIS Backend Proxy',
        status: 'running',
        endpoints: {
            health: '/health',
            vehicles: '/api/vehicles?brand=Hyundai&page=1',
            test: '/api/test'
        }
    });
});

// Simple test endpoint with mock data
app.get('/api/test', (req, res) => {
    res.json({
        message: 'API is working!',
        timestamp: new Date().toISOString(),
        sampleData: [
            { brand: "Hyundai", model: "Tucson", year: 2021, price: 23400 },
            { brand: "BMW", model: "3 Series", year: 2019, price: 28900 },
            { brand: "Mercedes", model: "C-Class", year: 2020, price: 32500 }
        ]
    });
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📍 Test endpoint: http://localhost:${PORT}/api/test`);
});
