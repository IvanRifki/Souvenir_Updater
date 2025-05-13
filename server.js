require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Environment variables dengan fallback
const FETCH_URL = process.env.FETCH_URL || 'https://script.google.com/macros/s/AKfycbx4REuswIcUDa7eDOGizsHDgRyyGLxs6PMMvm0wGKnCTQ5Z-zX9tzFA63XKn083fY6U/exec';
const UPDATE_URL = process.env.UPDATE_URL || 'https://script.google.com/macros/s/AKfycbx4REuswIcUDa7eDOGizsHDgRyyGLxs6PMMvm0wGKnCTQ5Z-zX9tzFA63XKn083fY6U/exec';

// Endpoint untuk mendapatkan data tamu
app.get('/api/guests', async (req, res) => {
  try {
    const timestamp = Date.now(); // hindari cache
    const response = await axios.get(FETCH_URL, {
      params: {
        action: 'getGuests',
        t: timestamp
      },
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    if (!response.data) {
      throw new Error('Empty response from Google Script');
    }

    console.log('Response from Google Script:', response.data);

    res.json(response.data);
  } catch (error) {
    console.error('Full error:', {
      message: error.message,
      config: error.config,
      response: error.response?.data,
      stack: error.stack
    });
    
    res.status(500).json({ 
      error: 'Failed to fetch data',
      details: error.message,
      url: error.config?.url,
      status: error.response?.status
    });
  }
});

// Endpoint untuk update status souvenir
app.post('/api/update-souvenir', async (req, res) => {
  try {
    let { row, status } = req.body;
    
    // Convert row to number
    row = Number(row);
    
    // Validasi dasar
    if (isNaN(row)) {
      return res.status(400).json({ 
        error: 'Invalid input',
        details: 'Row must be a number' 
      });
    }

    // Normalisasi status
    const normalizedStatus = (status) => {
      const statusLower = status.toLowerCase().trim();
      
      if (statusLower === 'sudah diambil') {
        return 'Sudah diambil';
      } else if (statusLower === 'belum diambil') {
        return 'Belum diambil';
      } else {
        return '-'; // Default value untuk status tidak valid
      }
    };

    const finalStatus = normalizedStatus(status);

    // Kirim ke Google Apps Script
    const response = await axios.post(UPDATE_URL, {
      row: row + 1, // +1 jika header dihitung sebagai row 1
      status: finalStatus
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    res.json({ 
      success: true,
      message: response.data,
      updatedData: {
        row,
        originalStatus: status,
        finalStatus
      }
    });
    
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      error: 'Failed to update souvenir status',
      details: error.message,
      suggestion: 'Check server logs for more details'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Fetch URL: ${FETCH_URL}`);
  console.log(`Update URL: ${UPDATE_URL}`);
});