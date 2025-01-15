import fs from 'node:fs'
import { addAbortSignal } from 'node:stream'

const controller = new AbortController()
setTimeout(() => controller.abort(), 1000)

const stream = addAbortSignal(
   controller.signal,
   fs.createReadStream('./src/object.json', { highWaterMark: 8 }),
)

function process(chunk: Buffer) {
   return new Promise((res) => {
      setTimeout(() => res(chunk.toString()), 100)
   })
}

;(async () => {
   try {
      for await (const chunk of stream) {
         const value = await process(chunk)
         console.log(value)
      }
   } catch (e) {
      if (e.name === 'AbortError') {
         console.log('Operation abort')
      } else {
         throw e
      }
   }
})()
