//VERIFICACAO PARA VER SE VEIO O TOKEN E PEGAR O ID DO USER
const { authorization } = req.headers;

if (!authorization) {
    return res.status(401).json({ message: 'Acesso Negado, Efetue o Login para Continuar!' });
}

const parts = authorization.split(' ');
const [scheme, token] = parts;

if (parts.length !== 2) {
    return res.status(401).json({ message: 'Erro no Token ou Token nao definido.' });
}

if (scheme !== 'Bearer') {
    return res.status(401).json({ message: 'Erro no Bearer!' });
}