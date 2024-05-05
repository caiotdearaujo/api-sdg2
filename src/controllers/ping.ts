import { FastifyRequest, FastifyReply } from 'fastify'

const getController = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  return reply.send({ ping: 'pong' })
}

export { getController }
