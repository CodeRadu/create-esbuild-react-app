import esbuild from 'esbuild'
import { existsSync } from 'fs'
import chokidar from 'chokidar'
import { copy, copyFileSync, readFileSync } from 'fs-extra'
import express from 'express'
import { Server } from 'socket.io'
import { join } from 'path'
import http from 'http'
const server = express()
const httpServer = http.createServer(server)
const io = new Server(httpServer)

const config = JSON.parse(readFileSync('./cer.config.json').toString())

function build(success: Function, fail: Function) {
  esbuild
    .build({
      entryPoints: [`./src/index.${config.lang}`],
      bundle: true,
      allowOverwrite: true,
      outfile: './.cer/index.js',
      platform: 'browser',
      logLevel: 'warning',
      format: "esm",

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
      res.sendFile(join(process.cwd(), '.cer', "dev.html"))
      return
    }
    if (isFile(req.url)) {
      res.sendFile(join(process.cwd(), '.cer', req.url))
    } else {
      res.sendFile(join(process.cwd(), '.cer', "dev.html"))
    }
  })

  console.log('Building app')

  build(
    () => {
      console.log('App built')
    },
    (e: string) => { }
  )
  if (existsSync('./public')) {
    copy('./public', './.cer')
  }
  chokidar.watch('./src').on('all', () => {
    console.clear()
    console.log('File change detected. Rebuilding app')
    console.log(`Url: http://localhost:${process.env.PORT || 3000}`)
    if (!existsSync("./public/dev.html")) {
      copyFileSync(join(__dirname, '../../', 'skel', config.template, 'public', 'dev.html'), `./public/dev.html`)
    }
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
  chokidar.watch('./public').on('all', async () => {
    try {
      await copy('./public', './.cer')
    } catch (err) { }
    io.emit('reload')
  })
  httpServer.listen(process.env.PORT || 3000)
}
