import bcrypt from 'bcrypt'

const encryptPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10)
}

export { encryptPassword }
