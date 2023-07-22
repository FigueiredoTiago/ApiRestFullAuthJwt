const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../model/User');


//Rota de Registrar Usuario:
router.post('/auth/register', async (req, res) => {
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
router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    //validation
    if (!email || !password) {
        return res.status(422).json({ message: 'Preencha todos os campos!' });
    }

    //verificando se o Usuario  já esta cadastrado
    const user = await User.findOne({ email: email });
    if (!user) {
        return res.status(404).send({ message: 'Usuario não cadastrado!' });
    }

    //verificando se a senha esta correta
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
        return res.status(422).send({ message: 'Senha Incorreta!' });
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

module.exports = router;