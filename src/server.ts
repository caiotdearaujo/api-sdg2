import server from './fastify-instance'
import * as ping from './controllers/ping'

server.get('/ping', ping.getController)

const start = async () => {
  try {
    await server.listen({ port: 3000 })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
