import { FastifyRequest, FastifyReply, FastifySchema } from 'fastify'
import { login } from '@/services/editor'

interface PostBody {
  username: string
  password: string
}

const postSchema: FastifySchema = {
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
  const result = await login(username, password)
  return result.send(reply)
}

export { postSchema, postController }
