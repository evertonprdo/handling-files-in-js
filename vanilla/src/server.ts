import fs from 'node:fs'
import path from 'node:path'

const readableStream = fs.createReadStream(
   path.join(import.meta.dirname, 'sample.txt'),
   { highWaterMark: 15 },
)

const chunks: Buffer[] = []

readableStream.on('readable', () => {
   let chunk: Buffer
   while (null !== (chunk = readableStream.read(8))) {
      console.log('Read: ' + chunk.toString())
      chunks.push(chunk)
   }
})

readableStream.on('end', () => {
   console.log(`\nResult:\n${Buffer.concat(chunks).toString()}`)
})
