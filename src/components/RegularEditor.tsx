import { useRef, useEffect } from 'react'

interface RegularEditorProps {
  content: string
  onContentChange: (content: string) => void
}

const RegularEditor = ({ content, onContentChange }: RegularEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current && editorRef.current.textContent !== content) {
      editorRef.current.textContent = content
    }
  }, [content])

  const handleInput = () => {
    if (editorRef.current) {
      onContentChange(editorRef.current.textContent || '')
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className="min-h-[500px] text-gray-200 text-base leading-relaxed outline-none"
        style={{ whiteSpace: 'pre-wrap' }}
      >
        {content}
      </div>
    </div>
  )
}

export default RegularEditor