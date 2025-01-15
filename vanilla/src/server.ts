import fs from 'node:fs'
import path from 'node:path'

/**
 * The script reads and splits the file 'sample.csv' by line, using '\n' as the limit, each line of buffer is converted to string and put in an array.
 *
 * The script uses a Readable Stream with very low highWaterMark, to force the script to deal with different problems, which are:
 * - no boundary found in the chunk;
 * - more than one boundary found in the chunk;
 * - missing the last boundary
 *
 * To deal with no boundary found in the chunk: a cache of the unprocessed bytes between the read chunks is used.
 * To deal with more than one boundary found in the chunk: a recursive function is used. Each limit triggers the callback that receives the line and calls the function again, until there are no more limits.
 * To deal with missing the last boundary, in the 'end' event, unprocessedBytes is called with the callback if length > 0
 *
 * Note: The script doesn't handle a double quotes string
 */

const initOfScript = new Date().getTime()

const filePath = path.join(import.meta.dirname, 'sample.csv')
const readableCsv = fs.createReadStream(filePath, { highWaterMark: 8 })

const lines: string[] = []
let unprocessedBytes: Buffer = Buffer.alloc(0)

function handleNewLine(line: string) {
   lines.push(line)
}

readableCsv.on('readable', function () {
   let chunk: Buffer

   function handleBoundary(
      prev: Buffer,
      next: Buffer,
      callback: (line: string) => void,
   ) {
      const boundary = 10
      const boundaryIndex = next.findIndex((byte) => byte === boundary)

      if (boundaryIndex >= 0) {
         const beforeBoundary = next.subarray(0, boundaryIndex)
         const afterBoundary = next.subarray(boundaryIndex + 1)

         const line = Buffer.concat([prev, beforeBoundary]).toString()
         callback(line)

         prev = Buffer.alloc(0)
         next = afterBoundary

         return handleBoundary(prev, next, callback)
      }

      next = Buffer.concat([prev, next])
      prev = Buffer.alloc(0)

      return next
   }

   while ((chunk = this.read()) !== null) {
      const remainingBuffer = handleBoundary(
         unprocessedBytes,
         chunk,
         handleNewLine,
      )

      unprocessedBytes = remainingBuffer
   }
})

readableCsv.on('end', () => {
   const line = unprocessedBytes.toString()
   if (line.length > 0) {
      handleNewLine(line)
   }

   console.log(lines)
   const endOfScript = new Date().getTime()

   console.log('\n============= end =============\n')
   console.log('Running time: ', `${endOfScript - initOfScript}ms`)
})
