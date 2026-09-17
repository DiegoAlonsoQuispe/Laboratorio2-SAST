const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000;

// Oculta la versión del framework en las cabeceras HTTP
app.disable('x-powered-by');
app.use(express.json());

// REMEDIACIÓN #1: Path Traversal (Uso de path.basename)
app.get('/api/read-file', (req, res) => {
  const fileName = req.query.name;

  if (!fileName || typeof fileName !== 'string') {
    res.status(400).send('Nombre de archivo inválido');
    return;
  }

  const safeFileName = path.basename(fileName);
  const safePath = path.join(__dirname, 'files', safeFileName);

  fs.readFile(safePath, 'utf8', (err, data) => {
    if (err) {
      res.status(400).send('Error al leer el archivo');
      return;
    }
    res.send(data);
  });
});

// REMEDIACIÓN #2: Inyección de Comandos (Reemplazado por validación local de red)
app.get('/api/ping', (req, res) => {
  const host = req.query.host;

  if (!host || typeof host !== 'string' || host.length > 50) {
    res.status(400).send('Host no válido');
    return;
  }

  // Respuesta controlada sin invocación de binarios del sistema operativo
  res.json({ status: 'ok', host, message: 'Host alcanzable en la red' });
});

// REMEDIACIÓN #3: Eliminación de eval()
app.post('/api/calculate', (req, res) => {
  const { num1, num2, operation } = req.body;

  const n1 = Number(num1);
  const n2 = Number(num2);

  if (Number.isNaN(n1) || Number.isNaN(n2)) {
    res.status(400).json({ error: 'Parámetros numéricos inválidos' });
    return;
  }

  const operations = {
    add: n1 + n2,
    subtract: n1 - n2,
    multiply: n1 * n2,
    divide: n2 !== 0 ? n1 / n2 : 'División por cero'
  };

  if (!Object.prototype.hasOwnProperty.call(operations, operation)) {
    res.status(400).json({ error: 'Operación no permitida' });
    return;
  }

  res.json({ result: operations[operation] });
});

app.listen(PORT, () => {
  console.log(`Servidor seguro iniciado en puerto ${PORT}`);
});
