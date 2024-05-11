import server from './fastify-instance'
import prisma from './prisma-instance'
import authByJWT from './auth/jwt'
import * as ping from './controllers/ping'
import * as editors from './controllers/editor'
import * as login from './controllers/login'
import * as questions from './controllers/questions'
import authByTOTP from './auth/totp'

// ping
server.get('/ping', ping.getController)

// editors
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

// login
server.post('/login', { schema: login.postSchema }, login.postController)

// questions
server.get(
  '/questions',
  { schema: questions.getSchema, preHandler: authByTOTP },
  questions.getController
)

// server setup
const start = async () => {
  try {
    await prisma.$connect()
    await server.listen({ port: 3000 })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
