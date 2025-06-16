import { useState } from "react"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { Kbd } from "@/components/shortcuts/kbd"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"
import { Command as CommandPrimitive } from "cmdk"
import { shortcuts } from "@/components/shortcuts/config"
import { useHotkeys } from "react-hotkeys-hook"

export function ShortcutMenu() {
  const [shortcutMenuOpen, setShortcutMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  useHotkeys('ctrl+/, meta+/', () => {
    setShortcutMenuOpen(!shortcutMenuOpen)
  }, { enableOnFormTags: true, preventDefault: true, enableOnContentEditable: true })

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
            {Array.from(new Set(shortcuts.map((s) => s.type))).map((type) => (
              <CommandGroup key={type} heading={type} className='[&_[cmdk-group-heading]]:px-0'>
                {shortcuts
                  .filter((item: typeof shortcuts[number]) => item.type === type)
                  .map((item) => (
                    <CommandItem key={item.id} className="cursor-default data-[selected=true]:bg-background data-[selected=true]:border-opacity-0 px-0">
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
