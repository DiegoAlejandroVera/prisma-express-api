import express from 'express'
import UserRouter from './controllers/user.routes.js'
import NoteRouter from './controllers/note.routes.js'
import resetRouter from './utils/reset.js'
import { errorHandler, excludePassword, tokenExtractor } from './utils/middleware.js'
import SessionRouter from './controllers/session.routes.js'
import cors from 'cors'
import dotenv from 'dotenv'
import 'express-async-errors'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())
app.use(excludePassword)
app.use(tokenExtractor)
app.use('/api/users', UserRouter)
app.use('/api/notes', NoteRouter)
app.use('/reset', resetRouter)
app.use('/login', SessionRouter)
app.use(errorHandler)

export default app
