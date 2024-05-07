import server from './fastify-instance'
import prisma from './prisma-instance'
import * as ping from './controllers/ping'
import * as editors from './controllers/editor'
import * as login from './controllers/login'
import authByJWT from './auth/jwt'

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
