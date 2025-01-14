import http from 'node:http'
import path from 'node:path'
import fs from 'node:fs/promises'

export async function handleBinaryImg(
   req: http.IncomingMessage,
   res: http.ServerResponse,
) {
   const buffers: Buffer[] = []

   for await (const chunk of req) {
      buffers.push(chunk)
   }

   const contentType = req.headers['content-type']

   if (!contentType) {
      res.writeHead(400, { 'content-type': 'text/plain' })
      res.end('Missing Content-Type')
      return
   }

   const [type, ext] = contentType.split('/')
   if (type !== 'image') {
      res.writeHead(400, { 'content-type': 'text/plain' })
      res.end('Only support image/*')
      return
   }

   const body = Buffer.concat(buffers)

   const dirPath = path.join(process.cwd(), 'src', 'tmp')
   const filePath = path.join(dirPath, `${new Date().getTime()}.${ext}`)

   await fs.mkdir(dirPath, { recursive: true })
   await fs.writeFile(filePath, body)

   res.end()
}

export async function handleBase64Img(
   req: http.IncomingMessage,
   res: http.ServerResponse,
) {
   const buffers: Buffer[] = []

   for await (const chunk of req) {
      buffers.push(chunk)
   }

   const { image, type, name } = JSON.parse(Buffer.concat(buffers).toString())

   const regex = /^image\/(png|jpeg|gif|webp|bmp)$/
   const matches = type.match(regex)

   if (!matches) {
      res.writeHead(400, { 'content-type': 'text/plain' })
      res.end('Only support image/(png|jpeg|gif|webp|bmp)')
      return
   }

   const ext = matches[1]

   const dirPath = path.join(process.cwd(), 'src', 'tmp')
   const filePath = path.join(dirPath, `${new Date().getTime()}-${name}.${ext}`)

   await fs.mkdir(dirPath, { recursive: true })
   await fs.writeFile(filePath, image, { encoding: 'base64' })

   res.end()
}
