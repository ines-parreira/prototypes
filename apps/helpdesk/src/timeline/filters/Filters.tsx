import React, { Dispatch, SetStateAction } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'

import { FilterKey, InteractionFilterType, Range } from '../types'
import { ActiveFilters } from './hooks/useTimelineFilters'
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
    const enableOrdersInTimeline = useFlag(
        FeatureFlagKey.ShopifyCustomerTimeline,
        false,
    )

    return (
        <div className={css.filtersBar}>
            <RangeFilter range={rangeFilter} setRangeFilter={setRangeFilter} />

            {enableOrdersInTimeline && (
                <InteractionType
                    selectedType={selectedTypeKeys}
                    toggleSelectedType={(value) => {
                        setMemoizedFilters((prev) => ({
                            ...prev,
                            [value]: !prev[value],
                        }))
                    }}
                />
            )}

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
