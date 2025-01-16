import fs from 'node:fs'
import http from 'node:http'

/**
 * The `ProcessCSV` class is designed to read and process CSV files in a streaming manner.
 * It parses the CSV data chunk by chunk, handling special cases like double-quoted fields
 * and line breaks. The class provides a result in a two-dimensional array format, where
 * each sub-array represents a row in the CSV.
 */
export class ProcessCSV {
   private readonly STREAM: fs.ReadStream | http.IncomingMessage
   private readonly DOUBLEQUOTE = 34 // ASCII code for the double-quote character (").
   private readonly LINE_FEED = 10 // ASCII code for the line feed character (\n).
   private readonly COMMA = 44 // ASCII code for the comma character (,).

   private unprocessedBytes = Buffer.alloc(0)
   private currentLine = 0

   private _result: string[][] = [[]]

   get result() {
      return this._result
   }

   constructor(stream: fs.ReadStream | http.IncomingMessage) {
      this.STREAM = stream
   }

   /**
    * Starts the CSV processing. Reads data from the stream and processes it.
    * @returns A promise that resolves with the parsed CSV data as a two-dimensional array.
    */
   public run() {
      return new Promise<string[][]>((resolve, reject) => {
         console.log('init')
         this.STREAM.on('readable', this.handleOnReadable.bind(this))

         this.STREAM.on('end', () => this.handleOnEnd(resolve))
         this.STREAM.on('error', (err) => reject(err))
      })
   }

   private handleOnReadable() {
      let chunk: Buffer

      while ((chunk = this.STREAM.read()) !== null) {
         this.processChunk(chunk)
      }
   }

   private processChunk(chunk: Buffer) {
      let isBetweenDoublequote = false
      const p = { lastBreakIndex: 0 } // p is a pseudo-pointer for lastBreakIndex

      if (this.unprocessedBytes.length > 0) {
         chunk = Buffer.concat([this.unprocessedBytes, chunk])
         this.unprocessedBytes = Buffer.alloc(0)
      }

      for (let i = 0; i < chunk.byteLength; i++) {
         if (chunk[i] === this.DOUBLEQUOTE) {
            isBetweenDoublequote = !isBetweenDoublequote
         }

         if (isBetweenDoublequote) {
            continue
         }

         if (chunk[i] === this.COMMA) {
            this.handleBreakIndex(chunk, i, p)
         }

         if (chunk[i] === this.LINE_FEED) {
            this.handleBreakIndex(chunk, i, p)
         }
      }

      if (p.lastBreakIndex > 0) {
         this.unprocessedBytes = Buffer.concat([
            this.unprocessedBytes,
            chunk.subarray(p.lastBreakIndex + 1),
         ])
      } else {
         this.unprocessedBytes = chunk
      }
   }

   private handleBreakIndex(
      chunk: Buffer,
      breakIndex: number,
      p: { lastBreakIndex: number },
   ) {
      const newCell = chunk.subarray(p.lastBreakIndex, breakIndex).toString()
      this.handleNewCell(newCell)

      p.lastBreakIndex = breakIndex

      if (chunk[breakIndex] === this.LINE_FEED) {
         this.result.push([])
         this.currentLine++
      }
   }

   private handleOnEnd(resolve: (value: string[][]) => void) {
      const cell = this.unprocessedBytes.toString()
      if (cell.length > 0) {
         this.handleNewCell(cell)
      }

      resolve(this._result)
      console.log('end')
   }

   private handleNewCell(cell: string) {
      if (cell[0] === ',' || cell[0] === '\n') {
         cell = cell.substring(1)
      }

      this.result[this.currentLine].push(cell)
   }
}
