import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/state"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useState } from "react"

const authOptions = [{
  value: "none",
  label: "None",
}, {
  value: "oauth",
  label: "OAuth",
}, {
  value: "headers",
  label: "Headers",
}]

export function DeployDialog() {

  const { deployDialogOpen, setDeployDialogOpen } = useStore()
  const [auth, setAuth] = useState("none")

  return (
    <Dialog open={deployDialogOpen} onOpenChange={setDeployDialogOpen}>
      <DialogContent className="p-0">
        <DialogHeader className="px-6 pt-6 space-y-6">
          <DialogTitle>Deploy</DialogTitle>

          <div className="flex flex-col gap-2">
            <Label>Authorization</Label>
            <Select value={auth} onValueChange={setAuth}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
                {authOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>


        <DialogFooter className="border-t px-6 py-4">
          <DialogClose asChild>
            <Button variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button>
            Deploy
          </Button>
        </DialogFooter>
      </DialogContent>      
    </Dialog>
  )
}