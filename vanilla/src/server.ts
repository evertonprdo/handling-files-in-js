import fsPromises from 'node:fs/promises'
import path from 'node:path'

const dirPath = path.join(import.meta.dirname, 'tmp')
await fsPromises.mkdir(dirPath, { recursive: true })

for (let i = 0; i < 5; i++) {
   const filePath = path.join(dirPath, `sample-${i}.txt`)
   await fsPromises.writeFile(filePath, 'Hello', {
      encoding: 'utf-8',
   })
}

const filesInDir = await fsPromises.readdir(dirPath)

for (const fileName of filesInDir) {
   const filePath = path.join(dirPath, fileName)
   await fsPromises.appendFile(filePath, ' World!', { encoding: 'utf-8' })
}
