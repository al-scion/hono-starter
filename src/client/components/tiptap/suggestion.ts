import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'

import MentionList from './mention-list'

export default {
  items: ({ query }: { query: string }) => {
    const users = [
      { id: 'user_1', label: 'Lea Thompson' },
      { id: 'user_2', label: 'Cyndi Lauper' },
      { id: 'user_3', label: 'Tom Cruise' },
      { id: 'user_4', label: 'Madonna' },
      { id: 'user_5', label: 'Jerry Hall' },
      { id: 'user_6', label: 'Joan Collins' },
      { id: 'user_7', label: 'Winona Ryder' },
      { id: 'user_8', label: 'Christina Applegate' },
      { id: 'user_9', label: 'Alyssa Milano' },
      { id: 'user_10', label: 'Molly Ringwald' },
      { id: 'user_11', label: 'Ally Sheedy' },
      { id: 'user_12', label: 'Debbie Harry' },
      { id: 'user_13', label: 'Olivia Newton-John' },
      { id: 'user_14', label: 'Elton John' },
      { id: 'user_15', label: 'Michael J. Fox' },
      { id: 'user_16', label: 'Axl Rose' },
      { id: 'user_17', label: 'Emilio Estevez' },
      { id: 'user_18', label: 'Ralph Macchio' },
      { id: 'user_19', label: 'Rob Lowe' },
      { id: 'user_20', label: 'Jennifer Grey' },
      { id: 'user_21', label: 'Mickey Rourke' },
      { id: 'user_22', label: 'John Cusack' },
      { id: 'user_23', label: 'Matthew Broderick' },
      { id: 'user_24', label: 'Justine Bateman' },
      { id: 'user_25', label: 'Lisa Bonet' },
    ]

    return users
      .filter(user => user.label.toLowerCase().startsWith(query.toLowerCase()))
      .slice(0, 5)
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
          placement: 'bottom-start',
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