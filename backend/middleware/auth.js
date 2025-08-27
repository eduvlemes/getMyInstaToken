const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Middleware de autenticação que verifica o token JWT
 */
module.exports = async (req, res, next) => {
  try {
    // Verificar se o token existe no header de autorização, nos cookies ou como parâmetro de consulta
    let token = null;
    
    // Verificar header de Authorization
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Verificar header X-Auth-Token
    if (!token && req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
    }
    
    // Verificar cookie
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    // Verificar parâmetros de consulta
    if (!token && req.query && req.query.token) {
      token = req.query.token;
    }
    
    // Se não encontrou token, retorna não autorizado
    if (!token) {
      return res.status(401).json({
        error: true,
        message: 'No authentication token provided'
      });
    }
    
    // Verifica o token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Busca o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });
    
    // Verifica se o usuário existe
    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'User not found'
      });
    }
    
    // Adiciona o usuário autenticado à requisição
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      error: true,
      message: 'Invalid or expired token'
    });
  }
};
