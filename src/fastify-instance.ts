import fastify, { FastifyError, FastifyRequest, FastifyReply } from 'fastify'
import fastifyJwt from '@fastify/jwt'
import * as dotenv from 'dotenv'
import prisma from './prisma-instance'
import ConventionalReply from './reply-convention'

dotenv.config()

const server = fastify({ logger: true })
server.register(fastifyJwt, { secret: process.env.JWT_SECRET as string })

server.setErrorHandler(
  async (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    console.log(`
      Error: ${error.message}
      Method: ${request.method}
      URL: ${request.url}
      Body: ${request.body}
    `)

    return new ConventionalReply(500, {
      error: { message: 'Internal server error' },
    }).send(reply)
  }
)

server.addHook('onClose', async () => {
  prisma.$disconnect()
})

export default server
