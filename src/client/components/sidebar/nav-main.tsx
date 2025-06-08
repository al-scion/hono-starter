import { useRouter, useLocation } from "@tanstack/react-router"
import { type LucideIcon } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    onClick?: () => void
  }[]
}) {
  const router = useRouter();
  const location = useLocation();

  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton 
            isActive={location.pathname.includes(item.url)} 
            onClick={() => {
              if (item.onClick) {
                item.onClick();
              } else {
                router.navigate({ to: item.url });
              }
            }}
          >
            <item.icon />
            <span>{item.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
