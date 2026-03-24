import { useCallback } from 'react'

import { Icon, ListItem, Select, StatusButton, Text } from '@gorgias/axiom'

import { TicketStatus } from '../../../../../../types/ticket'

import css from '../../../../../../components/TicketAssignee/components/SelectStyles.less'

type StatusOption = {
    id: TicketStatus
    label: string
}

const STATUS_OPTIONS: StatusOption[] = [
    {
        id: TicketStatus.Open,
        label: 'Open',
    },
    {
        id: TicketStatus.Closed,
        label: 'Close',
    },
]

type BulkStatusSelectProps = {
    onChange: (status: TicketStatus) => void | Promise<void>
    isDisabled?: boolean
}

export function BulkStatusSelect({
    onChange,
    isDisabled = false,
}: BulkStatusSelectProps) {
    const handleChange = useCallback(
        (option: StatusOption) => {
            onChange(option.id)
        },
        [onChange],
    )

    return (
        <Select
            placeholder="Set status"
            items={STATUS_OPTIONS}
            onSelect={handleChange}
            isDisabled={isDisabled}
            aria-label="Status selection"
            size="sm"
            trigger={({ selectedText, isPlaceholder, isOpen, ref }) => (
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
                    className={css.trigger}
                >
                    <Text as="span" size="sm" variant="bold">
                        {isPlaceholder ? 'Set status' : selectedText}
                    </Text>
                </StatusButton>
            )}
        >
            {(option) => (
                <ListItem
                    key={option.id}
                    textValue={option.label}
                    label={option.label}
                />
            )}
        </Select>
    )
}
