import http from 'node:http'
import path from 'node:path'
import fs from 'node:fs/promises'

export async function handleFormData(
   req: http.IncomingMessage,
   res: http.ServerResponse,
) {
   const buffers: Buffer[] = []

   for await (const chunk of req) {
      buffers.push(chunk)
   }

   const contentType = req.headers['content-type']
   const boundary = '--' + contentType?.split('boundary=')[1]

   const body = Buffer.concat(buffers).toString()

   const parts = body
      .split(boundary)
      .filter((part) => part.trim() !== '' && part !== '--\r\n')

   for (const part of parts) {
      const [headers, data] = part.split('\r\n\r\n')
      const headerLines = headers.split('\r\n')
      const contentDisposition = headerLines.find((line) =>
         line.startsWith('Content-Disposition'),
      )!

      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/)!

      if (!filenameMatch) {
         continue
      }

      const filename = filenameMatch[1]
      const fileData = data.split('\r\n')[0]
      const fileBuffer = Buffer.from(fileData, 'binary')

      const dirPath = path.join(import.meta.dirname, 'tmp')
      const filePath = path.join(dirPath, `${new Date().getTime()}-${filename}`)

      console.log(fileData)

      await fs.mkdir(dirPath, { recursive: true })
      await fs.writeFile(filePath, fileBuffer)
   }

   res.end()
}
