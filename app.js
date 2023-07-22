require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();

// configuração do express para receber json
app.use(express.json());

//rotas
const userRoute = require('./routes/user');
const historyRoute = require('./routes/history');

app.use('/user', userRoute);
app.use('/history', historyRoute);

//rota privada que precisa do token para pesquisar um usuario
// app.get('/user/:id', checkToken, async (req, res) => {
//     const id = req.params.id;
//     //consultar se existe o usuario
//     const user = await User.findById(id, '-password');
//     if (!user) {
//         return res.status(404).json({ message: 'Usuario não encontrado!' });
//     }
//     res.status(200).json({ user });
// });

//Conctando ao BD
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@clusterjwt.lr08afb.mongodb.net/?retryWrites=true&w=majority`).then(() => {
    app.listen(3001);
    console.log('Api rodando na porta 3001, Conectado ao BD com Sucesso!');
}).catch((err) => { console.log(err) });

