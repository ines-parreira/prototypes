import { Children, cloneElement, isValidElement, useState } from 'react'
import type { Key, ReactNode } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useFlag } from '@repo/feature-flags'
import { NavigationSidebarTooltip } from '@repo/navigation'

import { Button, Menu, MenuItem, TooltipContent } from '@gorgias/axiom'

import type { DebugMenuItemProps } from './DebugMenuItem'

type DebugMenuProps = {
    children: ReactNode
}

type ResolvedItem = {
    id: string
    icon: DebugMenuItemProps['icon']
    label: string
    panel: ReactNode
    onSelect?: () => void
}

export function DebugMenu({ children }: DebugMenuProps) {
    const isFlagEnabled = useFlag(FeatureFlagKey.DebugMenu, false)
    const isEnabled = isFlagEnabled || !!window.USER_IMPERSONATED
    const [openPanel, setOpenPanel] = useState<string | null>(null)

    if (!isEnabled) return null

    const items: ResolvedItem[] = []

    Children.forEach(children, (child) => {
        if (isValidElement<DebugMenuItemProps>(child)) {
            items.push({
                id: child.props.id,
                icon: child.props.icon,
                label: child.props.label,
                panel: child.props.children,
                onSelect: child.props.onSelect,
            })
        }
    })

    if (items.length === 0) return null

    function handleAction(key: Key) {
        const id = String(key)
        const item = items.find((i) => i.id === id)

        if (item?.onSelect) {
            item.onSelect()
            return
        }

        setOpenPanel(id)
    }

    return (
        <>
            <Menu
                trigger={
                    <NavigationSidebarTooltip
                        placement="top"
                        trigger={
                            <Button
                                variant="tertiary"
                                size="sm"
                                icon="system-window-terminal"
                            />
                        }
                    >
                        <TooltipContent title="Dev tools" />
                    </NavigationSidebarTooltip>
                }
                aria-label="Debug menu"
                onAction={handleAction}
            >
                {items.map((item) => (
                    <MenuItem
                        key={item.id}
                        id={item.id}
                        leadingSlot={item.icon}
                        label={item.label}
                    />
                ))}
            </Menu>
            {items.map((item) =>
                !item.onSelect && isValidElement(item.panel)
                    ? cloneElement(item.panel, {
                          ...item.panel.props,
                          key: item.id,
                          isOpen: openPanel === item.id,
                          onOpenChange: (open: boolean) =>
                              setOpenPanel(open ? item.id : null),
                      })
                    : null,
            )}
        </>
    )
}
