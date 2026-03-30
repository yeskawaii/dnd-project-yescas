import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// REGISTRO: /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. ¿Ya existe el usuario?
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ error: "Ese nombre ya lo tiene otro aventurero" });

    // 2. Encriptar contraseña (Hash)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Guardar
    const newUser = await User.create({
      username,
      password: hashedPassword
    });

    res.status(201).json({ message: "¡Usuario creado! Ya puedes entrar a la taberna." });
  } catch (err) {
    res.status(500).json({ error: "Error en el servidor al registrar" });
  }
});

// LOGIN: /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Buscar al usuario
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: "Credenciales inválidas (Usuario no existe)" });

    // 2. Comparar contraseñas
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Credenciales inválidas (Password mal)" });

    // 3. Generar el Token (JWT)
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id, username: user.username }
    });
  } catch (err) {
    res.status(500).json({ error: "Error en el servidor al loguear" });
  }
});

export default router;