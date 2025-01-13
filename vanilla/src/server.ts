import { readFile } from 'node:fs'
import { createServer } from 'node:http'
import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'

type Response = ServerResponse<IncomingMessage> & {
   req: IncomingMessage
}

function getIndex(req: IncomingMessage, res: Response) {
   const filePath = path.join(import.meta.dirname, 'index.html')

   readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
         res.writeHead(500, { 'content-type': 'text/plain' })
         res.end()
         console.log(err)
      }

      res.writeHead(200, { 'content-type': 'text/html' })
      res.end(data)
   })
}

function getFavicon(req: IncomingMessage, res: Response) {
   const filePath = path.join(process.cwd(), 'public', 'favicon.ico')

   readFile(filePath, (err, data) => {
      if (err) {
         res.writeHead(404, { 'content-type': 'text/plain' })
         res.end('Favicon not found')
         return
      }

      res.writeHead(200, { 'content-type': 'image/x-icon' })
      res.end(data)
   })
}

const server = createServer(async (req, res) => {
   if (req.method === 'GET' && req.url === '/') {
      getIndex(req, res)
      return
   }

   if (req.method === 'GET' && req.url === '/favicon.ico') {
      getFavicon(req, res)
      return
   }

   res.writeHead(404)
   res.end()
})

server.listen(3333, () => console.log('Server on!'))
