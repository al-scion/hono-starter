import { useRouter } from '@tanstack/react-router';
import { Home, Unplug } from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Kbd } from '@/components/shortcuts/kbd';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useStore } from '@/lib/state';

export function CommandComponent() {
  const { commandOpen, setCommandOpen, setIntegrationsDialogOpen } = useStore();
  const router = useRouter();

  useHotkeys(
    'ctrl+k, meta+k',
    () => {
      setCommandOpen(!commandOpen);
    },
    {
      enableOnFormTags: true,
      preventDefault: true,
      enableOnContentEditable: true,
    }
  );

  return (
    <CommandDialog onOpenChange={setCommandOpen} open={commandOpen}>
      <DialogTitle className="sr-only">Command Dialog</DialogTitle>
      <DialogDescription className="sr-only">Command Dialog</DialogDescription>
      <CommandInput />
      <CommandList>
        <CommandEmpty>No results found</CommandEmpty>
        <CommandGroup>
          <CommandItem
            onSelect={() => {
              setCommandOpen(false);
              router.navigate({ to: '/dashboard' });
            }}
          >
            <Home className="size-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setIntegrationsDialogOpen(true);
              setCommandOpen(false);
            }}
          >
            <Unplug className="size-4" />
            <span>Integrations</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
      <div className="flex cursor-default select-none flex-row gap-4 bg-muted/50 px-3 py-2 text-xs">
        <div className="flex flex-row items-center gap-1">
          <Kbd icon="ArrowUpDown" />
          <span>Navigate</span>
        </div>
        <div className="flex flex-row items-center gap-1">
          <Kbd keys={'Enter'} />
          <span>Select</span>
        </div>
        <div className="flex flex-row items-center gap-1">
          <Kbd keys={['Esc']} />
          <span>Close</span>
        </div>
      </div>
    </CommandDialog>
  );
}
