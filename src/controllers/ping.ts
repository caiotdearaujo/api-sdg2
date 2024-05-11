import { FastifyRequest, FastifyReply } from 'fastify'

/**
 * Handles the GET request for the ping endpoint.
 *
 * @param {FastifyRequest} request - The Fastify request object.
 * @param {FastifyReply} reply - The Fastify reply object.
 * @returns {Promise<FastifyReply>} The Fastify reply object with the response.
 */
const getController = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  return reply.send({ ping: 'pong' })
}

export { getController }
