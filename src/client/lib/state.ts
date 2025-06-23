import { UIMessage } from "@ai-sdk/react";
import { create } from "zustand";

interface State {
  count: number;
  increment: () => void;
  decrement: () => void;
  setCount: (count: number) => void;

  chatId: string;
  setChatId: (chatId: string) => void;
  initialMessages: UIMessage[];
  setInitialMessages: (initialMessages: UIMessage[]) => void;

  commandOpen: boolean;
  setCommandOpen: (commandOpen: boolean) => void;

  integrationsDialogOpen: boolean;
  setIntegrationsDialogOpen: (integrationsDialogOpen: boolean) => void;

  customMcpDialogOpen: boolean;
  setCustomMcpDialogOpen: (customMcpDialogOpen: boolean) => void;

  deployDialogOpen: boolean;
  setDeployDialogOpen: (deployDialogOpen: boolean) => void;

  contextItems: any[];
  setContextItems: (contextItems: any[]) => void;

}

export const useStore = create<State>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  setCount: (count: number) => set({ count }),

  chatId: crypto.randomUUID(),
  setChatId: (chatId: string) => set({ chatId }),
  initialMessages: [],
  setInitialMessages: (initialMessages: UIMessage[]) => set({ initialMessages }),

  commandOpen: false,
  setCommandOpen: (commandOpen: boolean) => set({ commandOpen }),

  integrationsDialogOpen: false,
  setIntegrationsDialogOpen: (integrationsDialogOpen: boolean) => set({ integrationsDialogOpen }),

  deployDialogOpen: false,
  setDeployDialogOpen: (deployDialogOpen: boolean) => set({ deployDialogOpen }),

  customMcpDialogOpen: false,
  setCustomMcpDialogOpen: (customMcpDialogOpen: boolean) => set({ customMcpDialogOpen }),

  contextItems: [],
  setContextItems: (contextItems: any[]) => set({ contextItems }),
}));