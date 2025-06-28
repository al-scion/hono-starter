import { Sidebar, SidebarRail } from "@/components/ui/sidebar"
import { Messages } from "@/components/chat/messages"
import { useStore } from "@/lib/state"

export function RightSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const { chatId } = useStore()

  return (
    <Sidebar
      side="right"
      {...props}
    >
      <div className="flex flex-col flex-1 bg-background border rounded-lg">
        <Messages key={chatId} />
      </div>
      <SidebarRail className='[[data-side=right][data-variant=inset]_&]:-left-1.25' />
    </Sidebar>
  )
}