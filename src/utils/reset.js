import { Router } from 'express'
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()
const resetRouter = Router()

resetRouter.post('/', async (req, res) => {
  const deleteUsers = prisma.user.deleteMany()
  const deleteNotes = prisma.note.deleteMany()

  await prisma.$transaction([deleteNotes, deleteUsers])

  res.status(200).send({message: 'datos eliminados satisfactoriamente'})
})


export default resetRouter