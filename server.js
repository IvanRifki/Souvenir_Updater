require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Environment variables
const FETCH_URL = process.env.FETCH_URL || 'https://script.google.com/macros/s/AKfycbzEqrG3i8tW0EZ2802Im878byeDyvpa_oRFU3H80FBlQLagDVnH_3KqWvQuWZo6lZgU/exec';
const UPDATE_URL = process.env.UPDATE_URL || 'https://script.google.com/macros/s/AKfycbxjqgttAuRUVoHg3IJ4FiQXzwVIExEhICvIi_04hBZIOIcms53GTl-s_VZCNnuKIrrZ/exec';

// Endpoint untuk mendapatkan data tamu
app.get('/api/guests', async (req, res) => {
  try {
    const response = await axios.get(FETCH_URL);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching guest data:', error);
    res.status(500).json({ error: 'Failed to fetch guest data' });
  }
});

// Endpoint untuk update status souvenir
app.post('/api/update-souvenir', async (req, res) => {
  try {
    const { row, status } = req.body;
    
    if (!row || !status) {
      return res.status(400).json({ error: 'Row and status are required' });
    }

    const response = await axios.post(UPDATE_URL, {
      row,
      status
    });

    res.json({ message: response.data });
  } catch (error) {
    console.error('Error updating souvenir status:', error);
    res.status(500).json({ error: 'Failed to update souvenir status' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});