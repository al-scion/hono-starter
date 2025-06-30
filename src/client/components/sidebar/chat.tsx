import { Messages } from "@/components/chat/messages"
import { useStore } from "@/lib/state"
import { cn } from "@/lib/utils"
import { create } from "zustand"
import { useHotkeys } from "react-hotkeys-hook"
import { useCallback, useRef, useState } from "react"

export const useChatStore = create<{
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  toggleOpen: () => void
  width: string
  setWidth: (width: string) => void
}>((set) => ({
  isOpen: true,
  setIsOpen: (isOpen) => set({ isOpen }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  width: '360px',
  setWidth: (width) => set({ width })
}))

export function Chat({className, ...props}: React.ComponentProps<'div'>) {
  const { chatId } = useStore()
  const { isOpen, width, toggleOpen, setWidth } = useChatStore()
  const [isDragging, setIsDragging] = useState(false)
  const [isPointerDown, setIsPointerDown] = useState(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)

  useHotkeys('bracketright', () => toggleOpen(), {
    preventDefault: true,
  })

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    setIsPointerDown(true)
    startXRef.current = e.clientX
    startWidthRef.current = parseInt(width.replace('px', ''), 10)
    
    // Capture the pointer to ensure we receive all pointer events
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [width])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPointerDown) return
    
    const deltaX = Math.abs(startXRef.current - e.clientX)
    
    // Start dragging if moved more than 5 pixels
    if (!isDragging && deltaX > 5) {
      setIsDragging(true)
    }
    
    if (isDragging) {
      e.preventDefault()
      const deltaX = startXRef.current - e.clientX
      const newWidth = Math.max(200, Math.min(800, startWidthRef.current + deltaX))
      setWidth(`${newWidth}px`)
    }
  }, [isPointerDown, isDragging, setWidth])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isPointerDown) return
    
    e.preventDefault()
    
    // If we never started dragging, it's a click - toggle the sidebar
    if (!isDragging) {
      toggleOpen()
    }
    
    setIsDragging(false)
    setIsPointerDown(false)
    
    // Release the pointer capture
    e.currentTarget.releasePointerCapture(e.pointerId)
  }, [isPointerDown, isDragging, toggleOpen])

  return (
    <div
      data-state={isOpen ? 'open' : 'closed'}
      style={{
        width: isOpen ? width : '0px',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: isDragging ? 'none' : 'width 200ms linear, transform 200ms linear',
      } as React.CSSProperties}
      className={cn(
        "flex flex-row relative",
        className
      )}
      {...props}
    >
      <div
        data-slot="resize-handle"
        className={cn(
          "absolute left-0 -top-2 h-screen w-2 border-x-3 border-sidebar cursor-col-resize select-none",
          "bg-transparent hover:bg-border transition-opacity duration-200 opacity-0 hover:opacity-100",
          isDragging && "bg-border"
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      <Messages key={chatId} className={cn(
        "flex flex-col border rounded-lg overflow-hidden bg-background min-w-0 break-words ml-2"
      )} />
    </div>
  )
}