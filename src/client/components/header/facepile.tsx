import { useStore } from "@/lib/state"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useOrganization } from "@clerk/clerk-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function Facepile() {
  const { presenceState } = useStore()
  const org = useOrganization({memberships: {infinite: true}})
  const numberToShow = 3

  if (!presenceState) return null

  return (
    <div className="flex flex-row -space-x-2">
      {presenceState.slice(0, numberToShow).map((presence) => {
        const userData = org.memberships?.data?.find((member) => member.publicUserData?.userId === presence.userId)
        return (
          <Tooltip key={presence.userId}>
            <TooltipTrigger asChild>
              <Avatar className="size-7 border-background border-2">
                <AvatarImage src={userData?.publicUserData?.imageUrl} />
                <AvatarFallback>{userData?.publicUserData?.firstName?.charAt(0)}</AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent className="flex-col gap-0">
              <span>{userData?.publicUserData?.firstName} {userData?.publicUserData?.lastName}</span>
              <span>{userData?.publicUserData?.identifier}</span>
            </TooltipContent>
          </Tooltip>
        )
      })}
      {presenceState.length > numberToShow && <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "size-7 z-50 rounded-full bg-muted flex items-center justify-center text-xs",
            "border-background border-2",
          )}>
            +{presenceState.length - numberToShow}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          View members
        </TooltipContent>
      </Tooltip>}
    </div>
  )
}