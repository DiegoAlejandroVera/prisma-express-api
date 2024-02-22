import jwt from 'jsonwebtoken'

const exclude = (user, keys) => {
  return Object.fromEntries(Object.entries(user).filter(([key]) => !keys.includes(key)))
}

export const excludePassword = (req, res, next) => {
  req.exclude = exclude
  next()
}

export const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')

  if (authorization && authorization.startsWith('Bearer ')) {
    req.token = authorization.replace('Bearer ', '')
  }

  next()
}

export const userExtractor = (req, res, next) => {
  const decodedToken = jwt.verify(req.token, process.env.JWT_ACCESS_SECRET)
  req.user = decodedToken.id

  next()
}

export const errorHandler = (error, req, res, next) => {
  console.log(error.message)

  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: error.message })
  } else if (error.code === 'P2002') {
    return res.status(400).json({ error: 'debe ingresar el contenido' })
  } else if (error.code === 'P2025') {
    res.status(400).json({ error: 'el usuario que intenta eliminar no existe' })
  }

  next(error)
}
