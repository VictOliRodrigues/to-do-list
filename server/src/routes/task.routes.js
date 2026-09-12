import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { notFound } from '../errors.js';

const router = Router();

// Todas as rotas de tarefas exigem autenticacao.
router.use(requireAuth);

/**
 * Data prevista: opcional, mas quando enviada precisa ser uma data de calendario
 * real no formato YYYY-MM-DD. O regex garante o formato e a reconstrucao da
 * string apos o parse rejeita datas que "transbordam" o mes (ex.: 2026-02-31,
 * que o Date normalizaria silenciosamente para 2026-03-03).
 */
const dueDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'A data prevista deve estar no formato AAAA-MM-DD.')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
  }, 'A data prevista nao e uma data valida.')
  .transform((value) => new Date(`${value}T00:00:00.000Z`));

/**
 * Aceita string vazia e null como "sem data".
 * Usa preprocess em vez de union porque o union descartaria as mensagens de erro
 * especificas do dueDateSchema, devolvendo um generico "Invalid input".
 */
const optionalDueDate = z.preprocess(
  (value) => (value === '' || value === null ? undefined : value),
  dueDateSchema.optional()
);

const titleSchema = z
  .string({ required_error: 'O titulo e obrigatorio.', invalid_type_error: 'O titulo e obrigatorio.' })
  .trim()
  .min(1, 'O titulo e obrigatorio.')
  .max(200, 'O titulo deve ter no maximo 200 caracteres.');

const descriptionSchema = z
  .string()
  .max(5000, 'A descricao deve ter no maximo 5000 caracteres.')
  .nullable()
  .optional()
  .transform((value) => {
    if (value === null || value === undefined) return value;
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  });

const statusSchema = z.enum(['PENDENTE', 'CONCLUIDA'], {
  errorMap: () => ({ message: 'O status deve ser PENDENTE ou CONCLUIDA.' }),
});

const createTaskSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  dueDate: optionalDueDate,
  status: statusSchema.optional().default('PENDENTE'),
});

// Na edicao todos os campos sao opcionais, mas o titulo, se vier, continua valendo as regras.
const updateTaskSchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema,
    dueDate: optionalDueDate,
    status: statusSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, 'Envie ao menos um campo para atualizar.');

const listQuerySchema = z.object({
  search: z.string().trim().max(200).optional(),
  status: statusSchema.optional(),
});

const idSchema = z.coerce
  .number({ invalid_type_error: 'Identificador invalido.' })
  .int('Identificador invalido.')
  .positive('Identificador invalido.');

/** Lista as tarefas do usuario, com busca por titulo/descricao e filtro por status. */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { search, status } = listQuerySchema.parse(req.query);

    const tasks = await prisma.task.findMany({
      where: {
        userId: req.userId,
        ...(status && { status }),
        ...(search && {
          OR: [{ title: { contains: search } }, { description: { contains: search } }],
        }),
      },
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    });

    res.json({ tasks });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = idSchema.parse(req.params.id);

    // O filtro por userId impede ler a tarefa de outro usuario.
    const task = await prisma.task.findFirst({ where: { id, userId: req.userId } });
    if (!task) throw notFound('Tarefa nao encontrada.');

    res.json({ task });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = createTaskSchema.parse(req.body);

    const task = await prisma.task.create({
      data: { ...data, userId: req.userId },
    });

    res.status(201).json({ task });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const data = updateTaskSchema.parse(req.body);

    // O schema normaliza "" e null para undefined, o que o Prisma trataria como
    // "nao alterar". Se o cliente enviou dueDate explicitamente vazio, a intencao
    // e limpar a data - traduzimos isso para null.
    if ('dueDate' in req.body && data.dueDate === undefined) {
      data.dueDate = null;
    }

    // updateMany com userId no where: um id de outro usuario simplesmente nao
    // encontra nada, em vez de permitir a edicao (evita IDOR).
    const { count } = await prisma.task.updateMany({
      where: { id, userId: req.userId },
      data,
    });

    if (count === 0) throw notFound('Tarefa nao encontrada.');

    const task = await prisma.task.findFirst({ where: { id, userId: req.userId } });
    res.json({ task });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = idSchema.parse(req.params.id);

    const { count } = await prisma.task.deleteMany({ where: { id, userId: req.userId } });
    if (count === 0) throw notFound('Tarefa nao encontrada.');

    res.status(204).send();
  })
);

export default router;
