import express from 'express';
import { body, validationResult } from 'express-validator';
import { executeQuery } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Validações
const creditCardValidation = [
  body('name').trim().isLength({ min: 1 }).withMessage('Nome do cartão é obrigatório'),
  body('lastFourDigits').isLength({ min: 4, max: 4 }).withMessage('Últimos 4 dígitos devem ter exatamente 4 caracteres'),
  body('closingDay').isInt({ min: 1, max: 31 }).withMessage('Dia de fechamento deve ser entre 1 e 31'),
  body('dueDay').isInt({ min: 1, max: 31 }).withMessage('Dia de vencimento deve ser entre 1 e 31'),
  body('limit').isFloat({ min: 0 }).withMessage('Limite deve ser um valor positivo'),
  body('isActive').optional().isBoolean().withMessage('isActive deve ser um boolean')
];

// Listar cartões do usuário
router.get('/', async (req, res) => {
  try {
    const creditCards = await executeQuery(
      'SELECT * FROM credit_cards WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json(creditCards);
  } catch (error) {
    console.error('Erro ao buscar cartões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar cartão por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const creditCards = await executeQuery(
      'SELECT * FROM credit_cards WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (creditCards.length === 0) {
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }

    res.json(creditCards[0]);
  } catch (error) {
    console.error('Erro ao buscar cartão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar novo cartão
router.post('/', creditCardValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      lastFourDigits,
      closingDay,
      dueDay,
      limit,
      isActive = true
    } = req.body;

    const result = await executeQuery(
      `INSERT INTO credit_cards (user_id, name, last_four_digits, closing_day, due_day, card_limit, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, name, lastFourDigits, closingDay, dueDay, limit, isActive]
    );

    // Buscar cartão criado
    const newCreditCards = await executeQuery(
      'SELECT * FROM credit_cards WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Cartão criado com sucesso',
      creditCard: newCreditCards[0]
    });
  } catch (error) {
    console.error('Erro ao criar cartão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar cartão
router.put('/:id', creditCardValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      name,
      lastFourDigits,
      closingDay,
      dueDay,
      limit,
      isActive
    } = req.body;

    // Verificar se o cartão existe e pertence ao usuário
    const existingCards = await executeQuery(
      'SELECT id FROM credit_cards WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingCards.length === 0) {
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }

    // Atualizar cartão
    await executeQuery(
      `UPDATE credit_cards 
       SET name = ?, last_four_digits = ?, closing_day = ?, due_day = ?, 
           card_limit = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, lastFourDigits, closingDay, dueDay, limit, isActive, id]
    );

    // Buscar cartão atualizado
    const updatedCards = await executeQuery(
      'SELECT * FROM credit_cards WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Cartão atualizado com sucesso',
      creditCard: updatedCards[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar cartão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar cartão
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o cartão existe e pertence ao usuário
    const existingCards = await executeQuery(
      'SELECT id FROM credit_cards WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingCards.length === 0) {
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }

    // Deletar cartão (e suas faturas em cascata)
    await executeQuery('DELETE FROM credit_cards WHERE id = ?', [id]);

    res.json({ message: 'Cartão deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar cartão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar faturas de um cartão
router.get('/:id/invoices', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o cartão pertence ao usuário
    const cards = await executeQuery(
      'SELECT id FROM credit_cards WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (cards.length === 0) {
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }

    // Buscar faturas
    const invoices = await executeQuery(
      'SELECT * FROM credit_card_invoices WHERE card_id = ? ORDER BY year DESC, month DESC',
      [id]
    );

    res.json(invoices);
  } catch (error) {
    console.error('Erro ao buscar faturas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar/atualizar fatura
router.post('/:id/invoices', [
  body('month').isInt({ min: 1, max: 12 }).withMessage('Mês deve ser entre 1 e 12'),
  body('year').isInt({ min: 2020 }).withMessage('Ano inválido'),
  body('totalAmount').isFloat({ min: 0 }).withMessage('Valor total deve ser positivo'),
  body('dueDate').isISO8601().withMessage('Data de vencimento inválida'),
  body('status').optional().isIn(['pending', 'paid', 'overdue']).withMessage('Status inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { month, year, totalAmount, dueDate, status = 'pending' } = req.body;

    // Verificar se o cartão pertence ao usuário
    const cards = await executeQuery(
      'SELECT id FROM credit_cards WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (cards.length === 0) {
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }

    // Verificar se já existe fatura para este mês/ano
    const existingInvoices = await executeQuery(
      'SELECT id FROM credit_card_invoices WHERE card_id = ? AND month = ? AND year = ?',
      [id, month, year]
    );

    let result;
    if (existingInvoices.length > 0) {
      // Atualizar fatura existente
      await executeQuery(
        `UPDATE credit_card_invoices 
         SET total_amount = ?, due_date = ?, status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [totalAmount, dueDate, status, existingInvoices[0].id]
      );
      result = { insertId: existingInvoices[0].id };
    } else {
      // Criar nova fatura
      result = await executeQuery(
        `INSERT INTO credit_card_invoices (card_id, month, year, total_amount, due_date, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, month, year, totalAmount, dueDate, status]
      );
    }

    // Buscar fatura criada/atualizada
    const invoices = await executeQuery(
      'SELECT * FROM credit_card_invoices WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Fatura salva com sucesso',
      invoice: invoices[0]
    });
  } catch (error) {
    console.error('Erro ao salvar fatura:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;