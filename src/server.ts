import server from './fastify-instance'
import prisma from './prisma-instance'
import * as ping from './controllers/ping'
import * as editors from './controllers/editor'
import * as login from './controllers/login'

// ping
server.get('/ping', ping.getController)

// editors
server.post('/editor', { schema: editors.postSchema }, editors.postController)
server.delete(
  '/editor',
  { schema: editors.deleteSchema },
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
