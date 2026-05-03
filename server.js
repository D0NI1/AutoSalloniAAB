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
        const url = `${BASE_URL}?${new URLSearchParams(req.query)}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${CARAPIS_API_KEY}` }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
