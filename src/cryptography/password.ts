import bcrypt from 'bcrypt'

/**
 * Encrypts a password using bcrypt.
 *
 * @param password - The password to be encrypted.
 * @returns A promise that resolves to the encrypted password.
 */
const encryptPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10)
}

export { encryptPassword }
