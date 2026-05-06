import type { ReactNode } from 'react'

import cn from 'classnames'

import {
    ButtonGroup,
    ButtonGroupItem,
    Icon,
    Menu,
    MenuItem,
    MenuSection,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import { useTicketThreadWidth } from '../../../contexts/TicketThreadWidth'

import css from '../MessageBubble.less'

/** Approximate width (px) of a single ButtonGroupItem with an icon */
const ITEM_WIDTH_PX = 36
/** MessageBubble occupies 80% of its row; 20% remains as available side space */
const BUBBLE_WIDTH_RATIO = 0.8

export type BubbleActionItem = {
    id: string
    /**
     * Custom component rendered as the ButtonGroupItem icon.
     * When omitted, an Icon is derived from compactLeadingSlot automatically.
     * Use this for self-contained components (e.g. CopyButton, IntentsFeedback).
     */
    icon?: ReactNode
    /** Tooltip text shown in expanded mode (omit for self-contained components) */
    tooltip?: string
    isDisabled?: boolean
    /** Text shown in the compact Menu dropdown */
    compactLabel: string
    /** Icon shown in the compact Menu item */
    compactLeadingSlot?: IconName
    /** Called when the item is selected, in both expanded and compact modes */
    onAction: () => void
    /**
     * Optional element rendered hidden in compact mode.
     * Use this for components (e.g. IntentsFeedback) that need to stay mounted
     * so they can position their own overlay relative to their DOM node.
     */
    compactAnchor?: ReactNode
}

type BubbleActionsProps = {
    placement: 'left' | 'right'
    items: BubbleActionItem[]
    /** Controlled selected key for ButtonGroup (expanded mode only) */
    selectedKey?: string
    /** Selection change handler for ButtonGroup (expanded mode only) */
    onSelectionChange?: (key: string) => void
}

export function BubbleActions({
    placement,
    items,
    selectedKey,
    onSelectionChange,
}: BubbleActionsProps) {
    const { containerWidth } = useTicketThreadWidth()

    const availableSideWidth = containerWidth * (1 - BUBBLE_WIDTH_RATIO)
    const isCompact = availableSideWidth < items.length * ITEM_WIDTH_PX

    return (
        <div
            className={cn(
                css.bubbleActions,
                placement === 'left'
                    ? css.bubbleActionsLeft
                    : css.bubbleActionsRight,
            )}
            data-bubble-actions
            data-placement={placement}
        >
            {isCompact ? (
                <>
                    {/* Hidden anchors kept in DOM so self-positioning overlays (e.g.
                        IntentsFeedback panel) can read their bounding rect */}
                    {items
                        .filter((item) => item.compactAnchor)
                        .map((item) => (
                            <div
                                key={item.id}
                                className={css.compactAnchor}
                                aria-hidden="true"
                            >
                                {item.compactAnchor}
                            </div>
                        ))}
                    <ButtonGroup>
                        <Menu
                            aria-label="Message actions"
                            placement={
                                placement === 'right'
                                    ? 'bottom right'
                                    : 'bottom left'
                            }
                            trigger={
                                <ButtonGroupItem
                                    id="more-actions"
                                    icon={
                                        <Icon
                                            name={
                                                'dots-meatballs-horizontal' as IconName
                                            }
                                            size="sm"
                                            alt="More actions"
                                        />
                                    }
                                />
                            }
                        >
                            <MenuSection id="bubble-actions">
                                {items.map((item) => (
                                    <MenuItem
                                        key={item.id}
                                        id={item.id}
                                        label={item.compactLabel}
                                        leadingSlot={item.compactLeadingSlot}
                                        isDisabled={item.isDisabled}
                                        onAction={item.onAction}
                                    />
                                ))}
                            </MenuSection>
                        </Menu>
                    </ButtonGroup>
                </>
            ) : (
                <ButtonGroup
                    selectedKey={selectedKey}
                    onSelectionChange={(key) => {
                        items.find((i) => i.id === key)?.onAction()
                        onSelectionChange?.(key as string)
                    }}
                >
                    {items.map((item) => {
                        const icon = item.icon ?? (
                            <Icon
                                name={item.compactLeadingSlot!}
                                size="sm"
                                alt={item.tooltip ?? item.compactLabel}
                            />
                        )
                        return item.tooltip ? (
                            <Tooltip
                                key={item.id}
                                trigger={
                                    <ButtonGroupItem
                                        id={item.id}
                                        icon={icon}
                                        isDisabled={item.isDisabled}
                                    />
                                }
                            >
                                <TooltipContent title={item.tooltip} />
                            </Tooltip>
                        ) : (
                            <ButtonGroupItem
                                key={item.id}
                                id={item.id}
                                icon={icon}
                                isDisabled={item.isDisabled}
                            />
                        )
                    })}
                </ButtonGroup>
            )}
        </div>
    )
}
