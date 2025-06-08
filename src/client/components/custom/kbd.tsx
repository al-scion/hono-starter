import { cn } from "@/lib/utils"
import { forwardRef } from "react"
import { Icon } from "@/components/custom/icons"

interface Hotkey {
  id: string;
  label: string;
  keys: {
    windows: string;
    mac: string;
  };
  enabled: boolean;
}

const placeholderHotkeys: Hotkey[] = [
  {
    id: 'placeholder',
    label: 'Placeholder',
    keys: { windows: 'ctrl+p', mac: 'cmd+p' },
    enabled: true,
  },
]

const KEY_SYMBOLS: Record<string, Record<string, string>> = {
  mac: {
    'command': '⌘',
    'cmd': '⌘',
    'meta': '⌘',
    'option': '⌥',
    'alt': '⌥',
    'shift': '⇧',
    'control': 'ctrl',
    'up': '↑',
    'down': '↓',
    'left': '←',
    'right': '→',
    'enter': '⏎',
    'return': '⏎',
    'space': '␣',
    'escape': 'esc',
    'backspace': '⌫',
    'semicolon': ';',
    'comma': ',',
    'backslash': '\\',
    'bracketleft': '[',
    'bracketright': ']',
    'slash': '/',
    'period': '.',
    'equal': '=',
    'minus': '-',
  },
  windows: {
    'control': 'ctrl',
    'alternate': 'alt',
    'escape': 'esc',
    'up': '↑',
    'down': '↓',
    'left': '←',
    'right': '→',
    'semicolon': ';',
    'comma': ',',
    'backslash': '\\',
    'bracketleft': '[',
    'bracketright': ']',
    'slash': '/',
    'period': '.',
    'equal': '=',
    'minus': '-',
  },
}

interface KbdPropsWithKeys extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  keys: string[] | string;
  shortcutId?: never;
  icon?: never;
  
  forceVisible?: boolean;
  kbdClassName?: string;
  variant?: 'default' | 'secondary';
}

interface KbdPropsWithShortcutId extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  keys?: never;
  shortcutId: string;
  icon?: never;

  forceVisible?: boolean;  
  kbdClassName?: string;
  variant?: 'default' | 'secondary';
}

interface KbdPropsWithIcon extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  keys?: never;
  shortcutId?: never;
  icon: string;

  forceVisible?: boolean;
  kbdClassName?: string;
  variant?: 'default' | 'secondary';
}

// Union the three interfaces to create a type that requires one of them
type KbdProps = KbdPropsWithKeys | KbdPropsWithShortcutId | KbdPropsWithIcon;

const Kbd = forwardRef<HTMLDivElement, KbdProps>(
  ({ className, kbdClassName, keys, shortcutId, icon, forceVisible = false, variant = 'default', ...props }, ref) => {

    const os = window.navigator.userAgent.toLowerCase().includes('mac') ? 'mac' : 'windows';

    const hotkeys = placeholderHotkeys;
    let hotkeysEnabled = true;

    let keyArray: string[] = [];
    if (shortcutId) {
      const hotkey = hotkeys.find(hotkey => hotkey.id === shortcutId);
      if (hotkey) {
        const hotkeyKeys = hotkey.keys[os];
        hotkeysEnabled = hotkey.enabled;
        keyArray = hotkeyKeys.split('+');
      } else {
        console.error(`Invalid shortcutId: ${shortcutId}. Valid options are: ${hotkeys.map(a => a.id).join(', ')}`);
        keyArray = [];
      }
    } else if (keys) {
      keyArray = Array.isArray(keys) ? keys : keys.split('+');
    }

    // Format keys using platform-specific symbols
    const formattedKeys = keyArray.map(key => {
      const symbols = KEY_SYMBOLS[os];
      const lowercaseKey = key.toLowerCase();
      return symbols[lowercaseKey] || key;
    });

    if (!hotkeysEnabled && !forceVisible) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn("flex flex-row items-center gap-0.5", className)}
        {...props}
      >
        {icon ? (
          <kbd
            className={cn(
              "flex w-5 h-5 items-center justify-center rounded-sm font-sans text-xs text-foreground font-normal select-none cursor-default border shadow-sm",
              variant === 'default' && "bg-background",
              variant === 'secondary' && "bg-muted",
              kbdClassName
            )}
          >
            <Icon name={icon} className="size-3" />
          </kbd>
        ) : (
          formattedKeys.map((key, index) => 
            key === 'then' ? (
              <span key={index} className="flex h-5 px-0.5 items-center justify-center rounded-sm font-sans text-[11px] text-muted-foreground font-normal select-none cursor-default">
                {key}
              </span>
            ) : ['↑', '↓', '←', '→'].includes(key) ? (
              <kbd
                key={index}
                className={cn(
                  "flex h-5 items-center justify-center rounded-sm font-sans text-xs text-foreground font-normal select-none cursor-default border shadow-sm",
                  "w-5",
                  variant === 'default' && "bg-background",
                  variant === 'secondary' && "bg-muted",
                  kbdClassName
                )}
              >
                <Icon 
                  name={key === '↑' ? 'ArrowUp' : 
                         key === '↓' ? 'ArrowDown' : 
                         key === '←' ? 'ArrowLeft' : 'ArrowRight'} 
                  className="h-3 w-3" 
                />
              </kbd>
            ) : (
              <kbd
                key={index}
                className={cn(
                  "flex h-5 items-center justify-center rounded-sm font-sans text-xs text-foreground font-normal select-none cursor-default border shadow-sm",
                  key.length > 1 ? "min-w-[1.25rem] px-[3px] tracking-normal" : "w-5 tracking-tight",
                  variant === 'default' && "bg-background",
                  variant === 'secondary' && "bg-muted",
                  kbdClassName
                )}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </kbd>
            )
          )
        )}
      </div>
    )
  }
)

Kbd.displayName = "Kbd"

export { Kbd } 