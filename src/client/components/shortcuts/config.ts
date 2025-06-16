interface Shortcut {
  id: string;
  label: string;
  type: string;
  keys: {
    windows: string;
    mac: string;
  };
  enabled: boolean;
}

export const shortcuts: Shortcut[] = [
  {
    id: 'chat',
    label: 'Chat',
    type: 'General',
    keys: {
      windows: 'Ctrl+K',
      mac: 'Command+K',
    },
    enabled: true,
  },
  {
    id: 'rightSidebarToggle',
    label: 'Close sidebar',
    type: 'General',
    keys: {
      windows: 'Ctrl+L',
      mac: 'Command+L',
    },
    enabled: true,
  },
  {
    id: 'leftSidebarToggle',
    label: 'Open sidebar',
    type: 'General',
    keys: {
      windows: 'Ctrl+B',
      mac: 'Command+B',
    },
    enabled: true,
  },
]