import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/prisma.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Validações
const updateUserValidation = [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('avatar').optional().trim()
];

// Buscar perfil do usuário logado
router.get('/profile', async (req, res) => {
  try {
    const users = await executeQuery(
      'SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar perfil do usuário logado
router.put('/profile', updateUserValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, avatar } = req.body;
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (email !== undefined) {
      // Verificar se email já está em uso por outro usuário
      const existingUsers = await executeQuery(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, req.user.id]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ error: 'Email já está em uso' });
      }

      updateFields.push('email = ?');
      updateValues.push(email);
    }

    if (avatar !== undefined) {
      updateFields.push('avatar = ?');
      updateValues.push(avatar);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(req.user.id);

    // Atualizar usuário
    await executeQuery(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Buscar usuário atualizado
    const updatedUsers = await executeQuery(
      'SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: updatedUsers[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Dashboard do usuário (estatísticas gerais)
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.id;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Estatísticas de transações do mês atual
    const [incomeStats, expenseStats] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'INCOME',
          date: {
            gte: new Date(currentYear, currentMonth - 1, 1),
            lt: new Date(currentYear, currentMonth, 1)
          }
        },
        _sum: { amount: true },
        _count: true
      }),
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'EXPENSE',
          date: {
            gte: new Date(currentYear, currentMonth - 1, 1),
            lt: new Date(currentYear, currentMonth, 1)
          }
        },
        _sum: { amount: true },
        _count: true
      })
    ]);

    // Total de investimentos
    const [deposits, withdrawals] = await Promise.all([
      prisma.investment.aggregate({
        where: {
          userId,
          transactionType: 'DEPOSIT'
        },
        _sum: { amount: true }
      }),
      prisma.investment.aggregate({
        where: {
          userId,
          transactionType: 'WITHDRAWAL'
        },
        _sum: { amount: true }
      })
    ]);

    // Número de cartões ativos
    const activeCards = await prisma.creditCard.count({
      where: {
        userId,
        isActive: true
      }
    });

    // Número de anotações
    const totalNotes = await prisma.note.count({
      where: {
        userId
      }
    });

    // Organizar dados
    const monthlyIncome = Number(incomeStats._sum.amount || 0);
    const monthlyExpenses = Number(expenseStats._sum.amount || 0);
    const totalInvestments = Number(deposits._sum.amount || 0) - Number(withdrawals._sum.amount || 0);
    const monthlyBalance = monthlyIncome - monthlyExpenses;

    res.json({
      monthlyIncome,
      monthlyExpenses,
      monthlyBalance,
      totalInvestments,
      activeCards,
      totalNotes,
      totalBalance: monthlyBalance + totalInvestments
    });
  } catch (error) {
    console.error('Erro ao buscar dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas administrativas (apenas para admins)

// Listar todos os usuários (admin)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const offset = (page - 1) * limit;

    let whereCondition = '';
    let queryParams = [];

    if (search) {
      whereCondition = 'WHERE name LIKE ? OR email LIKE ?';
      queryParams = [`%${search}%`, `%${search}%`];
    }

    // Buscar usuários
    const users = await executeQuery(
      `SELECT id, name, email, role, avatar, created_at 
       FROM users 
       ${whereCondition}
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(limit), offset]
    );

    // Contar total
    const totalResult = await executeQuery(
      `SELECT COUNT(*) as total FROM users ${whereCondition}`,
      queryParams
    );

    const total = totalResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar usuário por ID (admin)
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const users = await executeQuery(
      'SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar usuário (admin)
router.put('/:id', requireAdmin, [
  ...updateUserValidation,
  body('role').optional().isIn(['user', 'admin']).withMessage('Role deve ser user ou admin')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, email, avatar, role } = req.body;

    // Verificar se usuário existe
    const existingUsers = await executeQuery(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (email !== undefined) {
      // Verificar se email já está em uso
      const emailUsers = await executeQuery(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      );

      if (emailUsers.length > 0) {
        return res.status(400).json({ error: 'Email já está em uso' });
      }

      updateFields.push('email = ?');
      updateValues.push(email);
    }

    if (avatar !== undefined) {
      updateFields.push('avatar = ?');
      updateValues.push(avatar);
    }

    if (role !== undefined) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    // Atualizar usuário
    await executeQuery(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Buscar usuário atualizado
    const updatedUsers = await executeQuery(
      'SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Usuário atualizado com sucesso',
      user: updatedUsers[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar usuário (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Não permitir que admin delete a si mesmo
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Você não pode deletar sua própria conta' });
    }

    // Verificar se usuário existe
    const existingUsers = await executeQuery(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Deletar usuário (dados relacionados serão deletados em cascata)
    await executeQuery('DELETE FROM users WHERE id = ?', [id]);

    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;