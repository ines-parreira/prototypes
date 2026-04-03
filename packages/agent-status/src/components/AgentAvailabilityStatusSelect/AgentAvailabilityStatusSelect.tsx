import { useMemo } from 'react'

import {
    LegacyBadge as Badge,
    Dot,
    ListItem,
    Select,
    SelectTrigger,
} from '@gorgias/axiom'

import { CALL_WRAP_UP_STATUS } from '../../constants'
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

    // only include call wrap-up status if the agent is on wrap-up,
    // this prevents changing into wrap-up status if the agent is not on wrap-up
    const statusesToDisplay = useMemo(
        () =>
            activeAvailabilityStatus?.id === CALL_WRAP_UP_STATUS.id
                ? [CALL_WRAP_UP_STATUS, ...allStatuses]
                : allStatuses,
        [activeAvailabilityStatus, allStatuses],
    )

    return (
        <div className={css.container}>
            <Select
                items={statusesToDisplay}
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
