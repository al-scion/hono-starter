import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useParams, useSearch, useNavigate } from "@tanstack/react-router"
import { cn } from "@/lib/utils"
import { type Id } from "@/lib/api"

export function AgentTabs() {
  const navigate = useNavigate()
  const params = useParams({ from: '/_authenticated/_layout/document/$docId', shouldThrow: false })
  const search = useSearch({ from: '/_authenticated/_layout/document/$docId', shouldThrow: false }) 
  const docId = params?.docId || null
  const routeOptions = ['editor', 'canvas', 'evaluation', 'deploy', 'logs']

  if (!search?.mode || !docId) return null

  return (
    <Tabs value={search.mode}>
      <TabsList className="h-7 p-0 rounded-md">
        {routeOptions.map((option) => (
          <TabsTrigger
            key={option}
            value={option}
            className={cn(
              "rounded-md px-0.5 text-muted-foreground shadow-none font-normal", 
              "data-[state=active]:border-border data-[state=active]:shadow-xs data-[state=active]:text-foreground",
            )}
            onClick={() => navigate({ to: '/document/$docId', params: { docId: docId as Id<'documents'> }, search: { mode: option as any } })}
          >
            <span className={`h-6 px-1.5 flex items-center rounded-sm`}>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
