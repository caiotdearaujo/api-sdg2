import server from './fastify-instance'
import prisma from './prisma-instance'
import dotenv from 'dotenv'
import authByJWT from './auth/jwt'
import * as ping from './controllers/ping'
import * as editors from './controllers/editor'
import * as login from './controllers/login'
import * as questions from './controllers/questions'
import * as ranking from './controllers/ranking'

dotenv.config()

// /ping

server.get('/', ping.getController)
server.get('/ping', ping.getController)

// /editor

server.post(
  '/editor',
  { schema: editors.postSchema, preHandler: authByJWT },
  editors.postController
)

server.delete(
  '/editor',
  { schema: editors.deleteSchema, preHandler: authByJWT },
  editors.deleteController
)

// /login

server.post('/login', { schema: login.postSchema }, login.postController)

// /questions

server.get(
  '/questions',
  { schema: questions.getSchema },
  questions.getController
)

server.post(
  '/questions',
  { schema: questions.postSchema, preHandler: authByJWT },
  questions.postController
)

server.put(
  '/questions/:id',
  { schema: questions.putSchema, preHandler: authByJWT },
  questions.putController
)

server.delete(
  '/questions/:id',
  { schema: questions.deleteSchema, preHandler: authByJWT },
  questions.deleteController
)

// /ranking

server.get(
  '/ranking/:id',
  { schema: ranking.getByIdSchema },
  ranking.getByIdController
)

server.get('/ranking', { schema: ranking.getSchema }, ranking.getController)

server.post('/ranking', { schema: ranking.postSchema }, ranking.postController)

// server setup

const start = async () => {
  try {
    await prisma.$connect()
    await server.listen({
      port: process.env.PORT ? Number(process.env.PORT) : 3333,
    })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
