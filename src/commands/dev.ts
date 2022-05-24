import esbuild from 'esbuild'
import { existsSync } from 'fs'
import chokidar from 'chokidar'
import { copy, readFileSync } from 'fs-extra'
import express from 'express'
import { Server } from 'socket.io'
import { join } from 'path'
import http from 'http'
const server = express()
const httpServer = http.createServer(server)
const io = new Server(httpServer)

const config=JSON.parse(readFileSync('./cer.config.json').toString())

function build(success: Function, fail: Function) {
  esbuild
    .build({
      entryPoints: [`./src/index.${config.lang}`],
      bundle: true,
      allowOverwrite: true,
      outfile: './.cer/index.js',
      platform: 'browser',
      logLevel: 'warning',
    })
    .then(() => {
      success()
    })
    .catch((e) => {
      fail(e)
    })
}

export default function (args: string[]) {
  const isFile = (name: string) => {
    return existsSync(join(process.cwd(), '.cer', name))
  }

  console.clear()

  console.log(
    `Starting dev server at http://localhost:${process.env.PORT || 3000} ...`
  )

  server.use((req, res) => {
    if (req.url == '/') {
      res.sendFile(join(__dirname, '../../', 'dev.html'))
      return
    }
    if (isFile(req.url)) {
      res.sendFile(join(process.cwd(), '.cer', req.url))
    } else {
      res.sendFile(join(__dirname, '../../', 'dev.html'))
    }
  })

  console.log('Building app')

  build(
    () => {
      console.log('App built')
    },
    (e: string) => {}
  )
  if (existsSync('./public')) {
    copy('./public', './.cer')
  }
  chokidar.watch('./src').on('all', () => {
    console.clear()
    console.log('File change detected. Rebuilding app')
    console.log(`Url: http://localhost:${process.env.PORT || 3000}`)
    if (existsSync('./dev.html'))
      console.warn('Warn: dev.html is no longer used by cer. You can remove it')
    build(
      () => {
        setTimeout(() => {
          io.emit('reload')
        }, 50)
      },
      (e: string) => {
        io.emit('error', e)
      }
    )
  })
  httpServer.listen(process.env.PORT || 3000, "0.0.0.0")
}
