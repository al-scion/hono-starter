import type { UIMessage } from '@ai-sdk/react';
import type usePresence from '@convex-dev/presence/react';
import type { ImperativePanelHandle } from 'react-resizable-panels';
import { create } from 'zustand';

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

  createChannelDialogOpen: boolean;
  setCreateChannelDialogOpen: (createChannelDialogOpen: boolean) => void;

  contextItems: any[];
  setContextItems: (contextItems: any[]) => void;

  presenceState: ReturnType<typeof usePresence>;
  setPresenceState: (presenceState: ReturnType<typeof usePresence>) => void;

  leftSidebarRef: React.RefObject<ImperativePanelHandle | null> | null;
  setLeftSidebarRef: (
    leftSidebarRef: React.RefObject<ImperativePanelHandle | null> | null
  ) => void;
  isLeftSidebarCollapsed: boolean;
  setIsLeftSidebarCollapsed: (isLeftSidebarCollapsed: boolean) => void;
  toggleLeftSidebarCollapse: () => void;

  rightSidebarRef: React.RefObject<ImperativePanelHandle | null> | null;
  setRightSidebarRef: (
    rightSidebarRef: React.RefObject<ImperativePanelHandle | null> | null
  ) => void;
  isRightSidebarCollapsed: boolean;
  setIsRightSidebarCollapsed: (isRightSidebarCollapsed: boolean) => void;
  toggleRightSidebarCollapse: () => void;
}

export const useStore = create<State>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  setCount: (count: number) => set({ count }),

  chatId: crypto.randomUUID(),
  setChatId: (chatId: string) => set({ chatId }),
  initialMessages: [],
  setInitialMessages: (initialMessages: UIMessage[]) =>
    set({ initialMessages }),

  commandOpen: false,
  setCommandOpen: (commandOpen: boolean) => set({ commandOpen }),

  integrationsDialogOpen: false,
  setIntegrationsDialogOpen: (integrationsDialogOpen: boolean) =>
    set({ integrationsDialogOpen }),

  deployDialogOpen: false,
  setDeployDialogOpen: (deployDialogOpen: boolean) => set({ deployDialogOpen }),

  createChannelDialogOpen: false,
  setCreateChannelDialogOpen: (createChannelDialogOpen: boolean) =>
    set({ createChannelDialogOpen }),

  customMcpDialogOpen: false,
  setCustomMcpDialogOpen: (customMcpDialogOpen: boolean) =>
    set({ customMcpDialogOpen }),

  contextItems: [],
  setContextItems: (contextItems: any[]) => set({ contextItems }),

  presenceState: undefined,
  setPresenceState: (presenceState: ReturnType<typeof usePresence>) =>
    set({ presenceState }),

  leftSidebarRef: null,
  setLeftSidebarRef: (
    leftSidebarRef: React.RefObject<ImperativePanelHandle | null> | null
  ) => {
    set({ leftSidebarRef });
    if (leftSidebarRef?.current) {
      setTimeout(() => {
        set({
          isLeftSidebarCollapsed:
            leftSidebarRef.current?.isCollapsed() ?? false,
        });
      }, 0);
    }
  },
  isLeftSidebarCollapsed: false,
  setIsLeftSidebarCollapsed: (isLeftSidebarCollapsed: boolean) => set({ isLeftSidebarCollapsed }),
  toggleLeftSidebarCollapse: () => {
    const state = useStore.getState();
    if (state.leftSidebarRef) {
      if (state.leftSidebarRef.current?.isCollapsed()) {
        state.leftSidebarRef.current?.expand();
      } else {
        state.leftSidebarRef.current?.collapse();
      }
    }
  },

  rightSidebarRef: null,
  setRightSidebarRef: (
    rightSidebarRef: React.RefObject<ImperativePanelHandle | null> | null
  ) => {
    set({ rightSidebarRef });
    if (rightSidebarRef?.current) {
      setTimeout(() => {
        set({
          isRightSidebarCollapsed:
            rightSidebarRef.current?.isCollapsed() ?? false,
        });
      }, 0);
    }
  },
  isRightSidebarCollapsed: false,
  setIsRightSidebarCollapsed: (isRightSidebarCollapsed: boolean) => set({ isRightSidebarCollapsed }),
  toggleRightSidebarCollapse: () => {
    const state = useStore.getState();
    if (state.rightSidebarRef) {
      if (state.rightSidebarRef.current?.isCollapsed()) {
        state.rightSidebarRef.current?.expand();
      } else {
        state.rightSidebarRef.current?.collapse();
      }
    }
  },
}));
