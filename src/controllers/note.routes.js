import { Router } from 'express'
import prisma from '../utils/db.js'
import { userExtractor } from '../utils/middleware.js'

const NoteRouter = Router()

NoteRouter.get('/', async (req, res) => {
  const notes = await prisma.note.findMany()

  res.json(notes)
})

NoteRouter.get('/:id', async (req, res) => {
  const note = await prisma.note.findUnique({
    where: { id: req.params.id }
  })

  if (!note) {
    return res.status(404).send({ error: 'la nota no se pudo encontrar' })
  }

  res.json(note)
})

NoteRouter.post('/', userExtractor, async (req, res) => {
  const body = req.body

  if (!req.user) {
    return res.status(401).json({ error: 'token invalido' })
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user }
  })

  try {
    const note = await prisma.note.create({
      data: {
        content: body.content,
        userId: user.id,
        important: body.important || false
      }
    })

    res.status(201).json(note)
  } catch (error) {
    res.status(500).send()
  }
})

NoteRouter.delete('/:id', userExtractor, async (req, res) => {
  const note = await prisma.note.findUnique({
    where: { id: req.params.id }
  })

  if (!note) {
    return res.status(404).send({ error: 'la nota no se pudo encontrar' })
  }

  if (note.userId !== req.user) {
    return res.status(401).json({ error: 'no autorizado' })
  }

  await prisma.note.delete({
    where: { id: note.id }
  })

  res.status(204).send()
})

NoteRouter.patch('/:id', userExtractor, async (req, res) => {
  const note = await prisma.note.findUnique({
    where: { id: req.params.id }
  })

  if (!note) {
    return res.status(404).send({ error: 'la nota no se pudo encontrar' })
  }

  if (note.userId !== req.user) {
    return res.status(401).json({ error: 'no autorizado' })
  }

  const updatedNote = await prisma.note.update({
    where: { id: note.id },
    data: { content: req.body.content }
  })

  res.status(200).json(updatedNote)
})

export default NoteRouter
