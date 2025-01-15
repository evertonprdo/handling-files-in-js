import fs from 'node:fs'
import path from 'node:path'

const readableStream = fs.createReadStream(
   path.join(import.meta.dirname, 'sample.txt'),
   { highWaterMark: 15 },
)

readableStream.on('data', (chunk) => {
   console.log(`Received: ${chunk.toString().split('\n')[0]}`)
   readableStream.pause()
   console.log('There will be no additional data for 1 second.\n')
   setTimeout(() => {
      console.log('Now data will start flowing again.\n')
      readableStream.resume()
   }, 1000)
})
