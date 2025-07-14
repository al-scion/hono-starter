import { useOrganization } from '@clerk/clerk-react';
import { useRouter } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCreateChannel } from '@/hooks/use-convex';
import { useStore } from '@/lib/state';

export function CreateChannelDialog() {
  const { createChannelDialogOpen, setCreateChannelDialogOpen } = useStore();
  const [channelName, setChannelName] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const router = useRouter();
  const { mutate: createChannel, isPending } = useCreateChannel();
  const { organization } = useOrganization();

  const handleCreate = () => {
    if (!organization) {
      return;
    }

    createChannel(
      {
        name: channelName.trim(),
        type: visibility,
        organizationId: organization.id,
      },
      {
        onSuccess: (channelId) => {
          router.navigate({ to: '/channel/$channelId', params: { channelId }, search: { thread: undefined } });
          setCreateChannelDialogOpen(false);
        },
      }
    );
  };

  return (
    <Dialog
      onOpenChange={setCreateChannelDialogOpen}
      open={createChannelDialogOpen}
    >
      <DialogContent className="gap-0 p-0">
        <DialogHeader className="border-b p-4">
          <DialogTitle>New Channel</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-6 px-4 py-6">
          <div className="flex flex-col gap-2">
            <Label>Name</Label>
            <Input
              autoFocus
              onChange={(e) => setChannelName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreate();
                }
              }}
              placeholder="channel-name"
              value={channelName}
            />
          </div>

          {/* Visibility selection */}
          <div className="flex flex-col gap-2">
            <Label>Visibility</Label>
            <RadioGroup
              className="flex flex-col gap-3"
              onValueChange={(val) =>
                setVisibility(val as 'public' | 'private')
              }
              value={visibility}
            >
              <Label className="gap-3" htmlFor="visibility-public">
                <RadioGroupItem id="visibility-public" value="public" />
                <span className="font-normal">
                  Public - anyone in workspace
                </span>
              </Label>
              <Label className="gap-3" htmlFor="visibility-private">
                <RadioGroupItem id="visibility-private" value="private" />
                <span className="font-normal">
                  Private - only specific people
                </span>
              </Label>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="border-t p-4 py-3">
          <Button
            onClick={() => setCreateChannelDialogOpen(false)}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={!channelName.trim() || isPending}
            onClick={handleCreate}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
