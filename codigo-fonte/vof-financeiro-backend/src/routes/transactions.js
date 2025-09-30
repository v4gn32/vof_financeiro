import express from 'express';
import { body, validationResult, query } from 'express-validator';
import prisma from '../config/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Validações
const transactionValidation = [
  body('type').isIn(['income', 'expense']).withMessage('Tipo deve ser income ou expense'),
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
  query('type').optional().isIn(['income', 'expense']).withMessage('Tipo deve ser income ou expense'),
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

    const offset = (page - 1) * limit;
    let whereConditions = ['user_id = ?'];
    let queryParams = [req.user.id];

    // Filtros opcionais
    if (type) {
      whereConditions.push('type = ?');
      queryParams.push(type);
    }

    if (category) {
      whereConditions.push('category = ?');
      queryParams.push(category);
    }

    if (startDate) {
      whereConditions.push('date >= ?');
      queryParams.push(startDate);
    }

    if (endDate) {
      whereConditions.push('date <= ?');
      queryParams.push(endDate);
    }

    const whereClause = whereConditions.join(' AND ');

    // Buscar transações
    const transactions = await executeQuery(
      `SELECT * FROM transactions 
       WHERE ${whereClause} 
       ORDER BY date DESC, created_at DESC 
       LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(limit), offset]
    );

    // Contar total de transações
    const totalResult = await executeQuery(
      `SELECT COUNT(*) as total FROM transactions WHERE ${whereClause}`,
      queryParams
    );

    const total = totalResult[0].total;
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

    const transactions = await executeQuery(
      'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (transactions.length === 0) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    res.json(transactions[0]);
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

    const result = await executeQuery(
      `INSERT INTO transactions (user_id, type, amount, category, description, date, payment_method, receipt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, type, amount, category, description, date, paymentMethod, receipt]
    );

    // Buscar transação criada
    const newTransactions = await executeQuery(
      'SELECT * FROM transactions WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Transação criada com sucesso',
      transaction: newTransactions[0]
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
    const existingTransactions = await executeQuery(
      'SELECT id FROM transactions WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingTransactions.length === 0) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    // Atualizar transação
    await executeQuery(
      `UPDATE transactions 
       SET type = ?, amount = ?, category = ?, description = ?, date = ?, 
           payment_method = ?, receipt = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [type, amount, category, description, date, paymentMethod, receipt, id]
    );

    // Buscar transação atualizada
    const updatedTransactions = await executeQuery(
      'SELECT * FROM transactions WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Transação atualizada com sucesso',
      transaction: updatedTransactions[0]
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
    const existingTransactions = await executeQuery(
      'SELECT id FROM transactions WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingTransactions.length === 0) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    // Deletar transação
    await executeQuery('DELETE FROM transactions WHERE id = ?', [id]);

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

    // Buscar estatísticas
    const stats = await executeQuery(
      `SELECT 
         type,
         SUM(amount) as total,
         COUNT(*) as count,
         AVG(amount) as average
       FROM transactions 
       WHERE ${whereClause}
       GROUP BY type`,
      queryParams
    );

    // Buscar por categoria
    const categoryStats = await executeQuery(
      `SELECT 
         category,
         type,
         SUM(amount) as total,
         COUNT(*) as count
       FROM transactions 
       WHERE ${whereClause}
       GROUP BY category, type
       ORDER BY total DESC`,
      queryParams
    );

    res.json({
      summary: stats,
      byCategory: categoryStats
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;