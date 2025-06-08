import { MessageCircle } from 'lucide-react';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandItem } from '@/components/ui/command';
import { DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Kbd } from '@/components/custom/kbd';
import { useStore } from '@/lib/state';
import { useEffect } from 'react';

const commandItems = [
  {
    id: 'Chat',
    name: 'Chat with the AI',
    icon: MessageCircle,
  },
]

export function CommandComponent() {
  const { commandOpen, setCommandOpen } = useStore();

  // Add keyboard shortcut to toggle the command dialog with Ctrl/Cmd + K
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === 'k' &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        setCommandOpen(!commandOpen)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [setCommandOpen, commandOpen])

  return (
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
      <DialogTitle className="sr-only">Command Dialog</DialogTitle>
      <DialogDescription className="sr-only">Command Dialog</DialogDescription>
      <CommandInput placeholder="Search..." />
      <CommandList>
        <CommandEmpty>
          No chats found
        </CommandEmpty>
        {commandItems.map((item) => (
          <CommandItem
            key={item.id}
            value={item.id}
            className="group h-10 data-[selected=false]:bg-transparent"
          >
            <item.icon />
            <span>{item.name}</span>
          </CommandItem>
        ))}
      </CommandList>
      <div className="flex flex-row px-2 py-1 gap-3 text-xs select-none cursor-default border-t">
        <div className="flex flex-row gap-1 items-center">
          <Kbd icon="ArrowUpDown" />
          <span>Navigate</span>
        </div>
        <div className="flex flex-row gap-1 items-center">
          <Kbd keys={'Enter'}/>
          <span>Select</span>
        </div>
        <div className="flex flex-row gap-1 items-center">
          <Kbd keys={['Esc']}/>
          <span>Close</span>
        </div>
      </div>
    </CommandDialog>
  );
}
