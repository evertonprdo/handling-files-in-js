import http from 'node:http'
import path from 'node:path'
import fs from 'node:fs/promises'

export async function getImgBuffer(
   req: http.IncomingMessage,
   res: http.ServerResponse,
) {
   try {
      const faviconPath = path.join(process.cwd(), 'src', 'tmp', 'sample.png')
      const buffer = await fs.readFile(faviconPath)

      res.writeHead(200, { 'content-type': 'image/png' })
      res.end(buffer)
   } catch (error) {
      res.writeHead(500, { 'content-type': 'text/plain' })
      res.end()
   }
}

export async function getImgBase64(
   req: http.IncomingMessage,
   res: http.ServerResponse,
) {
   try {
      const faviconPath = path.join(process.cwd(), 'src', 'tmp', 'sample.png')
      const base64 = await fs.readFile(faviconPath, { encoding: 'base64' })

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ image: base64, type: 'image/png' }))
   } catch (error) {
      console.log(error)
      res.writeHead(500, { 'content-type': 'text/plain' })
      res.end()
   }
}
