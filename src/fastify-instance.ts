import fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import * as dotenv from 'dotenv'

dotenv.config()

const server = fastify({ logger: true })
server.register(fastifyJwt, { secret: process.env.JWT_SECRET as string })

export default server
