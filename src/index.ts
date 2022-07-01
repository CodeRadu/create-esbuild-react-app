#! /usr/bin/env node

import { readdirSync, readFileSync } from 'fs'
import fetch from 'node-fetch'

const command = process.argv[2]
const args = process.argv.slice(3)

function getCurrentVersion() {
  const packageJson = JSON.parse(readFileSync(`${__dirname}/../package.json`, 'utf8'))
  return packageJson.version
}

export function sleep(time = 1000) {
  return new Promise((r) => setTimeout(r, time))
}

function success() {
  console.log('Success')
}

function error(e: string) {
  console.error(e)
  console.log('Command failed successfully :)')
}

const commands = readdirSync(`${__dirname}/commands`)
if (!commands.includes(`${command}.js`)) {
  console.error(`Error: command ${command} not found`)
  process.exit(1)
}

import(`./commands/${command}.js`).then(async (cmd) => {
  await fetch("https://registry.npmjs.com/create-esbuild-react-app").then(res => res.json()).then(async (data) => {
    const latestVersion = data["dist-tags"].latest
    const currentVersion = getCurrentVersion()
    if (currentVersion !== latestVersion && !currentVersion.includes("dev")) {
      console.log(`New version ${latestVersion} available`)
      console.log(`Run: npm i create-esbuild-react-app@${latestVersion} to install it`)
      await sleep(3000)
    }
    cmd.default(args, success, error)
  })
})
