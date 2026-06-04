import { useRef, useState } from 'react'
import type { ReactNode } from 'react'

import {
    Button,
    Icon,
    Menu,
    MenuItem,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import css from './AnalyticsActionMenu.less'

export type AnalyticsActionItem = {
    icon: string
    label: string
    tooltip?: string
    onClick?: () => void
    isDisabled?: boolean
    dropdownContent?: (
        close: () => void,
        goBack: () => void,
        defaultOpen: boolean,
    ) => ReactNode
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
    const goBack = () => {
        setOpenDropdownLabel(null)
        setIsMenuOpen(true)
    }

    if (actions.length === 1) {
        const [action] = actions

        if (action.dropdownContent) {
            const element = (
                <div className={css.singleActionDropdown}>
                    <Button
                        variant="tertiary"
                        icon={action.icon as IconName}
                        aria-label={action.label}
                        isDisabled={action.isDisabled}
                        aria-hidden="true"
                        tabIndex={-1}
                    />
                    {action.dropdownContent(closeDropdown, goBack, false)}
                </div>
            )

            if (action.tooltip) {
                return (
                    <Tooltip trigger={element}>
                        <TooltipContent title={action.tooltip} />
                    </Tooltip>
                )
            }

            return element
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
                        trailingSlot={
                            action.dropdownContent ? (
                                <Icon name="arrow-chevron-right" size="sm" />
                            ) : undefined
                        }
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
                <div className={css.multiActionPicker}>
                    {activeDropdownAction.dropdownContent(
                        closeDropdown,
                        goBack,
                        true,
                    )}
                </div>
            )}
        </div>
    )
}
