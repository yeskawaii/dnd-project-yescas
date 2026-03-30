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

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`🚀 Server volando en el puerto ${PORT}`));