import React from 'react';
import type { Editor, Range } from '@tiptap/core';
import Mention from '@tiptap/extension-mention';
import { Extension, NodeViewWrapper, ReactRenderer, ReactNodeViewRenderer } from '@tiptap/react';
import Suggestion, { SuggestionProps } from '@tiptap/suggestion';
import { type Instance } from 'tippy.js';
import {
  Compass,
  Globe,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListChecks,
  ListOrdered,
  Loader,
  Minus,
  Quote,
  Table,
} from 'lucide-react';
import { useImperativeHandle, useState } from 'react';
import tippy from 'tippy.js';
import { Button } from '@/components/ui/button';
import { Gmail, Google } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface SuggestionItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const suggestionItems: SuggestionItem[] = [
  { id: 'webSearch', label: 'Web Search', icon: Globe },
  { id: 'webScrape', label: 'Web Scrape', icon: Compass },
  { id: 'googleDrive', label: 'Google Drive', icon: Google },
  { id: 'gmail', label: 'Gmail', icon: Gmail },
  { id: 'agent', label: 'Agent', icon: Loader },
];

interface SlashCommandItem {
  label: string;
  icon: React.ElementType;
  shortcut: string;
  command: (props: { editor: Editor; range: Range }) => void;
}

const slashCommandItems: SlashCommandItem[] = [
  {
    label: 'Heading 1',
    icon: Heading1,
    shortcut: '#',
    command: ({ editor, range }: { editor: Editor; range: Range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
    },
  },
  {
    label: 'Heading 2',
    icon: Heading2,
    shortcut: '##',
    command: ({ editor, range }: { editor: Editor; range: Range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
    },
  },
  {
    label: 'Heading 3',
    icon: Heading3,
    shortcut: '###',
    command: ({ editor, range }: { editor: Editor; range: Range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
    },
  },
  {
    label: 'Divider',
    icon: Minus,
    shortcut: '---',
    command: ({ editor, range }: { editor: Editor; range: Range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    label: 'Bulleted list',
    icon: List,
    shortcut: '-',
    command: ({ editor, range }: { editor: Editor; range: Range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    label: 'Numbered list',
    icon: ListOrdered,
    shortcut: '1.',
    command: ({ editor, range }: { editor: Editor; range: Range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    label: 'Check list',
    icon: ListChecks,
    shortcut: '[]',
    command: ({ editor, range }: { editor: Editor; range: Range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    label: 'Quote',
    icon: Quote,
    shortcut: '>',
    command: ({ editor, range }: { editor: Editor; range: Range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    label: 'Table',
    icon: Table,
    shortcut: '',
    command: ({ editor, range }: { editor: Editor; range: Range }) => {
      console.log(editor, range)
    },
  }
];

export const MentionSuggestion = Mention.extend({
  inline: true,
  addNodeView() {
    return ReactNodeViewRenderer((props) => {
      const attrs = props.node.attrs as {id: string, label: string};
      const icon = suggestionItems.find((item) => item.id === attrs.id)?.icon;
      
      return (
        <NodeViewWrapper as='span'>
          <button 
            className={cn(
              "inline-flex items-baseline px-1 gap-1",
              "bg-muted rounded ring ring-border",
              "group/mention-item"
            )}
          >
            {icon && React.createElement(icon, { className: "size-[1em] self-center group-hover/mention-item:hidden" })}
            <X className='size-[1em] self-center cursor-pointer hidden group-hover/mention-item:block' onClick={() => props.deleteNode()} />
            <span>{attrs.label}</span>
          </button>
        </NodeViewWrapper>
      )}
    );
  },
}).configure({
  deleteTriggerWithBackspace: true,
  HTMLAttributes: {
    class: 'mention testing',
  },
  suggestion: {
    decorationClass: 'bg-muted p-0.5 rounded',
    allowSpaces: false,
    items: ({ query }) => {
      const filteredItems = suggestionItems.filter((item) =>
        item.label.toLowerCase().startsWith(query.toLowerCase())
      );
      return filteredItems;
    },
    render: () => {
      let component: ReactRenderer<SuggestionProps<SuggestionItem>>;
      let popup: Instance[];

      return {
        onUpdate(props) {
          component.updateProps(props);
          if (!props.clientRect) return;
          popup[0].setProps({ getReferenceClientRect: props.clientRect as () => DOMRect });
        },
        onExit() {
          popup[0].destroy();
          component.destroy();
        },
        onKeyDown(props) {
          return (component.ref as any)?.onKeyDown?.(props)
        },
        onStart: (props: SuggestionProps<SuggestionItem>) => {

          const handleExit = () => {
            props.editor.commands.insertContent(' ');
            popup[0].hide();
          }

          component = new ReactRenderer(
            (props: any) => {
              const [selectedIndex, setSelectedIndex] = useState(0);

              const selectItem = (index: number) => {
                const item = props.items[index];
                if (item) {
                  props.command({
                    id: item.id,
                    label: item.label,
                  });
                }
              };

              useImperativeHandle(props.ref, () => ({
                onKeyDown: ({ event }: { event: KeyboardEvent }) => {
                  if (event.key === 'Escape') {handleExit();return true;}
                  if (event.key === 'ArrowUp') {setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);return true;}
                  if (event.key === 'ArrowDown') {setSelectedIndex((selectedIndex + 1) % props.items.length);return true;}
                  if (event.key === 'Enter' || event.key === 'Tab') {
                    event.preventDefault();
                    event.stopPropagation();
                    selectItem(selectedIndex);
                    return true;
                  }
                  return false;
                },
                reset: () => setSelectedIndex(0),
              }));

              return (
                <div className="z-50 min-w-[14rem] overflow-hidden rounded-md border bg-popover p-1 shadow-md">
                  {props.items.length ? (
                    props.items.map((item: SuggestionItem, index: number) => (
                      <Button
                        className={`flex h-7 w-full justify-start gap-2 px-2 text-sm transition-none [&>svg]:text-foreground ${index === selectedIndex && 'bg-accent'}`}
                        key={item.id}
                        onClick={() => selectItem(index)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        variant="ghost"
                      >
                        <item.icon className="size-4" />
                        <span className="font-normal">{item.label}</span>
                      </Button>
                    ))
                  ) : (
                    <div className="h-7 px-2 flex items-center text-muted-foreground text-sm">
                      No result
                    </div>
                  )}
                </div>
              );
            },
            {
              props,
              editor: props.editor,
            }
          );

          popup = tippy('body', {
            getReferenceClientRect: props.clientRect as () => DOMRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
          });
        },
      };
    },
  },
});

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
          return slashCommandItems.filter((item) =>
            item.label.toLowerCase().includes(query.toLowerCase())
          );
        },
        render: () => {
          let component: ReactRenderer;
          let popup: Instance[];

          return {
            onStart: (props: any) => {
              component = new ReactRenderer(
                (props: any) => {
                  const [selectedIndex, setSelectedIndex] = useState(0);

                  const selectItem = (index: number) => {
                    const item = props.items[index];
                    if (item) {
                      item.command({
                        editor: props.editor,
                        range: props.range,
                      });
                    }
                  };

                  const upHandler = () => {
                    setSelectedIndex(
                      (selectedIndex + props.items.length - 1) %
                        props.items.length
                    );
                  };

                  const downHandler = () => {
                    setSelectedIndex((selectedIndex + 1) % props.items.length);
                  };

                  const enterHandler = () => {
                    selectItem(selectedIndex);
                  };

                  useImperativeHandle(props.ref, () => ({
                    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
                      if (event.key === 'ArrowUp') {
                        upHandler();
                        return true;
                      }

                      if (event.key === 'ArrowDown') {
                        downHandler();
                        return true;
                      }

                      if (event.key === 'Enter' || event.key === 'Tab') {
                        enterHandler();
                        return true;
                      }

                      return false;
                    },
                    reset: () => setSelectedIndex(0),
                  }));

                  return (
                    <div className="gap w-[14rem] overflow-hidden rounded-md border bg-popover p-1 shadow-md">
                      {props.items.length ? (
                        props.items.map((item: any, index: number) => (
                          <Button
                            className={`flex h-7 w-full justify-start gap-2 px-2 font-normal text-sm transition-none [&>svg]:text-foreground ${index === selectedIndex && 'bg-accent'}`}
                            key={index}
                            onClick={() => selectItem(index)}
                            onMouseEnter={() => setSelectedIndex(index)}
                            variant="ghost"
                          >
                            <item.icon className="size-4" />
                            <span>{item.label}</span>
                            <span className="ml-auto text-muted-foreground text-xs">
                              {item.shortcut}
                            </span>
                          </Button>
                        ))
                      ) : (
                        <div className="h-7 px-2 flex items-center text-sm">No commands found</div>
                      )}
                    </div>
                  );
                },
                {
                  props,
                  editor: props.editor,
                }
              );

              if (!props.clientRect) {
                return;
              }

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              });
            },

            onUpdate(props: any) {
              component.updateProps(props);

              if (!props.clientRect) {
                return;
              }

              popup[0].setProps({
                getReferenceClientRect: props.clientRect as () => DOMRect,
              });
            },

            onKeyDown(props) {
              if (props.event.key === 'Escape') {
                popup[0].hide();
                return true;
              }

              return (component.ref as any)?.onKeyDown(props);
            },

            onExit() {
              popup[0].destroy();
              component.destroy();
            },
          };
        },
      }),
    ];
  },
});
