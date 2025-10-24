import { useCallback } from 'react'

import {
    Color,
    Icon,
    IconName,
    ListItem,
    LoadingSpinner,
    NewTag,
    Select,
} from '@gorgias/axiom'
import { TicketPriority as TicketPriorityType } from '@gorgias/helpdesk-queries'

import { PriorityOption, usePriorityOptions } from '../hooks/usePriorityOptions'
import { useUpdateTicketPriority } from '../hooks/useUpdateTicketPriority'

type Props = {
    ticketId: number
    currentPriority?: TicketPriorityType
}

const PRIORITY_ICON_MAP: Record<
    TicketPriorityType,
    { icon: IconName; color?: Color }
> = {
    low: { icon: IconName.ArrowChevronDown, color: Color.Grey },
    normal: { icon: IconName.Equals, color: Color.Grey },
    high: { icon: IconName.ArrowChevronUp, color: Color.Orange },
    critical: { icon: IconName.ArrowChevronUpDuo, color: Color.Red },
}

export function TicketPriority({ ticketId, currentPriority }: Props) {
    const { updateTicketPriority, isLoading: isUpdatingPriority } =
        useUpdateTicketPriority(ticketId)

    const { priorityOptions, selectedOption } = usePriorityOptions({
        currentPriority,
    })

    const handleChange = useCallback(
        async (option: PriorityOption) => {
            await updateTicketPriority(option.id)
        },
        [updateTicketPriority],
    )

    return (
        <Select
            placeholder="Normal"
            items={priorityOptions}
            selectedItem={selectedOption}
            onSelect={handleChange}
            isDisabled={isUpdatingPriority}
            aria-label="Priority selection"
            trigger={({ selectedText, isPlaceholder, isOpen }) => {
                const priority = selectedOption?.id || 'normal'
                const { icon, color } = PRIORITY_ICON_MAP[priority]

                return (
                    <NewTag
                        leadingSlot={
                            isUpdatingPriority ? (
                                <LoadingSpinner size={16} />
                            ) : (
                                <Icon name={icon} size="sm" color={color} />
                            )
                        }
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
                        {isPlaceholder ? 'Normal' : selectedText}
                    </NewTag>
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
