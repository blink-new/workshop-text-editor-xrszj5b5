import { useState } from 'react'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { FileText, Settings, User } from 'lucide-react'
import RegularEditor from './RegularEditor'
import WorkshopMode from './WorkshopMode'

const TextEditor = () => {
  const [isWorkshopMode, setIsWorkshopMode] = useState(false)
  const [content, setContent] = useState(`Welcome to the Workshop Mode Text Editor! This is a powerful tool for focused writing and editing.

This editor has two modes: Regular mode for standard text editing, and Workshop mode that breaks your text into interactive blocks for more focused editing.

In Workshop mode, each paragraph becomes a separate block that you can interact with individually. You can click on any block to break it down into sentences for even more granular editing.

Try switching to Workshop mode using the toggle above to see how your text transforms into interactive blocks that you can reorder, edit, and enhance with AI-powered suggestions.`)

  return (
    <div className="flex h-screen bg-[#0F0F0F]">
      {/* Sidebar */}
      <div className="w-80 bg-[#1A1A1A] border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-white">Workshop Editor</h1>
          </div>
          
          {/* Workshop Mode Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="workshop-mode" className="text-sm text-gray-300">
              Workshop Mode
            </Label>
            <Switch
              id="workshop-mode"
              checked={isWorkshopMode}
              onCheckedChange={setIsWorkshopMode}
            />
          </div>
        </div>

        {/* Documents List */}
        <div className="flex-1 p-4">
          <div className="space-y-2">
            <div className="p-3 bg-[#2A2A2A] rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium text-white mb-1">Current Document</h3>
              <p className="text-xs text-gray-400">Last edited 2 minutes ago</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">User</p>
              <p className="text-xs text-gray-400">Free Plan</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Document Header */}
        <div className="p-6 border-b border-gray-800">
          <input
            type="text"
            placeholder="Untitled Document"
            className="text-2xl font-semibold bg-transparent border-none outline-none text-white placeholder-gray-500 w-full"
          />
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-auto">
          {isWorkshopMode ? (
            <WorkshopMode content={content} onContentChange={setContent} />
          ) : (
            <RegularEditor content={content} onContentChange={setContent} />
          )}
        </div>
      </div>
    </div>
  )
}

export default TextEditor