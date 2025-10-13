import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Validações para transações de cartão
const creditCardTransactionValidation = [
  body('cardId').notEmpty().withMessage('ID do cartão é obrigatório'),
  body('description').trim().isLength({ min: 1 }).withMessage('Descrição é obrigatória'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Valor deve ser maior que zero'),
  body('category').trim().isLength({ min: 1 }).withMessage('Categoria é obrigatória'),
  body('date').isISO8601().withMessage('Data deve estar no formato válido'),
  body('installments').optional().isInt({ min: 1, max: 60 }).withMessage('Parcelas devem ser entre 1 e 60'),
  body('notes').optional().isString()
];

// Listar transações de cartão do usuário
router.get('/', async (req, res) => {
  try {
    const { cardId, startDate, endDate, category } = req.query;
    
    // Primeiro, verificar quais cartões pertencem ao usuário
    const userCards = await prisma.creditCard.findMany({
      where: {
        userId: req.user.id,
        isActive: true
      },
      select: {
        id: true
      }
    });

    const userCardIds = userCards.map(card => card.id);

    if (userCardIds.length === 0) {
      return res.json([]);
    }

    // Construir filtros
    const where = {
      cardId: {
        in: userCardIds
      }
    };

    if (cardId && cardId !== 'all') {
      where.cardId = cardId;
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    if (category) {
      where.category = category;
    }

    // Buscar transações com informações do cartão
    const transactions = await prisma.creditCardTransaction.findMany({
      where,
      include: {
        creditCard: {
          select: {
            name: true,
            lastFourDigits: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    res.json(transactions);
  } catch (error) {
    console.error('Erro ao buscar transações de cartão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar transação por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.creditCardTransaction.findFirst({
      where: {
        id: id,
        creditCard: {
          userId: req.user.id
        }
      },
      include: {
        creditCard: {
          select: {
            name: true,
            lastFourDigits: true
          }
        }
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

// Criar nova transação de cartão
router.post('/', creditCardTransactionValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      cardId,
      description,
      amount,
      category,
      date,
      installments = 1,
      notes
    } = req.body;

    // Verificar se o cartão pertence ao usuário
    const card = await prisma.creditCard.findFirst({
      where: {
        id: cardId,
        userId: req.user.id,
        isActive: true
      }
    });

    if (!card) {
      return res.status(404).json({ error: 'Cartão não encontrado ou inativo' });
    }

    const newTransaction = await prisma.creditCardTransaction.create({
      data: {
        cardId,
        description,
        amount: parseFloat(amount),
        category,
        date: new Date(date),
        installments: parseInt(installments),
        notes
      },
      include: {
        creditCard: {
          select: {
            name: true,
            lastFourDigits: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Transação criada com sucesso',
      transaction: newTransaction
    });
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar transação
router.put('/:id', creditCardTransactionValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      cardId,
      description,
      amount,
      category,
      date,
      installments,
      notes
    } = req.body;

    // Verificar se a transação existe e pertence ao usuário
    const existingTransaction = await prisma.creditCardTransaction.findFirst({
      where: {
        id: id,
        creditCard: {
          userId: req.user.id
        }
      }
    });

    if (!existingTransaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    // Verificar se o novo cartão pertence ao usuário (se foi alterado)
    if (cardId !== existingTransaction.cardId) {
      const card = await prisma.creditCard.findFirst({
        where: {
          id: cardId,
          userId: req.user.id,
          isActive: true
        }
      });

      if (!card) {
        return res.status(404).json({ error: 'Cartão não encontrado ou inativo' });
      }
    }

    const updatedTransaction = await prisma.creditCardTransaction.update({
      where: {
        id: id
      },
      data: {
        cardId,
        description,
        amount: parseFloat(amount),
        category,
        date: new Date(date),
        installments: parseInt(installments),
        notes
      },
      include: {
        creditCard: {
          select: {
            name: true,
            lastFourDigits: true
          }
        }
      }
    });

    res.json({
      message: 'Transação atualizada com sucesso',
      transaction: updatedTransaction
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
    const transaction = await prisma.creditCardTransaction.findFirst({
      where: {
        id: id,
        creditCard: {
          userId: req.user.id
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    await prisma.creditCardTransaction.delete({
      where: {
        id: id
      }
    });

    res.json({ message: 'Transação deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter estatísticas de transações por cartão
router.get('/stats/summary', async (req, res) => {
  try {
    const { month, year } = req.query;
    
    // Buscar cartões do usuário
    const userCards = await prisma.creditCard.findMany({
      where: {
        userId: req.user.id,
        isActive: true
      }
    });

    const userCardIds = userCards.map(card => card.id);

    if (userCardIds.length === 0) {
      return res.json([]);
    }

    // Construir filtros de data
    const dateFilter = {};
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      dateFilter.date = {
        gte: startDate,
        lte: endDate
      };
    }

    // Buscar estatísticas por cartão
    const stats = await Promise.all(
      userCards.map(async (card) => {
        const transactions = await prisma.creditCardTransaction.findMany({
          where: {
            cardId: card.id,
            ...dateFilter
          }
        });

        const totalAmount = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const transactionCount = transactions.length;

        return {
          cardId: card.id,
          cardName: card.name,
          lastFourDigits: card.lastFourDigits,
          totalAmount,
          transactionCount,
          limit: parseFloat(card.cardLimit),
          usagePercentage: card.cardLimit > 0 ? (totalAmount / parseFloat(card.cardLimit)) * 100 : 0
        };
      })
    );

    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;