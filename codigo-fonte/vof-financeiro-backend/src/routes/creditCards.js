import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/prisma.js';
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
    const creditCards = await prisma.creditCard.findMany({
      where: {
        userId: req.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

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

    const creditCard = await prisma.creditCard.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      }
    });

    if (!creditCard) {
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }

    res.json(creditCard);
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

    const newCreditCard = await prisma.creditCard.create({
      data: {
        userId: req.user.id,
        name,
        lastFourDigits,
        closingDay,
        dueDay,
        cardLimit: limit,
        isActive
      }
    });

    res.status(201).json({
      message: 'Cartão criado com sucesso',
      creditCard: newCreditCard
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
    const existingCard = await prisma.creditCard.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      }
    });

    if (!existingCard) {
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }

    // Atualizar cartão
    const updatedCreditCard = await prisma.creditCard.update({
      where: {
        id: parseInt(id)
      },
      data: {
        name,
        lastFourDigits,
        closingDay,
        dueDay,
        cardLimit: limit,
        isActive
      }
    });

    res.json({
      message: 'Cartão atualizado com sucesso',
      creditCard: updatedCreditCard
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
    const existingCard = await prisma.creditCard.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      }
    });

    if (!existingCard) {
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }

    // Deletar cartão (e suas faturas em cascata)
    await prisma.creditCard.delete({
      where: {
        id: parseInt(id)
      }
    });

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
    const card = await prisma.creditCard.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      }
    });

    if (!card) {
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }

    // Buscar faturas
    const invoices = await prisma.creditCardInvoice.findMany({
      where: {
        cardId: parseInt(id)
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    });

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
    const card = await prisma.creditCard.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      }
    });

    if (!card) {
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }

    // Verificar se já existe fatura para este mês/ano
    const existingInvoice = await prisma.creditCardInvoice.findFirst({
      where: {
        cardId: parseInt(id),
        month,
        year
      }
    });

    let invoice;
    if (existingInvoice) {
      // Atualizar fatura existente
      invoice = await prisma.creditCardInvoice.update({
        where: {
          id: existingInvoice.id
        },
        data: {
          totalAmount,
          dueDate: new Date(dueDate),
          status
        }
      });
    } else {
      // Criar nova fatura
      invoice = await prisma.creditCardInvoice.create({
        data: {
          cardId: parseInt(id),
          month,
          year,
          totalAmount,
          dueDate: new Date(dueDate),
          status
        }
      });
    }

    res.status(201).json({
      message: 'Fatura salva com sucesso',
      invoice
    });
  } catch (error) {
    console.error('Erro ao salvar fatura:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;