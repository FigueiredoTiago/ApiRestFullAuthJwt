const express = require('express');
const router = express.Router();
const History = require('../model/History');

//middlewares
const authMiddleware = require('../middlewares/auth.middleware');

//rota aberta - que pega todas as historias
router.get('/allhistory', async (req, res) => {
    try {
        const history = await History.find();
        res.status(200).json(history);

    } catch (error) {
        res.status(500).json({ error: error })
    }
});

//Rota Privada para postar hitorias
router.post('/newhistory', authMiddleware, async (req, res) => {
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
        res.status(500).json({ message: 'Erro na Postagem' });
    }

});

//rota para pegar as historias do usuario logado
router.get('/myhistory', authMiddleware, async (req, res) => {
    try {
        const id = req.userId;
        const history = await History.find({ authorid: id }).sort({ _id: -1 }).populate('authorid');
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ error: error })
    }
});

//rota para atualizar as historias do usuario logado
router.patch('/updatehistory/:id', authMiddleware, async (req, res) => {
    //pegando o id da historia
    const id = req.params.id;
    //pegando o id do usuario logado
    const authorid = req.userId;
    //pegando os dados do body
    const { name, stack, history, github } = req.body;
    //validando os campos
    if (!name && !stack && !history && !github) {
        res.status(422).json({ error: "Prencha Todos os Campos vazios!" });
        return;
    }
    //atualizando os dados no banco
    const historyUpdate = History.findOneAndUpdate({ _id: id }, {
        name: name,
        stack: stack,
        history: history,
        github: github,
    }, { rawResult: true });
    //verificando se o usuario logado é o mesmo que criou a historia
    try {
        const history = await History.findById({ _id: id });

        if (history.authorid != authorid) {
            res.status(401).json({ error: "Acesso Negado voce nao e o Dono dessa historia! " });
            return;
        }

        await historyUpdate;
        return res.status(200).json({ message: 'Historia Atualizada com sucesso!' });

    } catch (error) {
        res.status(500).json({ error: error })
    }

});

//rota para deletar a historia do usuario logado

router.delete('/deletehistory/:id', authMiddleware, async (req, res) => {
    const id = req.params.id;
    const authorid = req.userId;

    try {
        const history = await History.findById({ _id: id });

        if (history.authorid != authorid) {
            res.status(401).json({ error: "Acesso Negado, você não pode apagar essa historia! " });
            return;
        }

        await History.deleteOne({ _id: id });
        return res.status(200).json({ message: 'Historia Deletada com sucesso!' });

    } catch (error) {
        res.status(500).json({ error: error })
    }

});
module.exports = router;