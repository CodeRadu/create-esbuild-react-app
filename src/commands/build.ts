import esbuild from 'esbuild'

export default function (args: string[], success: Function, error: Function) {
  console.log('Building for production...')
  esbuild
    .build({
      entryPoints: ['./src/index.tsx'],
      bundle: true,
      minify: true,
      allowOverwrite: true,
      outfile: './dist/index.js',
      platform: 'browser',
    })
    .catch((e) => {
      error(e)
    })
    .then(() => {
      success()
    })
}
