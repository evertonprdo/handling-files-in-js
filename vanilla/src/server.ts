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

function handleFile(req: IncomingMessage, res: Response) {}

const server = createServer((req, res) => {
   if (req.method === 'GET') {
      return getIndex(req, res)
   }

   if (req.method === 'POST') {
   }

   res.writeHead(404)
   res.end()
})

server.listen(3333, () => console.log('Server on!'))
