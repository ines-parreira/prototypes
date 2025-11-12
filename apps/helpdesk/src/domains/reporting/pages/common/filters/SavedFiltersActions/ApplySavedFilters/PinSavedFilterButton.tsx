import { ComponentProps } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import {
    LegacyIconButton as IconButton,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import { SavedFilter } from 'domains/reporting/models/stat/types'

export interface PinSavedFilterButtonProps
    extends Omit<
        ComponentProps<typeof IconButton>,
        'icon' | 'iconClassName' | 'onClick'
    > {
    filter: Pick<SavedFilter, 'id' | 'name'>
    onClick: () => any
    isPinned?: boolean
    setDisableOuter: (disable: boolean) => void
}

export const REMOVE_AS_DEFAULT_FILTER_TOOLTIP = 'Remove as default filter'
export const SET_AS_DEFAULT_FILTER_TOOLTIP = 'Set as default filter'

export const PinSavedFilterButton = ({
    filter,
    isPinned,
    onClick,
    setDisableOuter,
    ...props
}: PinSavedFilterButtonProps) => {
    const handleClick = () => {
        onClick()
        logEvent(SegmentEvent.StatSavedFilterPinned, {
            name: filter.name,
            id: filter.id,
            isPinned: Boolean(isPinned),
        })
    }

    const iconId = `save-filter-pin-${filter.id}`

    return (
        <>
            <Tooltip target={iconId} placement="top">
                {isPinned
                    ? REMOVE_AS_DEFAULT_FILTER_TOOLTIP
                    : SET_AS_DEFAULT_FILTER_TOOLTIP}
            </Tooltip>
            <IconButton
                id={iconId}
                fillStyle="ghost"
                intent="secondary"
                size="small"
                {...props}
                onMouseEnter={() => setDisableOuter(true)}
                onMouseLeave={() => setDisableOuter(false)}
                icon="push_pin"
                onClick={handleClick}
                aria-pressed={Boolean(isPinned)}
                data-state={isPinned ? 'on' : 'off'}
                iconClassName={
                    isPinned
                        ? 'material-icons-solid'
                        : 'material-icons-outlined'
                }
            />
        </>
    )
}
