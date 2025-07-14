import { useCallback, useMemo } from 'react'

import _noop from 'lodash/noop'
import { connect } from 'react-redux'

import {
    FilterKey,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'
import Filter from 'domains/reporting/pages/common/components/Filter'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import {
    emptyFilter,
    logSegmentEvent,
} from 'domains/reporting/pages/common/filters/helpers'
import {
    OptionalFilterProps,
    RemovableFilter,
} from 'domains/reporting/pages/common/filters/types'
import { DropdownOption } from 'domains/reporting/pages/types'
import {
    getPageStatsFiltersWithLogicalOperators,
    getSavedFiltersWithLogicalOperators,
} from 'domains/reporting/state/stats/selectors'
import { mergeStatsFiltersWithLogicalOperator } from 'domains/reporting/state/stats/statsSlice'
import {
    statFiltersClean,
    statFiltersDirty,
} from 'domains/reporting/state/ui/stats/actions'
import {
    removeFilterFromSavedFilterDraft,
    upsertSavedFilterFilter,
} from 'domains/reporting/state/ui/stats/filtersSlice'
import { RootState } from 'state/types'

type Props = {
    value?: StatsFiltersWithLogicalOperator[FilterKey.IsDuringBusinessHours]
    dispatchUpdate: (
        value: Exclude<
            StatsFiltersWithLogicalOperator[FilterKey.IsDuringBusinessHours],
            undefined
        >,
    ) => void
    dispatchRemove: () => void
    dispatchStatFiltersDirty?: () => void
    dispatchStatFiltersClean?: () => void
} & RemovableFilter &
    OptionalFilterProps

export const ANYTIME_OPTION_VALUE = 'anytime'
export const ANYTIME_OPTION_LABEL = 'Anytime'
export const WITHIN_BUSINESS_HOURS_OPTION_LABEL = 'Within business hours'
export const OUTSIDE_BUSINESS_HOURS_OPTION_LABEL = 'Outside business hours'

export const DuringBusinessHoursFilter = ({
    value,
    initializeAsOpen = false,
    onRemove,
    dispatchUpdate,
    dispatchRemove,
    dispatchStatFiltersDirty = _noop,
    dispatchStatFiltersClean = _noop,
    warningType,
    isDisabled,
}: Props) => {
    const filterOptions = [
        {
            options: BUSINESS_HOURS_OPTIONS,
        },
    ]

    const selectedOptions: DropdownOption[] = useMemo(
        () =>
            value === undefined || value?.values.length === 0
                ? [BUSINESS_HOURS_OPTIONS[0]]
                : BUSINESS_HOURS_OPTIONS.filter(
                      (option) => option.value === value?.values[0],
                  ),
        [value],
    )

    const handleFilterValuesChange = useCallback(
        (option: DropdownOption) => {
            dispatchUpdate({
                values:
                    option.value !== ANYTIME_OPTION_VALUE ? [option.value] : [],
                operator: LogicalOperatorEnum.ONE_OF,
            })
        },
        [dispatchUpdate],
    )

    const handleDropdownClosed = () => {
        logSegmentEvent(FilterKey.IsDuringBusinessHours, null)
        dispatchStatFiltersClean()
    }

    const handleDropdownOpen = () => {
        dispatchStatFiltersDirty()
    }

    return (
        <Filter
            filterName={FilterLabels[FilterKey.IsDuringBusinessHours]}
            filterErrors={{ warningType }}
            filterOptionGroups={filterOptions}
            selectedOptions={selectedOptions}
            onChangeOption={handleFilterValuesChange}
            logicalOperators={[]}
            onChangeLogicalOperator={_noop}
            onSelectAll={_noop}
            onRemoveAll={_noop}
            onDropdownClosed={handleDropdownClosed}
            onDropdownOpen={handleDropdownOpen}
            onRemove={() => {
                dispatchRemove()
                onRemove?.()
            }}
            isMultiple={false}
            showSearch={false}
            showQuickSelect={false}
            isDisabled={isDisabled}
            initializeAsOpen={initializeAsOpen}
        />
    )
}

export const DuringBusinessHoursFilterWithState = connect(
    (state: RootState) => ({
        value: getPageStatsFiltersWithLogicalOperators(state)[
            FilterKey.IsDuringBusinessHours
        ],
    }),
    {
        dispatchUpdate: (filter: Props['value']) =>
            mergeStatsFiltersWithLogicalOperator({
                [FilterKey.IsDuringBusinessHours]: filter,
            }),
        dispatchRemove: () =>
            mergeStatsFiltersWithLogicalOperator({
                [FilterKey.IsDuringBusinessHours]: emptyFilter,
            }),
        dispatchStatFiltersDirty: statFiltersDirty,
        dispatchStatFiltersClean: statFiltersClean,
    },
)(DuringBusinessHoursFilter)

export const DuringBusinessHoursFilterWithSavedState = connect(
    (state: RootState) => ({
        value: getSavedFiltersWithLogicalOperators(state)[
            FilterKey.IsDuringBusinessHours
        ],
    }),
    {
        dispatchUpdate: (filter: Exclude<Props['value'], undefined>) =>
            upsertSavedFilterFilter({
                member: FilterKey.IsDuringBusinessHours,
                operator: filter.operator,
                values: filter.values,
            }),
        dispatchRemove: () =>
            removeFilterFromSavedFilterDraft({
                filterKey: FilterKey.IsDuringBusinessHours,
            }),
    },
)(DuringBusinessHoursFilter)

const BUSINESS_HOURS_OPTIONS = [
    {
        value: ANYTIME_OPTION_VALUE,
        label: ANYTIME_OPTION_LABEL,
    },
    {
        value: '1',
        label: WITHIN_BUSINESS_HOURS_OPTION_LABEL,
    },
    {
        value: '0',
        label: OUTSIDE_BUSINESS_HOURS_OPTION_LABEL,
    },
]
