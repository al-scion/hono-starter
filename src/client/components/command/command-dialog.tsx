import { Box, Home } from 'lucide-react';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandItem, CommandGroup } from '@/components/ui/command';
import { DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Kbd } from '@/components/shortcuts/kbd';
import { useStore } from '@/lib/state';
import { useRouter } from '@tanstack/react-router';
import { useHotkeys } from 'react-hotkeys-hook';

export function CommandComponent() {
  const { commandOpen, setCommandOpen, setIntegrationsDialogOpen } = useStore();
  const router = useRouter();

  useHotkeys('ctrl+k, meta+k', () => {
    setCommandOpen(!commandOpen)
  }, { enableOnFormTags: true, preventDefault: true, enableOnContentEditable: true })

  return (
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
      <DialogTitle className="sr-only">Command Dialog</DialogTitle>
      <DialogDescription className="sr-only">Command Dialog</DialogDescription>
      <CommandInput />
      <CommandList>
        <CommandEmpty>No results found</CommandEmpty>
        <CommandGroup>
          <CommandItem onSelect={() => {
            setCommandOpen(false)
            router.navigate({ to: '/app/dashboard' })
          }}>
            <Home className="size-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => {
            setIntegrationsDialogOpen(true)
            setCommandOpen(false)
          }}>
            <Box className="size-4" />
            <span>Integrations</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
      <div className="flex flex-row px-3 py-2 gap-4 text-xs select-none cursor-default bg-muted/50">
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
