// index.js
const express = require('express');
const bodyParser = require('body-parser');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

//1 Endpoint de login (vulnerável a SQL Injection)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
// a partir daqui não deixamos o password exposto 
  const user = await User.findOne({ where: { username } });
  if (user && user.password === password) {
    res.json({ message: 'Login successful', user });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

//2 Endpoint de listagem de usuários (expondo dados sensíveis)
app.get('/users', async (req, res) => {
  //Era desnecessário passar o atributo 'password' para a consulta
  const users = await User.findAll({ attributes: ['id', 'username'] });
  res.json(users);
});

//3 Endpoint de detalhe do usuário logado (expondo senha)
app.get('/profile', async (req, res) => {
  const { username } = req.query;
  const user = await User.findOne({ where: { username: username ?? null } });
  if (user) {
    // antes de retornar ao usuário iremos deletar a senha do json retornado
    delete user.password;
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
