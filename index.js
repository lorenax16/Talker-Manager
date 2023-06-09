const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const { validaPassword, verificaEmail } = require('./middleware');
const generaToken = require('./generaToken');
const verificaIdade = require('./verificar/idade');
const verificaNome = require('./verificar/nome');
const verificaRate = require('./verificar/rate');
const verificaTalk = require('./verificar/talk');
const verificaWatchedAt = require('./verificar/watchedAt');
const verificaToken1 = require('./verificar/tokenVeri');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// requisito 1 leer o arquivo pessoas cadstradas

async function talkers() {
  try {
    const talkerDados = await fs.readFile('./talker.json', { encoding: 'utf-8' });
    const json = JSON.parse(talkerDados);
    return json;
  } catch (error) {
    console.log(error);
  }
}

async function modificarTalker(list) {
  await fs.writeFile('./talker.json', JSON.stringify(list));
}

// não remova esse endpoint, e para o avaliador funcionar
// app.get('/', (_request, response) => {
//   response.status(HTTP_OK_STATUS).send();
// });

// requisito 1 
app.get('/talker', async (_request, response) => {
  try {
    const talker = await talkers();
    console.log(talker);
    return response.status(HTTP_OK_STATUS).json(talker);
  } catch (error) {
    console.log(error);
  }
});

// requisito 2 retornar pelo id
app.get('/talker/:id', async (request, response) => {
  const talker = await talkers();
  const { id } = request.params;
  const talkerId = talker.find((el) => el.id === Number(id));

  if (!talkerId) return response.status(404).json({ message: 'Pessoa palestrante não encontrada' });

  return response.status(200).json(talkerId);
});

// requisito 3 usei as validaciones do req 4 aqui
app.post('/login', verificaEmail, validaPassword, (_req, res) => {
  try {
    const token = generaToken();
    return res.status(200).json({ token });
  } catch (error) {
    console.log(error);
  }
});

// requisito 5
app.use(verificaToken1);
app.post('/talker', verificaNome, verificaIdade, verificaTalk, verificaWatchedAt,
verificaRate, async (req, res) => {
  const { name, age, talk } = req.body;
  const talker = await talkers();
  const novoId = talker.length + 1;
  const novoTalker = { id: novoId, name, age, talk };
  talker.push(novoTalker);
  await modificarTalker(talker);
  return res.status(201).json(novoTalker);
});

// requisito 6
app.put('/talker/:id', verificaNome, verificaIdade, verificaTalk, verificaWatchedAt,
verificaRate, async (req, res) => {
  const talker = await talkers();
  const { id } = req.params;
  const talkerId = talker.find((el) => el.id === Number(id));
  if (!talkerId) {
    return res.status(400).json({ message: 'Talker não encontrado ' });
  }
  req.body.id = talkerId.id;
  talker.push(req.body);
  await modificarTalker(talker);
  return res.status(200).json(req.body);
});

//  requisito 7
app.delete('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const talker = await talkers();
  const buscaTalker = talker.find((el) => el.id === +id);
  if (!buscaTalker) {
    return res.status(400).json({ message: 'Talker não encontrado ' });
  }
  talker.splice(buscaTalker);
  await modificarTalker(talker);
  return res.status(204).end();
});

// requisito 8

app.get('/talker/search', verificaToken1, async (req, res) => {
  const { q } = req.query;
  const talker = await talkers();
  const busca = talker.filter((el) => el.name.includes(q));
  console.log(busca);
  if (!q || q.length === 0) {
    return res.status(200).json(talker);
  }
  if (!busca) {
    return res.status(200).json([]);
  }
  res.status(200).json(busca);
});

app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const talker = await talkers();
    const dadosId = talker.find((el) => el.id === Number(id));
    if (!dadosId) {
      return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
    } 
    return res.status(200).json(dadosId);
  } catch (error) {
    console.log(error);
  }
});
app.listen(PORT, () => {
  console.log('Online');
});
