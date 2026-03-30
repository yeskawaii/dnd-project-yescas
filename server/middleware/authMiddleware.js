import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  let token = req.headers.authorization;

  // El token suele venir como "Bearer token123..."
  if (token && token.startsWith('Bearer')) {
    try {
      token = token.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded.id; 
      next();
    } catch (error) {
      res.status(401).json({ error: "Token no válido o expirado" });
    }
  } else {
    res.status(401).json({ error: "No hay token, acceso denegado" });
  }
};