import crypto from 'crypto'

export default function hashString(string) {
  return crypto.createHash('md5').update(string).digest('hex')
}
