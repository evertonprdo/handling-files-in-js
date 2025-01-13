import { readFile, writeFile } from 'node:fs'
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

async function handleFile(req: IncomingMessage, res: Response) {
   const buffers: any = []

   for await (const chunk of req) {
      buffers.push(chunk)
   }

   const body = Buffer.concat(buffers).toString()

   const matches = body.match(/^data:(.+);base64,(.+)$/)
   if (!matches) {
      throw new Error('Formato Base64 inválido')
   }

   const type = matches[1].split('/')[1]
   const contentBase64 = matches[2]

   const buffer = Buffer.from(contentBase64, 'base64')
   const imageName = `${new Date().getTime()}.${type}`

   writeFile(
      path.join(import.meta.dirname, 'tmp', imageName),
      buffer,
      (err) => err && console.log(err),
   )

   res.end(imageName)
}

function getImage(req: IncomingMessage, res: Response) {
   const paths = req.url?.split('/')!
   const imgName = paths[paths.length - 1]

   const filePath = path.join(import.meta.dirname, 'tmp', imgName)
   readFile(filePath, (err, data) => {
      if (err) {
         res.writeHead(500, { 'content-type': 'text/plain' })
         res.end()
         console.log(err)
      }

      const ext = path.extname(imgName).toLowerCase()
      const mimeType =
         {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
         }[ext] || 'application/octet-stream'

      res.writeHead(200, { 'content-type': mimeType })
      res.end(data)
   })
}

function getSsrComponent(req: IncomingMessage, res: Response) {
   const filePath = path.join(import.meta.dirname, 'component.html')
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

const server = createServer(async (req, res) => {
   const regex = /\/images\//
   if (regex.test(req.url!)) {
      return getImage(req, res)
   }

   if (req.url === '/get-ssr-component') {
      getSsrComponent(req, res)
      return
   }

   if (req.method === 'GET') {
      return getIndex(req, res)
   }

   if (req.method === 'POST') {
      await handleFile(req, res)
      return
   }

   res.writeHead(404)
   res.end()
})

server.listen(3333, () => console.log('Server on!'))
