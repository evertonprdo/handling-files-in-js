import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'

async function index(req: http.IncomingMessage, res: http.ServerResponse) {
   try {
      const htmlPath = path.join(import.meta.dirname, 'index.html')
      const html = await fs.readFile(htmlPath, { encoding: 'utf-8' })

      res.writeHead(200, { 'content-type': 'text/html' })
      res.end(html)
   } catch (error) {
      res.writeHead(500, { 'content-type': 'text/plain' })
      res.end()
   }
}

async function favicon(req: http.IncomingMessage, res: http.ServerResponse) {
   try {
      const faviconPath = path.join(process.cwd(), 'public', 'favicon.ico')
      const buffer = await fs.readFile(faviconPath)

      res.writeHead(200, { 'content-type': 'image/x-icon' })
      res.end(buffer)
   } catch (error) {
      res.writeHead(500, { 'content-type': 'text/plain' })
      res.end()
   }
}

async function getImgBuffer(
   req: http.IncomingMessage,
   res: http.ServerResponse,
) {
   try {
      const faviconPath = path.join(import.meta.dirname, 'tmp', 'sample.png')
      const buffer = await fs.readFile(faviconPath)

      res.writeHead(200, { 'content-type': 'image/png' })
      res.end(buffer)
   } catch (error) {
      res.writeHead(500, { 'content-type': 'text/plain' })
      res.end()
   }
}

async function getImgBase64(
   req: http.IncomingMessage,
   res: http.ServerResponse,
) {
   try {
      const faviconPath = path.join(import.meta.dirname, 'tmp', 'sample.png')
      const base64 = await fs.readFile(faviconPath, { encoding: 'base64' })

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ image: base64, type: 'image/png' }))
   } catch (error) {
      console.log(error)
      res.writeHead(500, { 'content-type': 'text/plain' })
      res.end()
   }
}

const server = http.createServer((req, res) => {
   if (req.url === '/' && req.method === 'GET') {
      return index(req, res)
   }

   if (req.url === '/favicon.ico' && req.method === 'GET') {
      return favicon(req, res)
   }

   if (req.url === '/image-buffer' && req.method === 'GET') {
      return getImgBuffer(req, res)
   }

   if (req.url === '/image-base64' && req.method === 'GET') {
      return getImgBase64(req, res)
   }

   res.writeHead(404)
   res.end()
})

server.listen(3333, () => console.log('Server running!'))
