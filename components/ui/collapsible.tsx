"use client"

import * as React from "react"
import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"

function Collapsible({
  asChild,
  children,
  render,
  ...props
}: CollapsiblePrimitive.Root.Props & { asChild?: boolean }) {
  const renderProp = asChild && React.isValidElement(children) ? children : render
  return (
    <CollapsiblePrimitive.Root
      data-slot="collapsible"
      render={renderProp}
      {...props}
    >
      {asChild ? undefined : children}
    </CollapsiblePrimitive.Root>
  )
}

function CollapsibleTrigger({
  asChild,
  children,
  render,
  ...props
}: CollapsiblePrimitive.Trigger.Props & { asChild?: boolean }) {
  const renderProp = asChild && React.isValidElement(children) ? children : render
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      render={renderProp}
      {...props}
    >
      {asChild ? undefined : children}
    </CollapsiblePrimitive.Trigger>
  )
}

function CollapsibleContent({
  asChild,
  children,
  render,
  ...props
}: CollapsiblePrimitive.Panel.Props & { asChild?: boolean }) {
  const renderProp = asChild && React.isValidElement(children) ? children : render
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-content"
      render={renderProp}
      {...props}
    >
      {asChild ? undefined : children}
    </CollapsiblePrimitive.Panel>
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
