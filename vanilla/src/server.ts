import http from 'node:http'
import path from 'node:path'
import fs from 'node:fs/promises'

import { ProcessCSV } from './utils/process-csv.ts'

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

const server = http.createServer(async (request, response) => {
   if (request.url === '/' && request.method === 'GET') {
      return index(request, response)
   }

   if (request.url === '/favicon.ico' && request.method === 'GET') {
      return favicon(request, response)
   }

   const contentType = request.headers['content-type']

   if (contentType !== 'text/csv') {
      response.writeHead(400, { message: 'Only text/csv' })
      response.end()
      return
   }

   const processCSV = new ProcessCSV(request)
   const result = await processCSV.run()

   response.writeHead(200)
   response.end(JSON.stringify(result))
})

server.listen(3333, () => console.log('Server running'))
