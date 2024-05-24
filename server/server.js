require('dotenv').config()
const express = require('express')
const cors = require('cors')
const axios = require('axios')
const app = express()
const port = 8000

const SITE_SECRET = process.env.SITE_SECRET

app.use(cors())
app.use(express.json())

app.post('/verify', async (request, response) => {
  const { captchaValue } = request.body
  const { data } = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?hl=pt-BR&secret=${SITE_SECRET}&response=${captchaValue}`,
  )
  response.send(data)
})

// Rota para consultar dados de um CNPJ
app.get('/cnpj/:cnpj', async (request, response) => {
  const { cnpj } = request.params;
  try {
    const url = `https://receitaws.com.br/v1/cnpj/${cnpj}`;
    const { data } = await axios.get(url);
    response.json(data);
  } catch (error) {
    console.error('Erro ao buscar dados do CNPJ:', error);
    response.status(500).json({ message: "Erro interno no servidor" });
  }
})

app.listen(port, () => {
  console.log(`Server listening at ${port}`)
})
