import React, { Dispatch, SetStateAction } from 'react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'

import { FilterKey, InteractionFilterType, Range } from '../types'
import { ActiveFilters } from './hooks/useTimelineFilters'
import { InteractionType } from './InteractionType'
import { RangeFilter } from './RangeFilter'
import { StatusFilter } from './StatusFilter'

import css from './Filters.less'

type FilterProps = {
    setActiveFilters: Dispatch<SetStateAction<ActiveFilters>>
    setRangeFilter: (val: Range) => void
    selectedTypeKeys: InteractionFilterType[]
    selectedStatusKeys: FilterKey[]
    isTypeFilterDisabled: boolean
    rangeFilter: Range
}

const Filters = ({
    setActiveFilters,
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
                        setActiveFilters((prev) => ({
                            ...prev,
                            type: {
                                ...prev.type,
                                [value]: !prev.type[value],
                            },
                            status: {
                                open: true,
                                closed: true,
                                snooze: true,
                            },
                        }))
                    }}
                />
            )}

            <StatusFilter
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
