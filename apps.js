const express = require('express');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const app = express();
const PORT = 4000;

app.use(express.json());

// REMEDIACIÓN #1: Path Traversal (Validación y sanitización de rutas)
app.get('/api/read-file', (req, res) => {
  const fileName = req.query.name;
  if (!fileName || typeof fileName !== 'string') {
    return res.status(400).send('Nombre de archivo inválido');
  }

  // Se sanitiza el nombre para prevenir navegación entre directorios (../)
  const safeFileName = path.basename(fileName);
  const safePath = path.join(__dirname, 'files', safeFileName);

  fs.readFile(safePath, 'utf8', (err, data) => {
    if (err) return res.status(400).send('Error al leer archivo o archivo no encontrado');
    res.send(data);
  });
});

// REMEDIACIÓN #2: Command Injection (Uso de execFile sin invocar un shell)
app.get('/api/ping', (req, res) => {
  const host = req.query.host;
  
  // Validación estricta de formato IP / Dominio
  const isValidHost = /^([a-zA-Z0-9.-]+)$/.test(host);
  if (!host || !isValidHost) {
    return res.status(400).send('Host inválido');
  }

  // execFile pasa los argumentos como array, evitando la inyección de comandos por consola
  execFile('ping', ['-c', '1', host], (error, stdout, stderr) => {
    if (error) return res.status(500).send('Error al ejecutar el comando');
    res.send(stdout);
  });
});

// REMEDIACIÓN #3: Eliminación de eval() (Uso de lógica segura de cálculo)
app.post('/api/calculate', (req, res) => {
  const { num1, num2, operation } = req.body;
  
  const n1 = parseFloat(num1);
  const n2 = parseFloat(num2);

  if (isNaN(n1) || isNaN(n2)) {
    return res.status(400).json({ error: 'Parámetros numéricos inválidos' });
  }

  let result;
  switch (operation) {
    case 'add':
      result = n1 + n2;
      break;
    case 'subtract':
      result = n1 - n2;
      break;
    case 'multiply':
      result = n1 * n2;
      break;
    case 'divide':
      result = n2 !== 0 ? n1 / n2 : 'División por cero';
      break;
    default:
      return res.status(400).json({ error: 'Operación no permitida' });
  }

  res.json({ result });
});

app.listen(PORT, () => console.log(`Servidor seguro iniciado en puerto ${PORT}`));
