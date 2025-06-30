import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import { useImperativeHandle, useState } from 'react'
import { Button } from '@/components/ui/button'
import Mention from '@tiptap/extension-mention'
import { Heading1, Heading2, Heading3, Minus, Globe, Compass } from 'lucide-react'
import { Extension } from '@tiptap/react'
import type { Editor, Range } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { Gmail, Google } from '@/lib/icons'

const suggestionItems= [
  { id: 'webSearch', label: 'Web Search', icon: Globe },
  { id: 'webScrape', label: 'Web Scrape', icon: Compass },
  { id: 'googleDrive', label: 'Google Drive', icon: Google },
  { id: 'gmail', label: 'Gmail', icon: Gmail },
]

const slashCommandItems = [
  {
    label: 'Heading 1',
    icon: Heading1,
    shortcut: '#',
    command: ({ editor, range }: { editor: Editor; range: Range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setHeading({ level: 1 })
        .run()
    },
  },
  {
    label: 'Heading 2',
    icon: Heading2,
    shortcut: '##',
    command: ({ editor, range }: { editor: Editor; range: Range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setHeading({ level: 2 })
        .run()
    },
  },
  {
    label: 'Heading 3',
    icon: Heading3,
    shortcut: '###',
    command: ({ editor, range }: { editor: Editor; range: Range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setHeading({ level: 3 })
        .run()
    },
  },
  {
    label: 'Divider',
    icon: Minus,
    shortcut: '---',
    command: ({ editor, range }: { editor: Editor; range: Range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setHorizontalRule()
        .run()
    },
  },
]

export const MentionSuggestion = Mention.configure({
  HTMLAttributes: {
    class: 'mention bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300 px-0.5 rounded focus:outline-none',
  },
  deleteTriggerWithBackspace: true,
  suggestion: {
    decorationClass: 'bg-muted px-1 py-0.5 rounded',
    allowSpaces: false,
    items: ({ query }: { query: string }) => {
      const filteredItems = suggestionItems.filter(item => item.label.toLowerCase().startsWith(query.toLowerCase()))
      return filteredItems
    },
    render: () => {
      let component: ReactRenderer
      let popup: any
  
      return {
        onStart: (props: any) => {
          component = new ReactRenderer((props: any) => {
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
              reset: () => setSelectedIndex(0),
            }))
  
            return (
              <div className="z-50 min-w-[14rem] overflow-hidden rounded-md border bg-popover p-1 shadow-md">
                {props.items.length ? (
                  props.items.map((item: any, index: number) => (
                    <Button
                      variant="ghost"
                      className={`flex w-full justify-start h-7 px-2 gap-2 text-sm [&>svg]:text-foreground ${index === selectedIndex && 'bg-accent'}`}
                      key={item.id}
                      onClick={() => selectItem(index)}
                    >
                      <item.icon className="size-4" />
                      <span className="font-normal">{item.label}</span>
                    </Button>
                  ))
                ) : (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">No result</div>
                )}
              </div>
            )
          }, {
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
  
          (component.ref).reset()
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
    }
  }
})

export const SlashCommand = Extension.create({
  name: 'slashCommand',
  
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        decorationClass: 'bg-muted px-1 py-0.5 rounded',
        allowSpaces: false,
        items: ({ query }: { query: string }) => {
          return slashCommandItems.filter(item =>
            item.label.toLowerCase().includes(query.toLowerCase())
          )
        },
        render: () => {
          let component: ReactRenderer
          let popup: any

          return {
            onStart: (props: any) => {
              component = new ReactRenderer((props: any) => {
                const [selectedIndex, setSelectedIndex] = useState(0)
                
                const selectItem = (index: number) => {
                  const item = props.items[index]
                  if (item) {
                    item.command({ editor: props.editor, range: props.range })
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
                  reset: () => setSelectedIndex(0),
                }))

                return (
                  <div className="w-[14rem] overflow-hidden rounded-md border bg-popover p-1 shadow-md gap">
                    {props.items.length ? (
                      props.items.map((item: any, index: number) => (
                        <Button
                          variant="ghost"
                          className={`flex w-full justify-start h-7 px-2 gap-2 text-sm font-normal [&>svg]:text-foreground ${index === selectedIndex && 'bg-accent'}`}
                          key={index}
                          onClick={() => selectItem(index)}
                        >
                          <item.icon className="size-4" />
                          <span>{item.label}</span>
                          <span className="ml-auto text-muted-foreground text-xs">{item.shortcut}</span>
                        </Button>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">No result</div>
                    )}
                  </div>
                )
              }, {
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

              (component.ref).reset()
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
      }),
    ]
  },
})