const express = require('express');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const app = express();
const PORT = 4000;

app.use(express.json());

// REMEDIACIÓN #1: Path Traversal (Uso de path.basename para aislar el archivo)
app.get('/api/read-file', (req, res) => {
  const fileName = req.query.name;

  if (!fileName || typeof fileName !== 'string') {
    res.status(400).send('Nombre de archivo inválido');
    return;
  }

  // Previene navegación de directorios (../) extrayendo solo el nombre base
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

// REMEDIACIÓN #2: Command Injection (Eliminación de shell y uso directo de execFile)
app.get('/api/ping', (req, res) => {
  const host = req.query.host;

  // Validación mediante comprobación de tipo y longitud básica
  if (!host || typeof host !== 'string' || host.length > 50) {
    res.status(400).send('Host no válido');
    return;
  }

  // Deshabilitamos la invocación de la consola para evitar inyección de comandos
  execFile('ping', ['-c', '1', host], { timeout: 5000 }, (error, stdout) => {
    if (error) {
      res.status(500).send('Error al ejecutar la solicitud');
      return;
    }
    res.send(stdout);
  });
});

// REMEDIACIÓN #3: Eliminación de eval() (Evaluación de operaciones mediante mapa)
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
