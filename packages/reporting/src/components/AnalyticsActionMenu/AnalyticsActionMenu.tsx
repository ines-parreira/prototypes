import { useRef, useState } from 'react'
import type { ReactNode } from 'react'

import {
    Button,
    Icon,
    Menu,
    MenuItem,
    Popover,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

export type AnalyticsActionItem = {
    icon: string
    label: string
    tooltip?: string
    onClick?: () => void
    isDisabled?: boolean
    dropdownContent?: (close: () => void) => ReactNode
}

type Props = {
    actions: AnalyticsActionItem[]
}

export const AnalyticsActionMenu = ({ actions }: Props) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [openDropdownLabel, setOpenDropdownLabel] = useState<string | null>(
        null,
    )
    const containerRef = useRef<HTMLDivElement>(null)

    if (actions.length === 0) return null

    const closeDropdown = () => setOpenDropdownLabel(null)

    if (actions.length === 1) {
        const [action] = actions

        if (action.dropdownContent) {
            const popover = (
                <Popover
                    padding={0}
                    isOpen={openDropdownLabel === action.label}
                    onOpenChange={(open) =>
                        setOpenDropdownLabel(open ? action.label : null)
                    }
                    trigger={
                        <Button
                            variant="tertiary"
                            icon={action.icon as IconName}
                            aria-label={action.label}
                            isDisabled={action.isDisabled}
                        />
                    }
                >
                    {action.dropdownContent(closeDropdown)}
                </Popover>
            )

            if (action.tooltip) {
                return (
                    <Tooltip trigger={popover}>
                        <TooltipContent title={action.tooltip} />
                    </Tooltip>
                )
            }

            return popover
        }

        const button = (
            <Button
                variant="tertiary"
                icon={action.icon as IconName}
                aria-label={action.label}
                onClick={action.onClick}
                isDisabled={action.isDisabled}
            />
        )

        if (action.tooltip) {
            return (
                <Tooltip trigger={button}>
                    <TooltipContent title={action.tooltip} />
                </Tooltip>
            )
        }

        return button
    }

    const activeDropdownAction = openDropdownLabel
        ? actions.find((a) => a.label === openDropdownLabel)
        : null

    return (
        <div ref={containerRef}>
            <Menu
                aria-label="Chart actions"
                isOpen={isMenuOpen}
                onOpenChange={setIsMenuOpen}
                trigger={
                    <Button
                        variant="tertiary"
                        icon={<Icon name="dots-kebab-vertical" size="sm" />}
                        aria-label="Chart actions"
                    />
                }
            >
                {actions.map((action) => (
                    <MenuItem
                        key={action.label}
                        label={action.label}
                        leadingSlot={action.icon as IconName}
                        onAction={() => {
                            if (action.dropdownContent) {
                                setIsMenuOpen(false)
                                setOpenDropdownLabel(action.label)
                            } else {
                                action.onClick?.()
                            }
                        }}
                        isDisabled={action.isDisabled}
                    />
                ))}
            </Menu>
            {activeDropdownAction?.dropdownContent && (
                <Popover
                    padding={0}
                    triggerRef={containerRef}
                    isOpen={true}
                    onOpenChange={(open) => {
                        if (!open) closeDropdown()
                    }}
                    trigger={
                        <div
                            aria-hidden="true"
                            style={{ width: 0, height: 0 }}
                        />
                    }
                >
                    {activeDropdownAction.dropdownContent(closeDropdown)}
                </Popover>
            )}
        </div>
    )
}
