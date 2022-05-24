#! /usr/bin/env node
import { readdirSync } from 'fs'
import { copySync } from 'fs-extra'

let template='default'

const args = process.argv.slice(2)

for(const arg of args) {
  if(arg=="--template" || arg=="-t"){
    template = args[args.indexOf(arg)+1]
  }
  if(arg=="--help" || arg=="-h"){
    console.log("Usage: [--template <template>]")
    process.exit(0)
  }
}

if (readdirSync('.').length !== 0) {
  console.error('Error: CWD is not empty')
  process.exit(1)
}

console.log(`Creating ESbuild React app with ${template} template...`)
readdirSync(`${__dirname}/../skel/${template}`).forEach((file) =>
  copySync(`${__dirname}/../skel/${template}/${file}`, file)
)
console.log(
  'Done. Please run `npm install` and `npm run dev` to start the development server.'
)
