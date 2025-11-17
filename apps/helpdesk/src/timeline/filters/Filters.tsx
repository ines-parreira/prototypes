import type { Dispatch, SetStateAction } from 'react'

import type { FilterKey, InteractionFilterType, Range } from '../types'
import type { ActiveFilters } from './hooks/useTimelineFilters'
import { InteractionType } from './InteractionType'
import { RangeFilter } from './RangeFilter'
import { TicketStatusFilter } from './TicketStatusFilter'

import css from './Filters.less'

type FilterProps = {
    setMemoizedFilters: Dispatch<
        SetStateAction<Record<InteractionFilterType, boolean>>
    >
    setActiveFilters: Dispatch<SetStateAction<ActiveFilters>>
    setRangeFilter: (val: Range) => void
    selectedTypeKeys: InteractionFilterType[]
    selectedStatusKeys: FilterKey[]
    isTypeFilterDisabled: boolean
    rangeFilter: Range
}

const Filters = ({
    setActiveFilters,
    setMemoizedFilters,
    setRangeFilter,
    selectedTypeKeys,
    selectedStatusKeys,
    isTypeFilterDisabled,
    rangeFilter,
}: FilterProps) => {
    return (
        <div className={css.filtersBar}>
            <RangeFilter range={rangeFilter} setRangeFilter={setRangeFilter} />
            <InteractionType
                selectedType={selectedTypeKeys}
                toggleSelectedType={(value) => {
                    setMemoizedFilters((prev) => ({
                        ...prev,
                        [value]: !prev[value],
                    }))
                }}
            />

            <TicketStatusFilter
                selectedStatus={selectedStatusKeys}
                toggleSelectedStatus={(value) => {
                    setActiveFilters((prev) => ({
                        ...prev,
                        status: {
                            ...prev.status,
                            [value]: !prev.status[value],
                        },
                    }))
                }}
                isDisabled={isTypeFilterDisabled}
            />
        </div>
    )
}

export default Filters
