// index.js
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json()); // Middleware to parse JSON

app.get('/', (req, res) => {
  res.send('Welcome to Express API');
});
// POST API Example
app.post('/user', (req, res) => {
  const user = req.body;
  res.status(201).json({ message: 'User created', user });
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
