import esbuild from 'esbuild'
import { readdirSync, copyFileSync, existsSync, rmSync } from 'fs'

export default function (args: string[], success: Function, error: Function) {
  if (existsSync('./dist')) rmSync('./dist', { recursive: true })
  console.log('Building for production...')
  esbuild
    .build({
      entryPoints: ['./src/index.tsx'],
      bundle: true,
      allowOverwrite: true,
      minify: true,
      outfile: './dist/index.js',
      platform: 'browser',
    })
    .catch((e) => {
      error(e)
    })
    .then(() => {
      if (existsSync('./public')) {
        console.log('Copying static files...')
        const publicFiles = readdirSync('./public')
        publicFiles.forEach((file) =>
          copyFileSync(`./public/${file}`, `./dist/${file}`)
        )
      } else console.log('No static files found.')
      success()
    })
}
