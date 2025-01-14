import fsPromises from 'node:fs/promises'
import path from 'node:path'

const dirPath = path.join(import.meta.dirname, 'tmp')
const filePath = path.join(dirPath, 'sample.png')

const buffer = await fsPromises.readFile(filePath)
const base64url = buffer.toString('base64url')

const newFileTextPath = path.join(dirPath, 'sample.txt')
const blobData = `data:image/png;base64,${base64url}`

await fsPromises.writeFile(newFileTextPath, blobData)

const blobReaderBuffer = await fsPromises.readFile(newFileTextPath, {
   encoding: 'utf-8',
})

async function saveFileFromObjectURL(data: string) {
   const regExp = /^data:([^;]+);base64,/
   const match = data.match(regExp)

   if (!match) {
      throw new Error()
   }

   const mimeType = match[1]
   const base64Data = data.split(',')[1]

   const [type, ext] = mimeType.split('/')

   if (type !== 'image') {
      throw new Error()
   }

   const newFile = path.join(dirPath, `${new Date().getTime()}.${ext}`)
   await fsPromises.writeFile(newFile, base64Data, { encoding: 'base64' })
}

await saveFileFromObjectURL(blobReaderBuffer)
