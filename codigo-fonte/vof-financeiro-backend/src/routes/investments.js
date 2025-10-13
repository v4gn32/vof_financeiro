import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { executeQuery } from '../config/database.js';

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Validações
const investmentValidation = [
  body('type').trim().isLength({ min: 1 }).withMessage('Tipo de investimento é obrigatório'),
  body('description').optional().trim(),
  body('amount').isFloat({ min: 0.01 }).withMessage('Valor deve ser maior que 0'),
  body('date').isISO8601().withMessage('Data inválida'),
  body('transactionType').isIn(['deposit', 'withdrawal']).withMessage('Tipo de transação deve ser deposit ou withdrawal'),
  body('notes').optional().trim()
];

// Listar investimentos do usuário
router.get('/', async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    
    let whereConditions = {
      userId: req.user.id
    };

    if (type) {
      whereConditions.type = type;
    }

    if (startDate) {
      whereConditions.date = {
        ...whereConditions.date,
        gte: new Date(startDate)
      };
    }

    if (endDate) {
      whereConditions.date = {
        ...whereConditions.date,
        lte: new Date(endDate)
      };
    }

    const investments = await prisma.investment.findMany({
      where: whereConditions,
      orderBy: [
        { date: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json(investments);
  } catch (error) {
    console.error('Erro ao buscar investimentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar investimento por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const investment = await prisma.investment.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!investment) {
      return res.status(404).json({ error: 'Investimento não encontrado' });
    }

    res.json(investment);
  } catch (error) {
    console.error('Erro ao buscar investimento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar novo investimento
router.post('/', investmentValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      type,
      description,
      amount,
      date,
      transactionType,
      notes
    } = req.body;

    const investment = await prisma.investment.create({
      data: {
        userId: req.user.id,
        type,
        description,
        amount,
        date: new Date(date),
        transactionType: transactionType.toUpperCase(),
        notes
      }
    });

    res.status(201).json({
      message: 'Investimento criado com sucesso',
      investment
    });
  } catch (error) {
    console.error('Erro ao criar investimento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar investimento
router.put('/:id', investmentValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      type,
      description,
      amount,
      date,
      transactionType,
      notes
    } = req.body;

    // Verificar se o investimento existe e pertence ao usuário
    const existingInvestments = await executeQuery(
      'SELECT id FROM investments WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingInvestments.length === 0) {
      return res.status(404).json({ error: 'Investimento não encontrado' });
    }

    // Atualizar investimento
    await executeQuery(
      `UPDATE investments 
       SET type = ?, description = ?, amount = ?, date = ?, 
           transaction_type = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [type, description, amount, date, transactionType, notes, id]
    );

    // Buscar investimento atualizado
    const updatedInvestments = await executeQuery(
      'SELECT * FROM investments WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Investimento atualizado com sucesso',
      investment: updatedInvestments[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar investimento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar investimento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o investimento existe e pertence ao usuário
    const existingInvestments = await executeQuery(
      'SELECT id FROM investments WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingInvestments.length === 0) {
      return res.status(404).json({ error: 'Investimento não encontrado' });
    }

    // Deletar investimento
    await executeQuery('DELETE FROM investments WHERE id = ?', [id]);

    res.json({ message: 'Investimento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar investimento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Estatísticas dos investimentos
router.get('/stats/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let whereConditions = ['user_id = ?'];
    let queryParams = [req.user.id];

    if (startDate) {
      whereConditions.push('date >= ?');
      queryParams.push(startDate);
    }

    if (endDate) {
      whereConditions.push('date <= ?');
      queryParams.push(endDate);
    }

    const whereClause = whereConditions.join(' AND ');

    // Buscar estatísticas por tipo
    const typeStats = await executeQuery(
      `SELECT 
         type,
         transaction_type,
         SUM(amount) as total,
         COUNT(*) as count
       FROM investments 
       WHERE ${whereClause}
       GROUP BY type, transaction_type
       ORDER BY total DESC`,
      queryParams
    );

    // Calcular saldo total por tipo
    const balanceStats = await executeQuery(
      `SELECT 
         type,
         SUM(CASE WHEN transaction_type = 'deposit' THEN amount ELSE -amount END) as balance
       FROM investments 
       WHERE ${whereClause}
       GROUP BY type
       ORDER BY balance DESC`,
      queryParams
    );

    // Total geral
    const totalBalance = await executeQuery(
      `SELECT 
         SUM(CASE WHEN transaction_type = 'deposit' THEN amount ELSE -amount END) as total_balance
       FROM investments 
       WHERE ${whereClause}`,
      queryParams
    );

    res.json({
      byType: typeStats,
      balanceByType: balanceStats,
      totalBalance: totalBalance[0].total_balance || 0
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de investimentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;