import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar"
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/_layout/dashboard')({
  component: Dashboard,
})

export default function Dashboard() {
  const { state } = useSidebar()
  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2">
        <div className="flex flex-1 items-center gap-2 px-3">
          {state === 'collapsed' && (
            <>
            <SidebarTrigger />
            <Separator
              orientation="vertical"
              className="data-[orientation=vertical]:h-4"
            />
            </>
          )}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1">
                  Project Management & Task Tracking
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 px-4 py-10">
        <div className="bg-muted/50 mx-auto h-24 w-full max-w-3xl rounded-xl" />
        <div className="bg-muted/50 mx-auto h-full w-full max-w-3xl rounded-xl" />
      </div>
    </>
  )
}

