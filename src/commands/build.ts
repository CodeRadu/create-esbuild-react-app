import esbuild from 'esbuild'
import { readdirSync, copyFileSync, existsSync, rmSync, readFileSync } from 'fs'
import { rm } from 'fs-extra'

const config = JSON.parse(readFileSync('./cer.config.json').toString())

export default function (args: string[], success: Function, error: Function) {
  if (existsSync('./dist')) rmSync('./dist', { recursive: true })
  const copyPaths = readdirSync('./src').filter(file => file.match(/.(css|scss|sass)$/))
  copyPaths.forEach(path => copyFileSync(`./src/${path}`, `./.cer/prebuild/${path}`))
  console.log('Building for production...')
  esbuild
    .build({
      entryPoints: [`./.cer/prebuild/index.js`],
      bundle: true,
      allowOverwrite: true,
      minify: true,
      platform: 'browser',
      outdir: './dist',
      splitting: true,
      chunkNames: "chunks/[ext]/[name]-[hash]",
      format: "esm",
      jsx: 'preserve'
    })
    .catch((e) => {
      error(e)
    })
    .then(async () => {
      if (existsSync('./public')) {
        console.log('Copying static files...')
        const publicFiles = readdirSync('./public')
        publicFiles.forEach((file) =>
          copyFileSync(`./public/${file}`, `./dist/${file}`)
        )
        try {
          await rm('./dist/dev.html')
        } catch (err) {

        }
      } else console.log('No static files found.')
      success()
    })
}
