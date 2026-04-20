const jwt = require('jsonwebtoken');

const ACCESS_TOK = process.env.JWT_SECRET || 'dev_access_secret';

function verifyToken(req, res, next) {
  // 1. Legge l'header Authorization
  // Formato atteso: "Authorization: Bearer eyJhbGci..."
  const authHeader = req.headers['authorization'];

  // 2. Estrae il token dalla stringa "Bearer <token>"
  // authHeader?.split(' ')[1] è equivalente a:
  // authHeader ? authHeader.split(' ')[1] : undefined
  const token = authHeader?.split(' ')[1];

  // 3. Se il token è assente, blocca la richiesta
  if (!token) {
    return res.status(401).json({ message: 'Token mancante' });
  }

  try {
    // 4. Verifica la firma e la scadenza del token
    // jwt.verify lancia eccezione se: firma invalida, token scaduto, token malformato
    // Se valido, restituisce il payload decodificato: { id, userid, iat, exp }
    const decoded = jwt.verify(token, ACCESS_TOK);

    // 5. Salva il payload in req.user, accessibile nei controller successivi
    // Es: req.user.id → id dell'utente loggato
    req.user = decoded;

    // 6. Chiama il prossimo middleware/controller nella catena
    next();
  } catch {
    // jwt.verify ha lanciato: token scaduto, firma invalida, token malformato
    return res.status(401).json({ message: 'Token non valido o scaduto' });
  }
}

module.exports = { verifyToken };