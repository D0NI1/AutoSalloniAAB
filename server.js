const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = 'car_OBvs4gF1Z9_H0r16w6EsQaGzUzbU-FCgfIA4hdTFlv0';

// Use the endpoint you asked about
app.get('/api/vehicles', async (req, res) => {
    try {
        const { data } = await axios({
            method: "get",
            url: "https://api.carapis.com/apix/catalog_private/vehicles",
            params: {
                page: req.query.page || 1,
                page_size: req.query.page_size || 100,
                available_only: req.query.available_only || false,
                ...req.query
            },
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Accept": "application/json"
            }
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000);
