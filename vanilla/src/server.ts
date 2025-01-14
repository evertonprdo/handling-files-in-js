import fsPromises from 'node:fs/promises'
import path from 'node:path'

const dirPath = path.join(import.meta.dirname, 'tmp')
const filePath = path.join(dirPath, 'sample.png')

const buffer = await fsPromises.readFile(filePath)
const base64url = buffer.toString('base64url')

const newFilePath = path.join(dirPath, 'test.png')
await fsPromises.writeFile(newFilePath, base64url, { encoding: 'base64url' })
