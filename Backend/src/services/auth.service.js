/* exports.register = async (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = { id: users.length + 1, email, password: hashedPassword };
  users.push(user);

  res.json({ message: "User registered" });
}; */

const Utenti = require("../models/Utenti");
const authRepo = require("../repositories/auth.repository");

exports.login = async (body) => {
  const { email, password } = body;

  const user = authRepo.
  if (!user) return res.status(404).json({ message: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Wrong password" });

  const token = jwt.sign({ id: user.id }, "SECRET_KEY", {
    expiresIn: "1h"
  });

  res.json({ token });
};