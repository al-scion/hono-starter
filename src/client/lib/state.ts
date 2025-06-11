import { create } from "zustand";

interface State {
  count: number;
  increment: () => void;
  decrement: () => void;
  setCount: (count: number) => void;

  chatId: string;
  setChatId: (chatId: string) => void;

  commandOpen: boolean;
  setCommandOpen: (commandOpen: boolean) => void;

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

  commandOpen: false,
  setCommandOpen: (commandOpen: boolean) => set({ commandOpen }),

  contextItems: [],
  setContextItems: (contextItems: any[]) => set({ contextItems }),
}));