import { FastifyReply, FastifyRequest, FastifySchema } from 'fastify'
import { addEditor, deleteEditor } from '@/services/editor'
import { decodeToken } from '@/cryptography/jwt'
import {
  AuthenticationHeaders,
  authenticationSchema,
  extractToken,
} from '@/auth/headers'

interface PostBody {
  username: string
  password: string
}

const postSchema: FastifySchema = {
  ...authenticationSchema,
  body: {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: { type: 'string' },
      password: { type: 'string' },
    },
  },
}

/**
 * Handles the POST request for creating a new editor.
 *
 * @param request - The Fastify request object containing the headers and body.
 * @param reply - The Fastify reply object.
 * @returns A Promise that resolves to a FastifyReply.
 */
const postController = async (
  request: FastifyRequest<{ Headers: AuthenticationHeaders; Body: PostBody }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const { username, password } = request.body

  const result = await addEditor(username, password)

  return result.send(reply)
}

const deleteSchema: FastifySchema = authenticationSchema

/**
 * Deletes an editor.
 *
 * @param request - The Fastify request object.
 * @param reply - The Fastify reply object.
 * @returns A Promise that resolves to a FastifyReply.
 */
const deleteController = async (
  request: FastifyRequest<{ Headers: AuthenticationHeaders }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const token = extractToken(request)

  if (!token) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }

  const id = await decodeToken(token)

  const result = await deleteEditor(id)

  return result.send(reply)
}

export { postSchema, postController, deleteSchema, deleteController }
