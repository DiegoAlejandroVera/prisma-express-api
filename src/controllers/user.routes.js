import { Router } from 'express'
import bcrypt from 'bcrypt'
import prisma from '../utils/db.js'
import { userExtractor } from '../utils/middleware.js'

const UserRouter = Router()

UserRouter.get('/', async (req, res) => {
  const users = await prisma.user.findMany({
    include: { // Include relaciona las notas con el usuario
      notes: true
    }
  })

  const usersWithoutPassword = users.map(user => req.exclude(user, ['passwordHash']))
  res.json(usersWithoutPassword)
})

UserRouter.get('/:id', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: {
      notes: true
    }
  })

  if (!user) {
    return res.status(404).send({ error: 'usuario no encontrado' })
  }

  const userWithoutPassword = req.exclude(user, ['passwordHash'])

  res.json(userWithoutPassword)
})

UserRouter.post('/', async (req, res) => {
  const { username, name, password } = req.body

  if (!password) {
    return res.status(400).send({ error: 'ingrese una contraseña' })
  }

  const passwordHash = await bcrypt.hash(password, 10)

  try {
    const user = await prisma.user.create({
      data: {
        username,
        name,
        passwordHash,
        notes: {
          create: []
        }
      }
    })

    const userWithoutPassword = req.exclude(user, ['passwordHash'])
    res.status(201).json(userWithoutPassword)
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'username not available, try again' })
    }
  }
})

UserRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id }
    })
    res.status(204).send()
  } catch (error) {

  }
})

UserRouter.patch('/:id', userExtractor, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id }
  })

  if (!user) {
    return res.status(404).json({ error: 'usuario no encontrado' })
  }

  if (user.id !== req.user) {
    return res.status(401).json({ error: 'no autorizado' })
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: req.body.name
    }
  })

  res.status(200).json(updatedUser)
})

export default UserRouter
