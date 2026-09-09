const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const AI_BACKEND_URL = process.env.AI_BACKEND_URL || 'http://127.0.0.1:8000/predict';

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('audio_chunk', async (data) => {
    try {
      const formData = new FormData();
      formData.append('audio', data, {
        filename: 'chunk.wav',
        contentType: 'audio/wav',
      });

      const response = await axios.post(AI_BACKEND_URL, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

      socket.emit('prediction_result', response.data);
    } catch (error) {
      const errorMessage = error.response ? `HTTP ${error.response.status}` : error.message;
      console.error('Error contacting AI backend:', errorMessage);
      socket.emit('prediction_result', { error: `Backend connection failed: ${errorMessage}` });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Relay server listening on port ${PORT}`);
});

