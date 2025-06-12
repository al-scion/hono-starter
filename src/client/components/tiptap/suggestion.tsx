import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import { useEffect, useImperativeHandle, useState } from 'react'
import { User } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MentionItem {
  id: string
  label: string
  icon: React.ElementType
}

interface MentionListProps {
  items: MentionItem[]
  command: (item: { id: string; label: string }) => void
  ref: any
}

function MentionList(props: MentionListProps) {
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
    <div className="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 shadow-md">
      {props.items.length ? (
        props.items.map((item: MentionItem, index: number) => (
          <Button
            variant="ghost"
            className={`flex w-full justify-start px-2 py-1.5 text-sm ${
              index === selectedIndex ? 'bg-accent' : ''
            }`}
            key={item.id}
            onClick={() => selectItem(index)}
          >
            <item.icon className="size-4" />
            {item.label}
          </Button>
        ))
      ) : (
        <div className="px-2 py-1.5 text-sm text-muted-foreground">No result</div>
      )}
    </div>
  )
}

export default {
  items: ({ query }: { query: string }) => {
    const users = [
      { id: 'user_1', label: 'Lea Thompson', icon: User },
      { id: 'user_2', label: 'Cyndi Lauper', icon: User },
      { id: 'user_3', label: 'Tom Cruise', icon: User },
      { id: 'user_4', label: 'Madonna', icon: User },
      { id: 'user_5', label: 'Jerry Hall', icon: User },
      { id: 'user_6', label: 'Joan Collins', icon: User },
      { id: 'user_7', label: 'Winona Ryder', icon: User },
      { id: 'user_8', label: 'Christina Applegate', icon: User },
      { id: 'user_9', label: 'Alyssa Milano', icon: User },
      { id: 'user_10', label: 'Molly Ringwald', icon: User },
    ]

    return users.filter(user => user.label.toLowerCase().startsWith(query.toLowerCase()))
  },

  render: () => {
    let component: ReactRenderer
    let popup: any

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        })

        if (!props.clientRect) {
          return
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'top-start',
        })
      },

      onUpdate(props: any) {
        component.updateProps(props)

        if (!props.clientRect) {
          return
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        })
      },

      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          popup[0].hide()

          return true
        }

        return (component.ref as any)?.onKeyDown(props)
      },

      onExit() {
        popup[0].destroy()
        component.destroy()
      },
    }
  },
} 