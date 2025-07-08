import { forwardRef } from 'react';
import { Icon } from '@/components/custom/icons';
import { shortcuts } from '@/components/shortcuts/config';
import { cn } from '@/lib/utils';

const KEY_SYMBOLS: Record<string, Record<string, string>> = {
  mac: {
    command: '⌘',
    cmd: '⌘',
    meta: '⌘',
    option: '⌥',
    alt: '⌥',
    shift: '⇧',
    control: 'ctrl',
    up: '↑',
    down: '↓',
    left: '←',
    right: '→',
    enter: '⏎',
    return: '⏎',
    space: '␣',
    escape: 'esc',
    backspace: '⌫',
    semicolon: ';',
    comma: ',',
    backslash: '\\',
    bracketleft: '[',
    bracketright: ']',
    slash: '/',
    period: '.',
    equal: '=',
    minus: '-',
  },
  windows: {
    control: 'ctrl',
    alternate: 'alt',
    escape: 'esc',
    up: '↑',
    down: '↓',
    left: '←',
    right: '→',
    semicolon: ';',
    comma: ',',
    backslash: '\\',
    bracketleft: '[',
    bracketright: ']',
    slash: '/',
    period: '.',
    equal: '=',
    minus: '-',
  },
};

interface KbdPropsWithKeys
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  keys: string[] | string;
  shortcutId?: never;
  icon?: never;

  forceVisible?: boolean;
  kbdClassName?: string;
  variant?: 'default' | 'secondary';
}

interface KbdPropsWithShortcutId
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  keys?: never;
  shortcutId: string;
  icon?: never;

  forceVisible?: boolean;
  kbdClassName?: string;
  variant?: 'default' | 'secondary';
}

interface KbdPropsWithIcon
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
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
  (
    {
      className,
      kbdClassName,
      keys,
      shortcutId,
      icon,
      forceVisible = false,
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const os = window.navigator.userAgent.toLowerCase().includes('mac')
      ? 'mac'
      : 'windows';

    const hotkeys = shortcuts;
    let hotkeysEnabled = true;

    let keyArray: string[] = [];
    if (shortcutId) {
      const hotkey = hotkeys.find((hotkey) => hotkey.id === shortcutId);
      if (hotkey) {
        const hotkeyKeys = hotkey.keys[os];
        hotkeysEnabled = hotkey.enabled;
        keyArray = hotkeyKeys.split('+');
      } else {
        keyArray = [];
      }
    } else if (keys) {
      keyArray = Array.isArray(keys) ? keys : keys.split('+');
    }

    // Format keys using platform-specific symbols
    const formattedKeys = keyArray.map((key) => {
      const symbols = KEY_SYMBOLS[os];
      const lowercaseKey = key.toLowerCase();
      return symbols[lowercaseKey] || key;
    });

    if (!(hotkeysEnabled || forceVisible)) {
      return null;
    }

    return (
      <div
        className={cn('flex flex-row items-center gap-1', className)}
        ref={ref}
        {...props}
      >
        {icon ? (
          <kbd
            className={cn(
              'flex h-5 w-5 cursor-default select-none items-center justify-center rounded-sm border font-normal font-sans text-foreground text-xs shadow-xs',
              variant === 'default' && 'bg-background',
              variant === 'secondary' &&
                'border-none bg-muted-foreground/30 text-muted-background',
              kbdClassName
            )}
          >
            <Icon className="size-3" name={icon} />
          </kbd>
        ) : (
          formattedKeys.map((key, index) =>
            key === 'then' ? (
              <span
                className="flex h-5 cursor-default select-none items-center justify-center rounded-sm px-0.5 font-normal font-sans text-[11px] text-muted-foreground"
                key={index}
              >
                {key}
              </span>
            ) : ['↑', '↓', '←', '→'].includes(key) ? (
              <kbd
                className={cn(
                  'flex h-5 cursor-default select-none items-center justify-center rounded-sm border font-normal font-sans text-foreground text-xs shadow-xs',
                  'w-5',
                  variant === 'default' && 'bg-background',
                  variant === 'secondary' &&
                    'border-none bg-muted-foreground/30 text-muted-background',
                  kbdClassName
                )}
                key={index}
              >
                <Icon
                  className="h-3 w-3"
                  name={
                    key === '↑'
                      ? 'ArrowUp'
                      : key === '↓'
                        ? 'ArrowDown'
                        : key === '←'
                          ? 'ArrowLeft'
                          : 'ArrowRight'
                  }
                />
              </kbd>
            ) : (
              <kbd
                className={cn(
                  'flex h-5 cursor-default select-none items-center justify-center rounded-sm border font-normal font-sans text-foreground text-xs shadow-xs',
                  key.length > 1
                    ? 'min-w-[1.25rem] px-[3px] tracking-normal'
                    : 'w-5 tracking-tight',
                  variant === 'default' && 'bg-background',
                  variant === 'secondary' &&
                    'border-none bg-muted-foreground/30 text-muted-background',
                  kbdClassName
                )}
                key={index}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </kbd>
            )
          )
        )}
      </div>
    );
  }
);

Kbd.displayName = 'Kbd';

export { Kbd };
