#! /usr/bin/env node

import { readdirSync } from 'fs'

const command = process.argv[2]
const args = process.argv.slice(3)

function success() {
  console.log('Success')
}

function error(e: string) {
  console.error(e)
  console.log('Command failed successfully :)')
  process.exit(1)
}

const commands = readdirSync(`${__dirname}/commands`)
if (!commands.includes(`${command}.js`)) {
  console.error(`Error: command ${command} not found`)
  process.exit(1)
}

import(`./commands/${command}.js`).then((data) => {
  data.default(args, success, error)
})
