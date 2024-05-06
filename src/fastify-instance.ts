import fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import * as dotenv from 'dotenv'
import prisma from './prisma-instance'

dotenv.config()

const server = fastify({ logger: true })
server.register(fastifyJwt, { secret: process.env.JWT_SECRET as string })

server.addHook('onClose', async () => {
  prisma.$disconnect()
})

export default server
