import { useState } from 'react'
import { createClient } from '@blinkdotnew/sdk'
import TextEditor from './components/TextEditor'

const blink = createClient({
  projectId: 'workshop-text-editor-xrszj5b5',
  authRequired: true
})

function App() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <TextEditor />
    </div>
  )
}

export default App