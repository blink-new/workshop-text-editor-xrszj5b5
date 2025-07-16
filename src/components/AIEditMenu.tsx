import { useState } from 'react'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Textarea } from './ui/textarea'
import { 
  RotateCcw, 
  Star, 
  Scissors, 
  Expand, 
  Lightbulb, 
  Edit3,
  Loader2
} from 'lucide-react'

interface AIEditMenuProps {
  onAction: (action: string, customPrompt?: string) => void
  trigger: React.ReactNode
}

const AIEditMenu = ({ onAction, trigger }: AIEditMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedAction, setSelectedAction] = useState<string | null>(null)

  const actions = [
    {
      id: 'reword',
      icon: RotateCcw,
      title: 'Reword',
      description: 'Alter words, keep semantic intent',
      color: 'hover:bg-gray-700'
    },
    {
      id: 'refine',
      icon: Star,
      title: 'Refine',
      description: 'Improve style, preserve meaning',
      color: 'hover:bg-gray-700'
    },
    {
      id: 'shorten',
      icon: Scissors,
      title: 'Shorten',
      description: 'Cut clutter, keep message',
      color: 'hover:bg-gray-700'
    },
    {
      id: 'expand',
      icon: Expand,
      title: 'Expand',
      description: 'Add depth, retain purpose',
      color: 'hover:bg-gray-700'
    },
    {
      id: 'summarize',
      icon: Lightbulb,
      title: 'Summarize',
      description: 'Condense, retain core ideas',
      color: 'hover:bg-gray-700'
    },
    {
      id: 'other',
      icon: Edit3,
      title: 'Other',
      description: 'Customize with any instruction',
      color: 'hover:bg-blue-600 border-blue-500',
      special: true
    }
  ]

  const handleActionClick = async (actionId: string) => {
    if (actionId === 'other') {
      setSelectedAction(actionId)
      return
    }

    setIsProcessing(true)
    try {
      await onAction(actionId)
      setIsOpen(false)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCustomSubmit = async () => {
    if (!customPrompt.trim()) return

    setIsProcessing(true)
    try {
      await onAction('other', customPrompt)
      setIsOpen(false)
      setCustomPrompt('')
      setSelectedAction(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleCustomSubmit()
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 bg-[#2A2A2A] border-gray-700" 
        align="start"
        side="right"
      >
        <div className="p-4">
          {selectedAction === 'other' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Edit3 className="w-4 h-4 text-blue-400" />
                <h3 className="font-medium text-white">Custom Instruction</h3>
              </div>
              
              <Textarea
                placeholder="What change do you want to make?"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[80px] bg-[#1A1A1A] border-gray-600 text-gray-200 placeholder-gray-500 resize-none"
                autoFocus
              />
              
              <div className="flex gap-2">
                <Button
                  onClick={handleCustomSubmit}
                  disabled={!customPrompt.trim() || isProcessing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedAction(null)
                    setCustomPrompt('')
                  }}
                  disabled={isProcessing}
                >
                  Back
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {actions.map((action) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleActionClick(action.id)}
                      disabled={isProcessing}
                      className={`
                        p-3 rounded-lg border border-gray-600 text-left transition-all
                        ${action.special ? 'border-blue-500' : 'border-gray-600'}
                        ${action.color}
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-4 h-4 ${action.special ? 'text-blue-400' : 'text-gray-400'}`} />
                        <span className="font-medium text-white text-sm">{action.title}</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-tight">
                        {action.description}
                      </p>
                    </button>
                  )
                })}
              </div>
              
              {isProcessing && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                  <span className="ml-2 text-sm text-gray-400">Processing...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default AIEditMenu