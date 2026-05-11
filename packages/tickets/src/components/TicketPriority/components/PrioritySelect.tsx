import { useCallback } from 'react'

import {
    Color,
    Icon,
    ListItem,
    LegacyLoadingSpinner as LoadingSpinner,
    Select,
    StatusButton,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'
import type { TicketPriority as TicketPriorityType } from '@gorgias/helpdesk-queries'

import type { PriorityOption } from '../hooks/usePriorityOptions'
import { usePriorityOptions } from '../hooks/usePriorityOptions'

export type PrioritySelectProps = {
    value?: TicketPriorityType
    onChange: (priority: TicketPriorityType) => void | Promise<void>
    isLoading?: boolean
    isDisabled?: boolean
}

export const PRIORITY_ICON_MAP: Record<
    TicketPriorityType,
    { icon: IconName; color?: Color }
> = {
    low: { icon: 'arrow-chevron-down', color: Color.Grey },
    normal: { icon: 'equals', color: Color.Grey },
    high: { icon: 'arrow-chevron-up', color: Color.Orange },
    critical: { icon: 'arrow-chevron-up-duo', color: Color.Red },
}

export function PrioritySelect({
    value,
    onChange,
    isLoading = false,
    isDisabled = false,
}: PrioritySelectProps) {
    const { priorityOptions, selectedOption } = usePriorityOptions({
        currentPriority: value,
    })

    const handleChange = useCallback(
        (option: PriorityOption) => {
            onChange(option.id)
        },
        [onChange],
    )

    return (
        <Select
            placeholder="Normal"
            items={priorityOptions}
            selectedItem={selectedOption}
            onSelect={handleChange}
            isDisabled={isDisabled || isLoading}
            aria-label="Priority selection"
            size="sm"
            trigger={({ isOpen, ref }) => {
                const priority = selectedOption?.id || 'normal'
                const { icon, color } = PRIORITY_ICON_MAP[priority]

                return (
                    <Tooltip
                        placement="bottom"
                        trigger={
                            <StatusButton
                                ref={ref}
                                trailingSlot={
                                    <Icon
                                        name={
                                            isOpen
                                                ? 'arrow-chevron-up'
                                                : 'arrow-chevron-down'
                                        }
                                        size="xs"
                                    />
                                }
                            >
                                {isLoading ? (
                                    <LoadingSpinner size={16} />
                                ) : (
                                    <Icon name={icon} size="sm" color={color} />
                                )}
                            </StatusButton>
                        }
                    >
                        <TooltipContent title="Change priority" />
                    </Tooltip>
                )
            }}
        >
            {(option) => {
                const { icon, color } = PRIORITY_ICON_MAP[option.id]

                return (
                    <ListItem
                        key={option.id}
                        textValue={option.label}
                        label={option.label}
                        leadingSlot={
                            <Icon name={icon} size="sm" color={color} />
                        }
                    />
                )
            }}
        </Select>
    )
}
