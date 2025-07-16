import { useState, useRef, useEffect } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MoreHorizontal, GripVertical } from 'lucide-react'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Textarea } from './ui/textarea'
import AIEditMenu from './AIEditMenu'

interface Block {
  id: string
  content: string
  type: 'paragraph' | 'sentence'
  parentId?: string
}

interface WorkshopModeProps {
  content: string
  onContentChange: (content: string) => void
}

interface SortableBlockProps {
  block: Block
  onEdit: (id: string, content: string) => void
  onSplit: (id: string) => void
  onAIEdit: (id: string, action: string, customPrompt?: string) => void
  isExpanded: boolean
  sentences?: Block[]
}

const SortableBlock = ({ block, onEdit, onSplit, onAIEdit, isExpanded, sentences }: SortableBlockProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(block.content)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleSave = () => {
    onEdit(block.id, editContent)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditContent(block.content)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <div ref={setNodeRef} style={style} className="group">
      <div className="flex items-start gap-2 p-4 bg-[#1A1A1A] rounded-lg border border-gray-800 hover:border-gray-700 transition-colors">
        {/* Drag Handle and Menu */}
        <div className="flex flex-col items-center gap-1 mt-1">
          <button
            {...attributes}
            {...listeners}
            className="p-1 text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          
          <AIEditMenu
            onAction={(action, customPrompt) => onAIEdit(block.id, action, customPrompt)}
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto text-gray-500 hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            }
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                ref={textareaRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[100px] bg-[#2A2A2A] border-gray-700 text-gray-200 resize-none"
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="text-gray-200 leading-relaxed cursor-pointer"
              onClick={() => {
                if (block.type === 'paragraph') {
                  if (isExpanded) {
                    // If already expanded, start editing
                    setIsEditing(true)
                  } else {
                    // Split into sentences
                    onSplit(block.id)
                  }
                } else {
                  // For sentences, just edit
                  setIsEditing(true)
                }
              }}
            >
              {block.content}
            </div>
          )}

          {/* Expanded sentences */}
          {isExpanded && sentences && Array.isArray(sentences) && sentences.length > 0 && (
            <div className="mt-4 space-y-2 pl-4 border-l-2 border-[#3B82F6]">
              {sentences.map((sentence) => (
                <SortableBlock
                  key={sentence.id}
                  block={sentence}
                  onEdit={onEdit}
                  onSplit={onSplit}
                  onAIEdit={onAIEdit}
                  isExpanded={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const WorkshopMode = ({ content, onContentChange }: WorkshopModeProps) => {
  const [blocks, setBlocks] = useState<Block[]>(() => {
    try {
      if (!content || typeof content !== 'string') return []
      const paragraphs = content.split('\n\n').filter(p => p.trim())
      return paragraphs.map((paragraph, index) => ({
        id: `block-${index}`,
        content: paragraph.trim(),
        type: 'paragraph' as const
      }))
    } catch (error) {
      console.error('Error initializing blocks:', error)
      return []
    }
  })

  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set())
  const [sentences, setSentences] = useState<Record<string, Block[]>>({})

  // Update blocks when content changes from outside
  useEffect(() => {
    try {
      if (!content || typeof content !== 'string') return
      const paragraphs = content.split('\n\n').filter(p => p.trim())
      const newBlocks = paragraphs.map((paragraph, index) => ({
        id: `block-${index}`,
        content: paragraph.trim(),
        type: 'paragraph' as const
      }))
      
      // Only update if content actually changed
      const currentContent = blocks.map(b => b.content).join('\n\n')
      if (currentContent !== content) {
        setBlocks(newBlocks)
        setExpandedBlocks(new Set())
        setSentences({})
      }
    } catch (error) {
      console.error('Error updating blocks from content:', error)
    }
  }, [content, blocks])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active?.id && over?.id && active.id !== over.id) {
      setBlocks((items) => {
        if (!items || !Array.isArray(items)) return items
        
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        if (oldIndex === -1 || newIndex === -1) return items

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleEdit = (id: string, newContent: string) => {
    if (!blocks || !Array.isArray(blocks)) return
    
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, content: newContent } : block
    ))
    
    // Also update sentences if this is a sentence
    setSentences(prev => {
      const updated = { ...prev }
      Object.keys(updated).forEach(blockId => {
        if (updated[blockId] && Array.isArray(updated[blockId])) {
          updated[blockId] = updated[blockId].map(sentence =>
            sentence.id === id ? { ...sentence, content: newContent } : sentence
          )
        }
      })
      return updated
    })

    // Update main content
    setTimeout(() => updateMainContent(), 0)
  }

  const handleSplit = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId)
    if (!block) return

    if (expandedBlocks.has(blockId)) {
      // Collapse
      setExpandedBlocks(prev => {
        const next = new Set(prev)
        next.delete(blockId)
        return next
      })
    } else {
      // Expand - split into sentences
      const rawSentences = block.content
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0)

      const sentenceArray = rawSentences.map((sentence, index) => ({
        id: `${blockId}-sentence-${index}`,
        content: sentence + (index < rawSentences.length - 1 ? '.' : ''),
        type: 'sentence' as const,
        parentId: blockId
      }))

      setSentences(prev => ({
        ...prev,
        [blockId]: sentenceArray
      }))

      setExpandedBlocks(prev => new Set([...prev, blockId]))
    }
  }

  const handleAIEdit = async (blockId: string, action: string, customPrompt?: string) => {
    if (!blocks || !Array.isArray(blocks)) return
    
    const block = blocks.find(b => b.id === blockId) || 
                  Object.values(sentences || {}).flat().find(s => s?.id === blockId)
    
    if (!block) return

    // Here you would integrate with the Blink AI SDK
    // For now, we'll simulate the AI response
    let prompt = ''
    switch (action) {
      case 'reword':
        prompt = `Reword this text while keeping the semantic intent: "${block.content}"`
        break
      case 'refine':
        prompt = `Improve the style and preserve the meaning: "${block.content}"`
        break
      case 'shorten':
        prompt = `Make this text more concise: "${block.content}"`
        break
      case 'expand':
        prompt = `Add more depth and detail to this text: "${block.content}"`
        break
      case 'summarize':
        prompt = `Summarize this text while retaining core ideas: "${block.content}"`
        break
      case 'other':
        prompt = `${customPrompt}: "${block.content}"`
        break
    }

    // Simulate AI processing
    console.log('AI Edit:', { action, prompt, blockId })
    
    // You would replace this with actual Blink AI call:
    // const { text } = await blink.ai.generateText({ prompt })
    // handleEdit(blockId, text)
  }

  const updateMainContent = () => {
    if (!blocks || blocks.length === 0) return
    const newContent = blocks.map(block => block.content).join('\n\n')
    onContentChange(newContent)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={blocks?.map(b => b.id) || []} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {blocks && blocks.length > 0 ? blocks.map((block) => (
              <SortableBlock
                key={block.id}
                block={block}
                onEdit={handleEdit}
                onSplit={handleSplit}
                onAIEdit={handleAIEdit}
                isExpanded={expandedBlocks.has(block.id)}
                sentences={sentences[block.id] || []}
              />
            )) : (
              <div className="text-gray-400 text-center py-8">
                No content available. Switch to regular mode to add content.
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default WorkshopMode