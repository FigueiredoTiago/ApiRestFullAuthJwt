require('dotenv').config();
const User = require('../model/User');
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        //pegando o token do header
        const { authorization } = req.headers;
        //verificando se o token existe
        if (!authorization) {
            return res.status(401).json({ message: 'Acesso Negado, Efetue o Login para Continuar!' });
        }
        //separando o token do bearer
        const parts = authorization.split(' ');
        //separando o bearer do token
        const [schema, token] = parts;
        //verificando se o token tem duas partes
        if (parts.length !== 2) {
            return res.status(401).json({ message: 'Erro no Token ou Token nao definido.' });
        }
        //verificando se o bearer é o bearer mesmo
        if (schema !== 'Bearer') {
            return res.status(401).json({ message: 'Erro no Bearer!' });
        }
        //verificando se o token é valido
        jwt.verify(token, process.env.SECRET, async (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Token Invalido ou expirado' });
            }

            //verificar se o user existe
            const user = await User.findById(decoded.id);
            if (!user || !user.id) {
                return res.status(404).json({ message: 'Usuario não encontrado!' });
            }
            //o id do usuario logado fica disponivel para as rotas que recebem token e estao usando  esse middleware.
            req.userId = user._id;
            return next();
        });
    } catch (error) {
        return res.status(500).json({ message: 'Erro no Servidor' });
    }
};

module.exports = authMiddleware;