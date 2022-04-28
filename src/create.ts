#! /usr/bin/env node
import { readdirSync } from 'fs'
import { copySync } from 'fs-extra'

if (readdirSync('.').length !== 0) {
  console.error('Error: CWD is not empty')
  process.exit(1)
}

console.log('Creating ESbuild React app...')
readdirSync(`${__dirname}/../skel`).forEach((file) =>
  copySync(`${__dirname}/../skel/${file}`, file)
)
console.log(
  'Done. Please run `npm install` and `npm run dev` to start the development server.'
)
