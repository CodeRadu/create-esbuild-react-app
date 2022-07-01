import { createRoot } from 'react-dom/client'
import React from 'react'

async function main() {
  const App = await (await import('./App')).default
  const root = createRoot(document.getElementById('root')!)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

main()
