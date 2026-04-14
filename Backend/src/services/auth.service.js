/* exports.register = async (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = { id: users.length + 1, email, password: hashedPassword };
  users.push(user);

  res.json({ message: "User registered" });
}; */

const Utenti = require("../models/Utenti");
const authRepo = require("../repository/auth.repository");

exports.login = async (body) => {
  const { id, password } = body;

  const user = await authRepo.getUtente(id, password);
  if (!user) return { message: "User not found" };



  res.json({user});
};