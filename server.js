const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Allow CORS for Vercel requests
app.use(cors());
app.use(express.json());

// Root test route
app.get('/', (req, res) => {
    res.send('DEEP SMS PANEL Backend is Running Live!');
});

// ==========================================
// BACKEND API PROXY (Solves HTTP/CORS Blocks)
// ==========================================
app.get('/api/live-traffic', async (req, res) => {
    const MASTER_API_LINK = "http://51.77.216.195/crapi/konek/viewstats?token=SlBXRzRSQmdhd3l4gYCLRouA2";
    
    try {
        const response = await fetch(MASTER_API_LINK);
        if (!response.ok) {
            throw new Error(`Upstream API Error: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Fetch Error:", error.message);
        res.status(500).json({ status: "error", message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
