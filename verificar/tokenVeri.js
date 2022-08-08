const verificaToken1 = (req, res, next) => {
  const { authorization: verificaToken } = req.headers;
  if (!verificaToken) {
    return res.status(401).json({ message: 'Token não encontrado' });
  }

  if (verificaToken.length !== 16) {
    return res.status(401).json({ message: 'Token inválido' });
  }

  next();
};
module.exports = verificaToken1;