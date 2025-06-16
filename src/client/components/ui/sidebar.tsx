"use client"

import * as React from "react"
import { Slot as SlotPrimitive } from "radix-ui"
import { cva, VariantProps } from "class-variance-authority"
import { ChevronsLeft, PanelLeftIcon } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem" // Why is this here???
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"
const SIDEBAR_RIGHT_KEYBOARD_SHORTCUT = "l"

// Resizable sidebar settings (all strings to unify unit handling)
const SIDEBAR_LEFT_WIDTH_DEFAULT = "240px"
const SIDEBAR_LEFT_WIDTH_MIN = "200px"
const SIDEBAR_LEFT_WIDTH_MAX = "360px"

const SIDEBAR_RIGHT_WIDTH_DEFAULT = "480px"
const SIDEBAR_RIGHT_WIDTH_MIN = "320px"
const SIDEBAR_RIGHT_WIDTH_MAX = "600px"

type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
  side: "left" | "right"
  setWidth?: (width: string) => void // optional setter for dynamic width
}

type SidebarProviderContextProps = {
  leftSidebar: SidebarContextProps
  rightSidebar: SidebarContextProps
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)
const SidebarProviderContext = React.createContext<SidebarProviderContextProps | null>(null)

function useSidebar(side?: "left" | "right") {
  const context = React.useContext(SidebarContext)
  const providerContext = React.useContext(SidebarProviderContext)
  
  // If we have a direct sidebar context (from individual sidebar), use it
  if (context) {
    return context
  }
  
  // If we have a provider context and a side is specified, use the appropriate sidebar
  if (providerContext && side) {
    return side === "left" ? providerContext.leftSidebar : providerContext.rightSidebar
  }
  
  // If we have a provider context but no side specified, try to determine from the nearest Sidebar component
  if (providerContext) {
    // Default to left sidebar if no side specified
    return providerContext.leftSidebar
  }
  
  throw new Error("useSidebar must be used within a SidebarProvider.")
}

function SidebarProvider({
  defaultOpen = true,
  defaultOpenRight = true,
  open: openProp,
  openRight: openRightProp,
  onOpenChange: setOpenProp,
  onOpenRightChange: setOpenRightProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  defaultOpenRight?: boolean
  open?: boolean
  openRight?: boolean
  onOpenChange?: (open: boolean) => void
  onOpenRightChange?: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const [openMobileLeft, setOpenMobileLeft] = React.useState(false)
  const [openMobileRight, setOpenMobileRight] = React.useState(false)

  // Left sidebar state
  const [_openLeft, _setOpenLeft] = React.useState(defaultOpen)
  const openLeft = openProp ?? _openLeft
  const setOpenLeft = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(openLeft) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpenLeft(openState)
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}_left=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, openLeft]
  )

  // Right sidebar state
  const [_openRight, _setOpenRight] = React.useState(defaultOpenRight)
  const openRight = openRightProp ?? _openRight
  const setOpenRight = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(openRight) : value
      if (setOpenRightProp) {
        setOpenRightProp(openState)
      } else {
        _setOpenRight(openState)
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}_right=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenRightProp, openRight]
  )

  // Helper to toggle the left sidebar.
  const toggleLeftSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobileLeft((open) => !open) : setOpenLeft((open) => !open)
  }, [isMobile, setOpenLeft, setOpenMobileLeft])

  // Helper to toggle the right sidebar.
  const toggleRightSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobileRight((open) => !open) : setOpenRight((open) => !open)
  }, [isMobile, setOpenRight, setOpenMobileRight])

  // Adds a keyboard shortcut to toggle the left sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleLeftSidebar()
      }
      if (
        event.key === SIDEBAR_RIGHT_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleRightSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleLeftSidebar, toggleRightSidebar])

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const stateLeft = openLeft ? "expanded" : "collapsed"
  const stateRight = openRight ? "expanded" : "collapsed"

  const leftSidebarContext = React.useMemo<SidebarContextProps>(
    () => ({
      state: stateLeft,
      open: openLeft,
      setOpen: setOpenLeft,
      isMobile,
      openMobile: openMobileLeft,
      setOpenMobile: setOpenMobileLeft,
      toggleSidebar: toggleLeftSidebar,
      side: "left",
    }),
    [stateLeft, openLeft, setOpenLeft, isMobile, openMobileLeft, setOpenMobileLeft, toggleLeftSidebar]
  )

  const rightSidebarContext = React.useMemo<SidebarContextProps>(
    () => ({
      state: stateRight,
      open: openRight,
      setOpen: setOpenRight,
      isMobile,
      openMobile: openMobileRight,
      setOpenMobile: setOpenMobileRight,
      toggleSidebar: toggleRightSidebar,
      side: "right",
    }),
    [stateRight, openRight, setOpenRight, isMobile, openMobileRight, setOpenMobileRight, toggleRightSidebar]
  )

  const contextValue = React.useMemo<SidebarProviderContextProps>(
    () => ({
      leftSidebar: leftSidebarContext,
      rightSidebar: rightSidebarContext,
    }),
    [leftSidebarContext, rightSidebarContext]
  )

  return (
    <SidebarProviderContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarProviderContext.Provider>
  )
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}) {
  const sidebarContext = useSidebar(side)
  const { isMobile, state, openMobile, setOpenMobile } = sidebarContext

  // ------------------------------------------------------------------
  // Width state & persistence
  // ------------------------------------------------------------------
  const storageKey = side === "right" ? "sidebarWidthRight" : "sidebarWidthLeft"
  const [width, setWidth] = React.useState<string>(() => {
    if (typeof window === "undefined") {
      return side === "right" ? SIDEBAR_RIGHT_WIDTH_DEFAULT : SIDEBAR_LEFT_WIDTH_DEFAULT
    }
    return (
      localStorage.getItem(storageKey) ??
      (side === "right" ? SIDEBAR_RIGHT_WIDTH_DEFAULT : SIDEBAR_LEFT_WIDTH_DEFAULT)
    )
  })

  // Expose setWidth through context so SidebarRail can update it
  const extendedSidebarContext = React.useMemo(() => ({
    ...sidebarContext,
    setWidth,
  }), [sidebarContext, setWidth])

  if (collapsible === "none") {
    return (
      <SidebarContext.Provider value={extendedSidebarContext}>
        <div
          data-slot="sidebar"
          style={{ "--sidebar-width": width, ...style } as React.CSSProperties}
          className={cn(
            "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </SidebarContext.Provider>
    )
  }

  if (isMobile) {
    return (
      <SidebarContext.Provider value={extendedSidebarContext}>
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            data-sidebar="sidebar"
            data-slot="sidebar"
            data-mobile="true"
            className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden"
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
              } as React.CSSProperties
            }
            side={side}
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Sidebar</SheetTitle>
              <SheetDescription>Displays the mobile sidebar.</SheetDescription>
            </SheetHeader>
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      </SidebarContext.Provider>
    )
  }

  return (
    <SidebarContext.Provider value={extendedSidebarContext}>
      <div
        className="group peer text-sidebar-foreground hidden md:block"
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-variant={variant}
        data-side={side}
        data-slot="sidebar"
        style={{ "--sidebar-width": width, ...style } as React.CSSProperties}
        {...props}
      >
        {/* This is what handles the sidebar gap on desktop */}
        <div
          data-slot="sidebar-gap"
          className={cn(
            "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
            "group-data-[collapsible=offcanvas]:w-0",
            "group-data-[side=right]:rotate-180",
            variant === "floating" || variant === "inset"
              ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
              : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
          )}
        />
        <div
          data-slot="sidebar-container"
          className={cn(
            "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
            side === "left"
              ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
              : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
            // Adjust the padding for floating and inset variants.
            variant === "floating" || variant === "inset"
              ? "p-2 group-data-[side=right]:pl-0 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
              : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
            className
          )}
        >
          <div
            data-sidebar="sidebar"
            data-slot="sidebar-inner"
            className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"
          >
            {children}
          </div>
        </div>
      </div>
    </SidebarContext.Provider>
  )
}

function SidebarTrigger({
  className,
  onClick,
  side,
  ...props
}: React.ComponentProps<typeof Button> & {
  side?: "left" | "right"
}) {
  const sidebarContext = useSidebar(side)
  const { toggleSidebar, state } = sidebarContext

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-6 hover:bg-sidebar-accent", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      {state === 'collapsed' ? <PanelLeftIcon /> : <ChevronsLeft />}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

function SidebarRail({ 
  className, 
  side,
  ...props 
}: React.ComponentProps<"button"> & {
  side?: "left" | "right"
}) {
  const sidebarContext = useSidebar(side)
  const { toggleSidebar } = sidebarContext

  // Enable drag-to-resize alongside the existing click-to-toggle behaviour.
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rail = e.currentTarget
    const sidebarEl = rail.closest('[data-slot="sidebar"]') as HTMLElement | null
    if (!sidebarEl) return

    // Get elements that animate width so we can disable transitions while dragging.
    const gapEl = sidebarEl.querySelector('[data-slot="sidebar-gap"]') as HTMLElement | null
    const containerEl = sidebarEl.querySelector('[data-slot="sidebar-container"]') as HTMLElement | null

    const elements: HTMLElement[] = [sidebarEl, gapEl, containerEl].filter(Boolean) as HTMLElement[]
    const originalTransitions = elements.map(el => el.style.transition)
    elements.forEach(el => { el.style.transition = 'none' })

    const startX = e.clientX
    const initialWidth = sidebarEl.getBoundingClientRect().width
    const resolvedSide = (side ?? sidebarEl.getAttribute('data-side')) as 'left' | 'right'
    const isLeft = resolvedSide === 'left'
    let dragged = false
    let lastWidth = initialWidth

    const onPointerMove = (event: PointerEvent) => {
      const dx = event.clientX - startX
      if (Math.abs(dx) > 2) dragged = true

      const newWidth = isLeft ? initialWidth + dx : initialWidth - dx
      const minPx = resolvedSide === 'right' ? parseInt(SIDEBAR_RIGHT_WIDTH_MIN) : parseInt(SIDEBAR_LEFT_WIDTH_MIN)
      const maxPx = resolvedSide === 'right' ? parseInt(SIDEBAR_RIGHT_WIDTH_MAX) : parseInt(SIDEBAR_LEFT_WIDTH_MAX)
      const clamped = Math.max(minPx, Math.min(maxPx, newWidth))

      lastWidth = clamped
      sidebarEl.style.setProperty('--sidebar-width', `${clamped}px`)
    }

    const onPointerUp = (_event: PointerEvent) => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)

      // Restore original transitions.
      elements.forEach((el, idx) => { el.style.transition = originalTransitions[idx] })

      // Persist width if it was dragged.
      if (dragged) {
        const storageKey = resolvedSide === 'right' ? 'sidebarWidthRight' : 'sidebarWidthLeft'
        const newWidthStr = `${lastWidth}px`
        try {
          localStorage.setItem(storageKey, newWidthStr)
        } catch {}
        sidebarContext.setWidth?.(newWidthStr)
      } else {
        // No significant drag – treat as click to toggle.
        toggleSidebar()
      }
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onPointerDown={handlePointerDown}
      title="Toggle Sidebar"
      className={cn(
        "hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex",
        "in-data-[side=left]:cursor-col-resize in-data-[side=right]:cursor-col-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        // "[[data-side=right][data-variant=inset]_&]:-left-1.25",
        className
      )}
      {...props}
    />
  )
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "bg-background relative flex w-full flex-1 flex-col",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-lg md:peer-data-[variant=inset]:border md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className
      )}
      {...props}
    />
  )
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn("bg-background h-8 w-full shadow-none", className)}
      {...props}
    />
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("bg-sidebar-border mx-2 w-auto", className)}
      {...props}
    />
  )
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  )
}

function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? SlotPrimitive.Slot : "div"

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? SlotPrimitive.Slot : "button"

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 md:after:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  )
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  )
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  )
}

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-hover/menu-item:bg-sidebar-accent group-hover/menu-item:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string | React.ComponentProps<typeof TooltipContent>
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? SlotPrimitive.Slot : "button"
  const { isMobile, state } = useSidebar()

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "cursor-pointer border border-transparent",
        sidebarMenuButtonVariants({ variant, size }),
        className
      )}
      {...props}
    />
  )

  if (!tooltip) {
    return button
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip}
      />
    </Tooltip>
  )
}

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  showOnHover?: boolean
}) {
  const Comp = asChild ? SlotPrimitive.Slot : "button"

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        "text-sidebar-foreground cursor-pointer ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-sm p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 md:after:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean
}) {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }, [])

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  )
}

function SidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
  size?: "sm" | "md"
  isActive?: boolean
}) {
  const Comp = asChild ? SlotPrimitive.Slot : "a"

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
