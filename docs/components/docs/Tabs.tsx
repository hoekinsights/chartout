'use client'

import * as React from 'react'
import { createContext, useContext, useEffect, useId, useMemo, useState, type ComponentProps, type ReactNode } from 'react'
import { cn } from 'fumadocs-ui/utils/cn'
import * as Unstyled from 'fumadocs-ui/components/tabs.unstyled'

const TabsContext = createContext<{ items?: string[]; collection: string[] } | null>(null)

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

export function Tabs({
  ref,
  className,
  items,
  label,
  defaultIndex = 0,
  defaultValue = items ? escapeValue(items[defaultIndex]) : undefined,
  ...props
}: TabsProps & { ref?: React.Ref<React.ComponentRef<typeof Unstyled.Tabs>> }) {
  const [value, setValue] = useState(defaultValue)
  const collection = useMemo(() => [], [])

  return (
    <Unstyled.Tabs
      ref={ref}
      className={cn('chartout-tabs my-6 flex flex-col', className)}
      value={value}
      onValueChange={(v) => {
        if (items && !items.some((item) => escapeValue(item) === v)) return
        setValue(v)
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
      <TabsContext.Provider value={useMemo(() => ({ items, collection }), [collection, items])}>
        {props.children}
      </TabsContext.Provider>
    </Unstyled.Tabs>
  )
}

export function Tab({ value, ...props }: TabProps) {
  const { items } = useTabContext()
  const resolved =
    value ??
    items?.at(useCollectionIndex())

  if (!resolved) {
    throw new Error('Failed to resolve tab `value`, please pass a `value` prop to the Tab component.')
  }

  return <TabsContent value={escapeValue(resolved)} {...props} />
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
