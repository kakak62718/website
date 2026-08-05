const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve the frontend files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// BACKEND API PROXY (Solves HTTP/CORS Blocks)
// ==========================================
app.get('/api/live-traffic', async (req, res) => {
    const MASTER_API_LINK = "http://51.77.216.195/crapi/konek/viewstats?token=SlBXRzRSQmdhd3l4gYCLRouA2";
    
    try {
        // The server fetches the data directly, bypassing browser restrictions
        const response = await fetch(MASTER_API_LINK);
        if (!response.ok) {
            throw new Error(`Upstream API Error: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data); // Send clean, secure JSON back to the frontend
    } catch (error) {
        console.error("Fetch Error:", error.message);
        res.status(500).json({ status: "error", message: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
