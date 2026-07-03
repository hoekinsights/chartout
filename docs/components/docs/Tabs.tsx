'use client'

import * as React from 'react'
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react'
import { cn } from 'fumadocs-ui/utils/cn'
import * as Unstyled from 'fumadocs-ui/components/tabs.unstyled'

const TabsContext = createContext<{
  items?: string[]
  collection: string[]
  registerTabId: (value: string, id: string) => void
} | null>(null)

function useTabContext() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('You must wrap your component in <Tabs>')
  return ctx
}

export interface TabsProps extends Omit<ComponentProps<typeof Unstyled.Tabs>, 'value' | 'onValueChange'> {
  items?: string[]
  defaultIndex?: number
  label?: ReactNode
}

export interface TabProps extends Omit<ComponentProps<typeof Unstyled.TabsContent>, 'value'> {
  value?: string
  /** DOM id for deep links and sidebar TOC (use with `updateAnchor` on Tabs). */
  id?: string
}

const TabsList = React.forwardRef<
  React.ComponentRef<typeof Unstyled.TabsList>,
  ComponentProps<typeof Unstyled.TabsList>
>((props, ref) => (
  <Unstyled.TabsList
    ref={ref}
    {...props}
    className={cn(
      'flex overflow-x-auto border-b border-fd-border bg-fd-muted not-prose',
      props.className,
    )}
  />
))
TabsList.displayName = 'TabsList'

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof Unstyled.TabsTrigger>,
  ComponentProps<typeof Unstyled.TabsTrigger>
>(({ children, className, ...props }, ref) => (
  <Unstyled.TabsTrigger
    ref={ref}
    {...props}
    className={cn(
      'inline-flex items-stretch px-3 text-sm font-medium text-fd-muted-foreground transition-colors',
      'hover:text-fd-foreground',
      'data-[state=active]:text-fd-primary',
      '[&_svg]:size-4',
      className,
    )}
  >
    <span className="chartout-tab-label inline-flex items-center gap-2 whitespace-nowrap px-3">
      {children}
    </span>
  </Unstyled.TabsTrigger>
))
TabsTrigger.displayName = 'TabsTrigger'

function TabsContent({ value, className, ...props }: ComponentProps<typeof Unstyled.TabsContent>) {
  return (
    <Unstyled.TabsContent
      value={value}
      forceMount
      {...props}
      className={cn(
        'outline-none prose-no-margin data-[state=inactive]:hidden',
        '[&_figure]:!my-0 [&_pre]:!my-0',
        className,
      )}
    />
  )
}

/** Compact scroll target so sidebar TOC intersection (threshold 1) can match tab sections. */
function TabAnchor({ id, label }: { id: string; label: string }) {
  return (
    <h2
      id={id}
      tabIndex={-1}
      className="scroll-m-28 not-prose pointer-events-none m-0 h-px overflow-hidden border-0 p-0 opacity-0"
    >
      {label}
    </h2>
  )
}

export function Tabs({
  ref,
  className,
  items,
  label,
  defaultIndex = 0,
  defaultValue = items ? escapeValue(items[defaultIndex]) : undefined,
  updateAnchor = false,
  ...props
}: TabsProps & { ref?: React.Ref<React.ComponentRef<typeof Unstyled.Tabs>> }) {
  const [value, setValue] = useState(defaultValue)
  const collection = useMemo(() => [], [])
  const valueToIdMap = useRef(new Map<string, string>())

  const registerTabId = React.useCallback((tabValue: string, id: string) => {
    valueToIdMap.current.set(tabValue, id)
  }, [])

  const selectFromHash = React.useCallback(() => {
    const hash = window.location.hash.slice(1)
    if (!hash) return
    for (const [tabValue, id] of valueToIdMap.current.entries()) {
      if (id === hash) {
        setValue(tabValue)
        requestAnimationFrame(() => {
          document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
        return
      }
    }
  }, [])

  useEffect(() => {
    if (!updateAnchor) return
    selectFromHash()
    window.addEventListener('hashchange', selectFromHash)
    return () => window.removeEventListener('hashchange', selectFromHash)
  }, [updateAnchor, selectFromHash])

  return (
    <Unstyled.Tabs
      ref={ref}
      className={cn('chartout-tabs my-6 flex flex-col', className)}
      value={value}
      onValueChange={(v) => {
        if (items && !items.some((item) => escapeValue(item) === v)) return
        setValue(v)
        if (updateAnchor) {
          const id = valueToIdMap.current.get(v)
          if (id) window.history.replaceState(null, '', `#${id}`)
        }
      }}
      {...props}
    >
      {items && (
        <TabsList>
          {label && <span className="my-auto me-auto text-sm font-medium">{label}</span>}
          {items.map((item) => (
            <TabsTrigger key={item} value={escapeValue(item)}>
              {item}
            </TabsTrigger>
          ))}
        </TabsList>
      )}
      <TabsContext.Provider
        value={useMemo(() => ({ items, collection, registerTabId }), [collection, items, registerTabId])}
      >
        {props.children}
      </TabsContext.Provider>
    </Unstyled.Tabs>
  )
}

export function Tab({ value, id, children, ...props }: TabProps) {
  const { items, registerTabId } = useTabContext()
  const resolved =
    value ??
    items?.at(useCollectionIndex())

  if (!resolved) {
    throw new Error('Failed to resolve tab `value`, please pass a `value` prop to the Tab component.')
  }

  const tabValue = escapeValue(resolved)

  useEffect(() => {
    if (id) registerTabId(tabValue, id)
  }, [id, registerTabId, tabValue])

  return (
    <TabsContent value={tabValue} {...props}>
      {id ? <TabAnchor id={id} label={resolved} /> : null}
      {children}
    </TabsContent>
  )
}

function useCollectionIndex() {
  const key = useId()
  const { collection } = useTabContext()

  useEffect(() => {
    return () => {
      const idx = collection.indexOf(key)
      if (idx !== -1) collection.splice(idx, 1)
    }
  }, [key, collection])

  if (!collection.includes(key)) collection.push(key)
  return collection.indexOf(key)
}

function escapeValue(v: string) {
  return v.toLowerCase().replace(/\s/, '-')
}
