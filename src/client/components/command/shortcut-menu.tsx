import { useEffect, useState } from "react"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { Kbd } from "@/components/custom/kbd"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"
import { Command as CommandPrimitive } from "cmdk"

interface Shortcut {
  id: string;
  label: string;
  type: string;
  keys: {
    windows: string;
    mac: string;
  };
  enabled: boolean;
}

export const shortcuts: Shortcut[] = [
  {
    id: 'chat',
    label: 'Chat',
    type: 'General',
    keys: {
      windows: 'Ctrl+K',
      mac: 'Command+K',
    },
    enabled: true,
  },
]

export function ShortcutMenu() {
  const [shortcutMenuOpen, setShortcutMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === '/' &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        setShortcutMenuOpen(!shortcutMenuOpen)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [setShortcutMenuOpen, shortcutMenuOpen])

  return (
    <Sheet 
      open={shortcutMenuOpen} 
      onOpenChange={(open) => {setShortcutMenuOpen(open)}}
    >
      <SheetContent className="flex flex-col m-2 rounded-lg gap-4 p-4 h-auto">
        <SheetTitle>Keyboard Shortcuts</SheetTitle>
        <SheetDescription className="sr-only">Keyboard Shortcuts</SheetDescription>

        <Command className='overflow-visible'>
          <div className="relative">
            <CommandPrimitive.Input asChild>
              <Input
                className="peer ps-9 pe-2 shadow-none"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </CommandPrimitive.Input>
            <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
              <SearchIcon size={16} />
            </div>
          </div>

          <CommandList className="mt-2">
            <CommandEmpty>
              <span className="text-muted-foreground">No shortcuts found</span>
            </CommandEmpty>
            {shortcuts.map(shortcut => (
              <CommandGroup key={shortcut.type} heading={shortcut.type} className='[&_[cmdk-group-heading]]:px-0'>
                {shortcuts
                  .filter((item: typeof shortcuts[number]) => item.type === shortcut.type)
                  .map((item: typeof shortcuts[number]) => (
                    <CommandItem key={item.id} className="cursor-default data-[selected=true]:bg-background px-0">
                      <span>{item.label}</span>
                      <CommandShortcut>
                        <Kbd shortcutId={item.id} />
                      </CommandShortcut>
                    </CommandItem>
                  ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </SheetContent>
    </Sheet>
  )
}
