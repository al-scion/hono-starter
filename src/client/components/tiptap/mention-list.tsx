import { useEffect, useImperativeHandle, useState } from 'react'

interface MentionItem {
  id: string
  label: string
}

interface MentionListProps {
  items: MentionItem[]
  command: (item: { id: string; label: string }) => void
  ref: any
}

export default function MentionList(props: MentionListProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]

    if (item) {
      props.command({ 
        id: item.id, 
        label: item.label 
      })
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(props.ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter' || event.key === 'Tab') {
        enterHandler()
        return true
      }

      return false
    },
  }))

  return (
    <div className="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
      {props.items.length ? (
        props.items.map((item: MentionItem, index: number) => (
          <button
            className={`relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground ${
              index === selectedIndex ? 'bg-accent text-accent-foreground' : ''
            }`}
            key={item.id}
            onClick={() => selectItem(index)}
          >
            {item.label}
          </button>
        ))
      ) : (
        <div className="px-2 py-1.5 text-sm text-muted-foreground">No result</div>
      )}
    </div>
  )
} 