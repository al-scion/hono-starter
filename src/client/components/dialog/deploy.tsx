import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStore } from '@/lib/state';

const authOptions = [
  {
    value: 'none',
    label: 'None',
  },
  {
    value: 'oauth',
    label: 'OAuth',
  },
  {
    value: 'headers',
    label: 'Headers',
  },
];

export function DeployDialog() {
  const { deployDialogOpen, setDeployDialogOpen } = useStore();
  const [auth, setAuth] = useState('none');

  return (
    <Dialog onOpenChange={setDeployDialogOpen} open={deployDialogOpen}>
      <DialogContent className="p-0">
        <DialogHeader className="space-y-6 px-6 pt-6">
          <DialogTitle>Deploy</DialogTitle>

          <div className="flex flex-col gap-2">
            <Label>Authorization</Label>
            <Select onValueChange={setAuth} value={auth}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="[&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8">
                {authOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>

        <DialogFooter className="border-t px-6 py-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Deploy</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
