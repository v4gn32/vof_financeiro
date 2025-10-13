import express from 'express';
import { body, validationResult, query } from 'express-validator';
import prisma from '../config/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Validações
const transactionValidation = [
  body('type').isIn(['INCOME', 'EXPENSE']).withMessage('Tipo deve ser INCOME ou EXPENSE'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Valor deve ser maior que 0'),
  body('category').trim().isLength({ min: 1 }).withMessage('Categoria é obrigatória'),
  body('description').optional().trim(),
  body('date').isISO8601().withMessage('Data inválida'),
  body('paymentMethod').optional().trim()
];

// Listar transações do usuário
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
  query('type').optional().isIn(['INCOME', 'EXPENSE']).withMessage('Tipo deve ser INCOME ou EXPENSE'),
  query('category').optional().trim(),
  query('startDate').optional().isISO8601().withMessage('Data inicial inválida'),
  query('endDate').optional().isISO8601().withMessage('Data final inválida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 50,
      type,
      category,
      startDate,
      endDate
    } = req.query;

    const skip = (page - 1) * limit;
    
    // Construir filtros para Prisma
    const where = {
      userId: req.user.id
    };

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    // Buscar transações com Prisma
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: [
          { date: 'desc' },
          { createdAt: 'desc' }
        ],
        take: parseInt(limit),
        skip: skip
      }),
      prisma.transaction.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      transactions,
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
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar transação por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: id,
        userId: req.user.id
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Erro ao buscar transação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar nova transação
router.post('/', transactionValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      type,
      amount,
      category,
      description,
      date,
      paymentMethod,
      receipt
    } = req.body;

    const transaction = await prisma.transaction.create({
      data: {
        userId: req.user.id,
        type,
        amount: parseFloat(amount),
        category,
        description,
        date: new Date(date),
        paymentMethod,
        receipt
      }
    });

    res.status(201).json({
      message: 'Transação criada com sucesso',
      transaction
    });
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar transação
router.put('/:id', transactionValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      type,
      amount,
      category,
      description,
      date,
      paymentMethod,
      receipt
    } = req.body;

    // Verificar se a transação existe e pertence ao usuário
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: id,
        userId: req.user.id
      }
    });

    if (!existingTransaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    // Atualizar transação
    const transaction = await prisma.transaction.update({
      where: { id: id },
      data: {
        type,
        amount: parseFloat(amount),
        category,
        description,
        date: new Date(date),
        paymentMethod,
        receipt
      }
    });

    res.json({
      message: 'Transação atualizada com sucesso',
      transaction
    });
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar transação
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a transação existe e pertence ao usuário
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: id,
        userId: req.user.id
      }
    });

    if (!existingTransaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    // Deletar transação
    await prisma.transaction.delete({
      where: { id: id }
    });

    res.json({ message: 'Transação deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Estatísticas das transações
router.get('/stats/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Construir filtros para Prisma
    const where = {
      userId: req.user.id
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    // Buscar estatísticas por tipo
    const [incomeStats, expenseStats] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...where, type: 'income' },
        _sum: { amount: true },
        _count: true,
        _avg: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { ...where, type: 'expense' },
        _sum: { amount: true },
        _count: true,
        _avg: { amount: true }
      })
    ]);

    // Buscar estatísticas por categoria
    const categoryStats = await prisma.transaction.groupBy({
      by: ['category', 'type'],
      where,
      _sum: { amount: true },
      _count: true,
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      }
    });

    // Formatar dados de resumo
    const summary = [];
    if (incomeStats._count > 0) {
      summary.push({
        type: 'income',
        total: incomeStats._sum.amount || 0,
        count: incomeStats._count,
        average: incomeStats._avg.amount || 0
      });
    }
    if (expenseStats._count > 0) {
      summary.push({
        type: 'expense',
        total: expenseStats._sum.amount || 0,
        count: expenseStats._count,
        average: expenseStats._avg.amount || 0
      });
    }

    // Formatar dados por categoria
    const byCategory = categoryStats.map(stat => ({
      category: stat.category,
      type: stat.type,
      total: stat._sum.amount || 0,
      count: stat._count
    }));

    res.json({
      summary,
      byCategory
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;