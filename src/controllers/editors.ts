import { FastifyReply, FastifyRequest } from 'fastify'
import { addEditor, deleteEditor } from '@/db/editors'
import { decodeToken } from '@/cryptography/jwt'
import { extractToken } from '@/auth/headers'

interface PostBody {
  username: string
  password: string
}

const postSchema = {
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
  request: FastifyRequest<{ Body: PostBody }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const { username, password } = request.body
  const result = await addEditor(username, password)
  return result.send(reply)
}

interface DeleteHeaders {
  authorization: string
}

const deleteSchema = {
  headers: {
    type: 'object',
    required: ['authorization'],
    properties: {
      authorization: { type: 'string' },
    },
  },
}

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
