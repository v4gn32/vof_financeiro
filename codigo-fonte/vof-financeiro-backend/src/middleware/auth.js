import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Token de acesso requerido',
      message: 'Você precisa estar logado para acessar este recurso'
    });
  }

  try {
    // Verificar se JWT_SECRET está configurado
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET não configurado');
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar se o token tem os campos necessários
    if (!decoded.userId || !decoded.email) {
      return res.status(403).json({ error: 'Token inválido - dados incompletos' });
    }
    
    // Verificar se o usuário ainda existe e está ativo
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Usuário não encontrado',
        message: 'Sua conta pode ter sido removida. Faça login novamente.'
      });
    }

    // Verificar se o email do token corresponde ao email atual do usuário
    if (user.email !== decoded.email) {
      return res.status(401).json({ 
        error: 'Token inválido',
        message: 'Dados do usuário foram alterados. Faça login novamente.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        message: 'Sua sessão expirou. Faça login novamente.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        error: 'Token inválido',
        message: 'Token malformado ou corrompido.'
      });
    }
    
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Erro ao verificar autenticação.'
    });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }
  
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Acesso negado',
      message: 'Privilégios de administrador requeridos para acessar este recurso.'
    });
  }
  next();
};

export const requireOwnership = (userIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const resourceUserId = req.params[userIdField] || req.body[userIdField] || req.query[userIdField];
    
    // Admin pode acessar qualquer recurso
    if (req.user.role === 'ADMIN') {
      return next();
    }
    
    // Usuário só pode acessar seus próprios dados
    if (req.user.id !== resourceUserId) {
      return res.status(403).json({ 
        error: 'Acesso negado',
        message: 'Você só pode acessar seus próprios dados.'
      });
    }
    
    next();
  };
};

// Middleware para verificar se o usuário é o dono do recurso ou admin
export const requireOwnershipOrAdmin = (resourceUserIdGetter) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    // Admin pode acessar qualquer recurso
    if (req.user.role === 'ADMIN') {
      return next();
    }
    
    try {
      const resourceUserId = await resourceUserIdGetter(req);
      
      if (req.user.id !== resourceUserId) {
        return res.status(403).json({ 
          error: 'Acesso negado',
          message: 'Você só pode acessar seus próprios dados.'
        });
      }
      
      next();
    } catch (error) {
      console.error('Erro ao verificar propriedade do recurso:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
};