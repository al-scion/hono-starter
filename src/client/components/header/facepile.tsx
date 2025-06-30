import { useStore } from "@/lib/state"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useOrganization } from "@clerk/clerk-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function Facepile() {
  const { presenceState } = useStore()
  const org = useOrganization({memberships: {infinite: true}})

  return (
    <div className="flex flex-row -space-x-2">
      {presenceState?.map((presence) => {
        const userData = org.memberships?.data?.find((member) => member.publicUserData?.userId === presence.userId)
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar key={presence.userId} className="size-7 border-background border-2 hover:border-border">
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
      <div className="size-7 z-50 border-background border-2 rounded-full bg-muted flex items-center justify-center text-xs">
        +{presenceState?.length}
      </div>
    </div>
  )
}