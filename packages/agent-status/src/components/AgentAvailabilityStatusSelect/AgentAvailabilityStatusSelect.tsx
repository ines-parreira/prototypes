import { useMemo } from 'react'

import {
    LegacyBadge as Badge,
    Dot,
    ListItem,
    Select,
    SelectTrigger,
} from '@gorgias/axiom'

import { useSelectableAgentAvailabilityStatuses } from '../../hooks'
import type { AgentAvailabilityStatusSelectProps } from './types'

import css from './AgentAvailabilityStatusSelect.less'

export function AgentAvailabilityStatusSelect({
    activeAvailabilityStatus,
    onSelect,
    placeholder = 'Select status',
    isDisabled,
}: AgentAvailabilityStatusSelectProps) {
    const { allStatuses } = useSelectableAgentAvailabilityStatuses()

    const isAvailable = useMemo(
        () => activeAvailabilityStatus?.id === 'available',
        [activeAvailabilityStatus?.id],
    )

    return (
        <div className={css.container}>
            <Select
                items={allStatuses}
                selectedItem={activeAvailabilityStatus}
                onSelect={onSelect}
                trigger={({ ref, selectedText, isPlaceholder }) => {
                    const text = isPlaceholder ? placeholder : selectedText
                    return (
                        <SelectTrigger ref={ref}>
                            <Badge
                                type={isAvailable ? 'success' : 'warning'}
                                className={css.badge}
                            >
                                <span className={css.badgeText}>{text}</span>
                                {!isDisabled && <span>▾</span>}
                            </Badge>
                        </SelectTrigger>
                    )
                }}
                placeholder={placeholder}
                isDisabled={isDisabled}
                keyName="id"
            >
                {({ id, name }) => {
                    return (
                        <ListItem
                            id={id}
                            label={name}
                            textValue={name}
                            leadingSlot={
                                <Dot
                                    color={id === 'available' ? 'green' : 'red'}
                                />
                            }
                        />
                    )
                }}
            </Select>
        </div>
    )
}
