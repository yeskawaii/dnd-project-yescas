import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Importas tus rutas
import characterRoutes from './routes/characters.js';
import authRoutes from './routes/auth.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Conexión
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🔥 ¡CONECTADO A MONGO ATLAS, YESCAS!'))
  .catch(err => console.error('❌ ERROR:', err));

// REGISTRO DE RUTAS
app.use('/api/auth', authRoutes);
app.use('/api/character', characterRoutes);

app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  if (dbStatus === 1) {
    res.status(200).send('OK - DB Alive 🔥');
  } else {
    res.status(503).send('Error - DB Down 💀');
  }
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`🚀 Server volando en el puerto ${PORT}`));