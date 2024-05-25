import fastify, { FastifyReply, FastifyRequest } from 'fastify'
import fastifyJwt from '@fastify/jwt'
import cors from '@fastify/cors'
import * as dotenv from 'dotenv'
import prisma from './prisma-instance'
import ConventionalReply from './reply-convention'

dotenv.config()

const server = fastify({ logger: true })
server.register(fastifyJwt, { secret: process.env.JWT_SECRET as string })
server.register(cors, { origin: '*' })

server.addHook(
  'onRequest',
  async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void | FastifyReply> => {
    const { method, url } = request
    const restrictedRoutes = await prisma.restrictedRoute.findMany()
    let route:
      | {
          id: number
          method: string
          url: string
          origins: string[]
        }
      | undefined

    for (const restrictedRoute of restrictedRoutes) {
      if (restrictedRoute.method === method && restrictedRoute.url === url) {
        route = restrictedRoute
        break
      }
    }

    if (!route) {
      return
    }

    const origin = request.headers.origin

    if (origin && route.origins.includes(origin)) {
      return
    }

    return new ConventionalReply(403, {
      error: { message: 'Forbidden' },
    }).send(reply)
  }
)

server.addHook('onClose', async () => {
  prisma.$disconnect()
})

export default server
