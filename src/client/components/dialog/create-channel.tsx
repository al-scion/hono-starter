import { useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/state"
import { useRouter } from "@tanstack/react-router"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useCreateChannel } from "@/hooks/use-convex"
import { useOrganization } from "@clerk/clerk-react"

export function CreateChannelDialog() {
  const { createChannelDialogOpen, setCreateChannelDialogOpen } = useStore()
  const [channelName, setChannelName] = useState("")
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')
  const router = useRouter()
  const { mutate: createChannel, isPending } = useCreateChannel()
  const { organization } = useOrganization()
  
  const handleCreate = () => {
    if (!organization) return

    createChannel({ 
      name: channelName.trim(), 
      type: visibility, 
      organizationId: organization.id 
    }, {
      onSuccess: (channelId) => {
        router.navigate({ to: "/channel/$channelId", params: { channelId } })
        setCreateChannelDialogOpen(false)
      }
    })
  }

  return (
    <Dialog open={createChannelDialogOpen} onOpenChange={setCreateChannelDialogOpen}>
      <DialogContent className="p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>New Channel</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col py-6 px-4 space-y-6">

          <div className="flex flex-col gap-2">
            <Label>Name</Label>
            <Input
              autoFocus
              placeholder="channel-name"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              onKeyDown={(e) => {if (e.key === "Enter") handleCreate()}}
            />
          </div>

        {/* Visibility selection */}
          <div className="flex flex-col gap-2">
            <Label>Visibility</Label>
            <RadioGroup
              value={visibility}
              onValueChange={(val) => setVisibility(val as 'public' | 'private')}
              className="flex flex-col gap-3"
            >
              <Label htmlFor="visibility-public" className="gap-3">
                <RadioGroupItem id="visibility-public" value="public" />
                <span className="font-normal">Public - anyone in workspace</span>
              </Label>
              <Label htmlFor="visibility-private" className="gap-3">
                <RadioGroupItem id="visibility-private" value="private" />
                <span className="font-normal">Private - only specific people</span>
              </Label>
            </RadioGroup>
          </div>

        </div>

        <DialogFooter className="border-t p-4 py-3">
          <Button variant="outline" onClick={() => setCreateChannelDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            disabled={!channelName.trim() || isPending}
            onClick={handleCreate}
          >
            {isPending && <Loader2 className="size-4 animate-spin" /> }
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
