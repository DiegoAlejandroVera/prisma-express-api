import { Router } from 'express'
import prisma from '../utils/db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const SessionRouter = Router()

SessionRouter.post('/', async (req, res) => {
  const { username, password } = req.body
  const user = await prisma.user.findUnique({
    where: { username }
  })

  const passwordCorrect = user === null ? false : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return res.status(401).json({
      error: 'usuario o contraseña invalida'
    })
  }

  const userForToken = {
    username: user.username,
    id: user.id
  }

  const token = jwt.sign(userForToken, process.env.JWT_ACCESS_SECRET)

  res.status(200).send({ token, username: user.username, name: user.name })
})

export default SessionRouter
