import { createFileRoute } from '@tanstack/react-router';
import { LoadingPage } from '../components/loading-page';

export const Route = createFileRoute(
  '/api/mcp/agent/$userId/callback/$sessionId'
)({
  loader: async () => {
    await fetch(window.location.href);
    window.close();
  },
  component: () => <LoadingPage />,
});
