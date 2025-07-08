import { useOrganization } from '@clerk/clerk-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useStore } from '@/lib/state';
import { cn } from '@/lib/utils';

export function Facepile() {
  const { presenceState } = useStore();
  const org = useOrganization({ memberships: { infinite: true } });
  const numberToShow = 3;

  if (!presenceState) {
    return null;
  }

  return (
    <div className="-space-x-2 flex flex-row hover:space-x-1">
      {presenceState.slice(0, numberToShow).map((presence) => {
        const userData = org.memberships?.data?.find(
          (member) => member.publicUserData?.userId === presence.userId
        );
        return (
          <Tooltip key={presence.userId}>
            <TooltipTrigger asChild>
              <Avatar className="size-7 border-2 border-background transition-all duration-200 ease-in-out">
                <AvatarImage src={userData?.publicUserData?.imageUrl} />
                <AvatarFallback>
                  {userData?.publicUserData?.firstName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent className="flex-col gap-0" showArrow>
              <span className="font-medium">
                {userData?.publicUserData?.firstName}{' '}
                {userData?.publicUserData?.lastName}
              </span>
              <span className="font-light">
                {userData?.publicUserData?.identifier}
              </span>
            </TooltipContent>
          </Tooltip>
        );
      })}
      {presenceState.length > numberToShow && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'z-50 flex size-7 items-center justify-center rounded-full bg-muted text-xs',
                'border-2 border-background',
                'transition-all duration-200 ease-in-out'
              )}
            >
              +{presenceState.length - numberToShow}
            </div>
          </TooltipTrigger>
          <TooltipContent>View members</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
