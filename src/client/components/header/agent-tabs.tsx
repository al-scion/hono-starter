import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export function AgentTabs() {
  const navigate = useNavigate();
  const params = useParams({ from: '/_authenticated/_layout/agent/$agentId' });
  const search = useSearch({ from: '/_authenticated/_layout/agent/$agentId' });
  const agentId = params.agentId;
  const routeOptions = ['editor', 'evaluation', 'deploy', 'logs'];

  if (!(search?.mode && agentId)) {
    return null;
  }

  return (
    <Tabs value={search.mode}>
      <TabsList className="h-7 rounded-md border p-0">
        {routeOptions.map((option) => (
          <TabsTrigger
            className={cn(
              'rounded-[5px] px-0.5 font-normal text-muted-foreground shadow-none h-6.5',
              'data-[state=active]:text-foreground data-[state=active]:shadow-xs data-[state=active]:ring data-[state=active]:ring-border'
            )}
            key={option}
            onClick={() =>
              navigate({
                to: '/agent/$agentId',
                params: { agentId },
                search: { mode: option as any },
              })
            }
            value={option}
          >
            <span className={'flex h-6 items-center rounded-sm px-1.5'}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
