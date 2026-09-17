const express = require('express');
const fs = require('fs');
const { exec } = require('child_process');
const app = express();
const PORT = 4000;

app.use(express.json());

// VULNERABILIDAD #1: Path Traversal (Lectura insegura de archivos del sistema)
app.get('/api/read-file', (req, res) => {
  const fileName = req.query.name; // Ej: ../../../etc/passwd
  const filePath = `./files/${fileName}`;
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(400).send('Error al leer archivo');
    res.send(data);
  });
});

// VULNERABILIDAD #2: Inyección de Comandos OS (Command Injection)
app.get('/api/ping', (req, res) => {
  const host = req.query.host; // Ej: 127.0.0.1; cat /etc/passwd
  
  exec(`ping -c 1 ${host}`, (error, stdout, stderr) => {
    if (error) return res.status(500).send(stderr);
    res.send(stdout);
  });
});

// VULNERABILIDAD #3: Uso de eval() para cálculo de expresiones (Inyección de código)
app.post('/api/calculate', (req, res) => {
  const { formula } = req.body; // Ej: "process.exit()" o "require('fs').readdirSync('.')"
  try {
    const result = eval(formula);
    res.json({ result });
  } catch (err) {
    res.status(400).json({ error: 'Fórmula inválida' });
  }
});

app.listen(PORT, () => console.log(`Servidor iniciado en puerto ${PORT}`));