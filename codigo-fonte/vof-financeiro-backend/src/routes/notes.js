import express from 'express';
import { body, validationResult } from 'express-validator';
import { executeQuery } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Validações
const noteValidation = [
  body('title').trim().isLength({ min: 1 }).withMessage('Título é obrigatório'),
  body('content').optional().trim(),
  body('category').optional().trim()
];

// Listar anotações do usuário
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let whereConditions = ['user_id = ?'];
    let queryParams = [req.user.id];

    if (category) {
      whereConditions.push('category = ?');
      queryParams.push(category);
    }

    if (search) {
      whereConditions.push('(title LIKE ? OR content LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.join(' AND ');

    const notes = await executeQuery(
      `SELECT * FROM notes WHERE ${whereClause} ORDER BY updated_at DESC`,
      queryParams
    );

    res.json(notes);
  } catch (error) {
    console.error('Erro ao buscar anotações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar anotação por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const notes = await executeQuery(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (notes.length === 0) {
      return res.status(404).json({ error: 'Anotação não encontrada' });
    }

    res.json(notes[0]);
  } catch (error) {
    console.error('Erro ao buscar anotação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar nova anotação
router.post('/', noteValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, category } = req.body;

    const result = await executeQuery(
      `INSERT INTO notes (user_id, title, content, category)
       VALUES (?, ?, ?, ?)`,
      [req.user.id, title, content, category]
    );

    // Buscar anotação criada
    const newNotes = await executeQuery(
      'SELECT * FROM notes WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Anotação criada com sucesso',
      note: newNotes[0]
    });
  } catch (error) {
    console.error('Erro ao criar anotação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar anotação
router.put('/:id', noteValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, content, category } = req.body;

    // Verificar se a anotação existe e pertence ao usuário
    const existingNotes = await executeQuery(
      'SELECT id FROM notes WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingNotes.length === 0) {
      return res.status(404).json({ error: 'Anotação não encontrada' });
    }

    // Atualizar anotação
    await executeQuery(
      `UPDATE notes 
       SET title = ?, content = ?, category = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, content, category, id]
    );

    // Buscar anotação atualizada
    const updatedNotes = await executeQuery(
      'SELECT * FROM notes WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Anotação atualizada com sucesso',
      note: updatedNotes[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar anotação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar anotação
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a anotação existe e pertence ao usuário
    const existingNotes = await executeQuery(
      'SELECT id FROM notes WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingNotes.length === 0) {
      return res.status(404).json({ error: 'Anotação não encontrada' });
    }

    // Deletar anotação
    await executeQuery('DELETE FROM notes WHERE id = ?', [id]);

    res.json({ message: 'Anotação deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar anotação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar categorias das anotações do usuário
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await executeQuery(
      `SELECT DISTINCT category 
       FROM notes 
       WHERE user_id = ? AND category IS NOT NULL AND category != ''
       ORDER BY category`,
      [req.user.id]
    );

    res.json(categories.map(row => row.category));
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;