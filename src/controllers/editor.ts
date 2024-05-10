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

const postController = async (
  request: FastifyRequest<{ Headers: AuthenticationHeaders; Body: PostBody }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const { username, password } = request.body
  const result = await addEditor(username, password)
  return result.send(reply)
}

type DeleteHeaders = AuthenticationHeaders

const deleteSchema: FastifySchema = authenticationSchema

const deleteController = async (
  request: FastifyRequest<{ Headers: DeleteHeaders }>,
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
