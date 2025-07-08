import { Command as CommandPrimitive } from 'cmdk';
import { SearchIcon } from 'lucide-react';
import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { shortcuts } from '@/components/shortcuts/config';
import { Kbd } from '@/components/shortcuts/kbd';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet';

export function ShortcutMenu() {
  const [shortcutMenuOpen, setShortcutMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  useHotkeys(
    'ctrl+/, meta+/',
    () => {
      setShortcutMenuOpen(!shortcutMenuOpen);
    },
    {
      enableOnFormTags: true,
      preventDefault: true,
      enableOnContentEditable: true,
    }
  );

  return (
    <Sheet
      onOpenChange={(open) => {
        setShortcutMenuOpen(open);
      }}
      open={shortcutMenuOpen}
    >
      <SheetContent className="m-2 flex h-auto flex-col gap-4 rounded-lg p-4">
        <SheetTitle>Keyboard Shortcuts</SheetTitle>
        <SheetDescription className="sr-only">
          Keyboard Shortcuts
        </SheetDescription>

        <Command className="overflow-visible">
          <div className="relative">
            <CommandPrimitive.Input asChild>
              <Input
                autoFocus
                className="peer ps-9 pe-2 shadow-none"
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                value={search}
              />
            </CommandPrimitive.Input>
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
              <SearchIcon size={16} />
            </div>
          </div>

          <CommandList className="mt-2">
            <CommandEmpty>
              <span className="text-muted-foreground">No shortcuts found</span>
            </CommandEmpty>
            {Array.from(new Set(shortcuts.map((s) => s.type))).map((type) => (
              <CommandGroup
                className="[&_[cmdk-group-heading]]:px-0"
                heading={type}
                key={type}
              >
                {shortcuts
                  .filter(
                    (item: (typeof shortcuts)[number]) => item.type === type
                  )
                  .map((item) => (
                    <CommandItem
                      className="cursor-default px-0 data-[selected=true]:border-opacity-0 data-[selected=true]:bg-background"
                      key={item.id}
                    >
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
  );
}
