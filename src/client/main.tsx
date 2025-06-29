import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { authClient } from "@/lib/auth-client";
import { Providers } from "@/components/providers";
import "@/index.css";
import "@xyflow/react/dist/style.css";

const router = createRouter({ 
  routeTree,
  context: {
    auth: undefined!
  }
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  const auth = authClient.useSession();
  return (
    <Providers>
      <RouterProvider router={router} context={{ auth }} />
    </Providers>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
