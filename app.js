require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

//middlewares
const authMiddleware = require('./middlewares/auth.middleware');

// configuração do express para receber json
app.use(express.json());

//Models
const User = require('./model/User');
const History = require('./model/History');

//rota aberta - 
app.get('/allhistory', async (req, res) => {
    try {
        const history = await History.find();
        res.status(200).json(history);

    } catch (error) {
        res.status(500).json({ error: error })
    }
});

//rota privada que precisa do token
app.get('/user/:id', checkToken, async (req, res) => {
    const id = req.params.id;
    //consultar se existe o usuario
    const user = await User.findById(id, '-password');
    if (!user) {
        return res.status(404).json({ message: 'Usuario não encontrado!' });
    }
    res.status(200).json({ user });
});

//Rota Privada para postar hitorias
app.post('/newhistory', authMiddleware, checkToken, async (req, res) => {
    const { name, stack, history, github } = req.body;


    if (!name || !stack || !history || !github) {
        res.status(422).json({ error: "Prencha Todos os Campos vazios!" });
        return;
    }

    const historyUser = {
        name: name,
        stack: stack,
        history: history,
        github: github,
        authorid: req.userId, //pegando o id do usuario logado
    }
    //create do mongoose
    try {
        //criando dados no banco
        await History.create(historyUser);
        res.status(201).json({ message: 'Historia Postada com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error })
    }

});

//funcao para verificar se o token é valido
function checkToken(req, res, next) {
    const authHeader = req.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Acesso Negado, Efetue o Login para Continuar!' });
    }

    try {
        const secret = process.env.SECRET;
        jwt.verify(token, secret);
        next();
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: 'Token Invalido!' });
    }

}


//Rota de Registrar Usuario:
app.post('/auth/register', async (req, res) => {
    const { name, email, password, confirmpassword } = req.body;

    //validation
    if (!name || !email || !password || !confirmpassword) {
        return res.status(422).json({ message: 'Preencha todos os campos!' });
    }
    if (password !== confirmpassword) {
        return res.status(422).json({ message: 'As senhas não conferem!' });
    }

    //verificando se o email já existe
    const userExists = await User.findOne({ email: email });
    if (userExists) {
        return res.status(422).json({ message: 'Email já cadastrado!' });
    }

    //Criando e Criptografando a senha
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    //criar o usuario
    const user = new User({
        name: name,
        email: email,
        password: passwordHash,
    });

    //salvando o usuario no BD
    try {
        await user.save();
        res.status(201).json({ message: 'Usuario criado com sucesso!' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Ops...Algo deu Errado, Tente Novamente!" });
    }

});

//Rota de Login:

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    //validation
    if (!email || !password) {
        return res.status(422).json({ message: 'Preencha todos os campos!' });
    }

    //verificando se o Usuario  já esta cadastrado
    const user = await User.findOne({ email: email });
    if (!user) {
        return res.status(404).json({ message: 'Usuario não cadastrado!' });
    }

    //verificando se a senha esta correta
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
        return res.status(422).json({ message: 'Senha incorreta!' });
    }
    //criando o token
    try {
        const secret = process.env.SECRET;
        const token = jwt.sign({ id: user._id }, secret);

        return res.status(200).json({ message: 'Usuario logado com sucesso!', token: token });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Ops...Algo deu Errado, Tente Novamente!" });
    }
});


//Conctando ao BD
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@clusterjwt.lr08afb.mongodb.net/?retryWrites=true&w=majority`).then(() => {
    app.listen(3001);
    console.log('Api rodando na porta 3001, Conectado ao BD com Sucesso!');
}).catch((err) => { console.log(err) });

