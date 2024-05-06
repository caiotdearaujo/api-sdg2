import server from './fastify-instance'
import prisma from './prisma-instance'
import * as ping from './controllers/ping'
import * as editors from './controllers/editors'

server.get('/ping', ping.getController)

server.post('/editors', { schema: editors.postSchema }, editors.postController)

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
