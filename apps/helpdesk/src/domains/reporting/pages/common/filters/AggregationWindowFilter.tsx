import React, { useCallback, useMemo } from 'react'

import _noop from 'lodash/noop'
import { connect } from 'react-redux'

import type {
    AggregationWindow,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import Filter from 'domains/reporting/pages/common/components/Filter'
import {
    FilterLabels,
    ReportingGranularityLabels,
} from 'domains/reporting/pages/common/filters/constants'
import { logSegmentEvent } from 'domains/reporting/pages/common/filters/helpers'
import type { DropdownOption } from 'domains/reporting/pages/types'
import { getStatsFiltersWithLogicalOperators } from 'domains/reporting/state/stats/selectors'
import { mergeStatsFiltersWithLogicalOperator } from 'domains/reporting/state/stats/statsSlice'
import { getAllowedAggregationWindows } from 'domains/reporting/state/stats/utils'
import { getCleanStatsFiltersWithLogicalOperatorsWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import type { RootState } from 'state/types'

type Props = {
    value?: StatsFiltersWithLogicalOperator[FilterKey.AggregationWindow]
    period: StatsFiltersWithLogicalOperator[FilterKey.Period]
    dispatchUpdate: (
        value: StatsFiltersWithLogicalOperator[FilterKey.AggregationWindow],
    ) => void
}

export const AggregationWindowFilter = ({
    value,
    period,
    dispatchUpdate,
}: Props) => {
    const allowedAggregationWindows = useMemo(
        () =>
            getAllowedAggregationWindows(period).map((granularity) => ({
                value: `${granularity}`,
                label: ReportingGranularityLabels[granularity],
            })),
        [period],
    )

    const filterOptions = [
        {
            options: allowedAggregationWindows,
        },
    ]

    const selectedOptions: DropdownOption[] = useMemo(
        () =>
            allowedAggregationWindows.filter(
                (option) => option.value === value,
            ),
        [allowedAggregationWindows, value],
    )

    const handleFilterValuesChange = useCallback(
        (value: DropdownOption | undefined) => {
            dispatchUpdate(value?.value as AggregationWindow)
        },
        [dispatchUpdate],
    )

    const handleDropdownClosed = () => {
        logSegmentEvent(FilterKey.AggregationWindow, null)
    }

    return (
        <Filter
            filterName={FilterLabels[FilterKey.AggregationWindow]}
            filterOptionGroups={filterOptions}
            selectedOptions={selectedOptions}
            onChangeOption={handleFilterValuesChange}
            logicalOperators={[]}
            onChangeLogicalOperator={_noop}
            onSelectAll={_noop}
            onRemoveAll={_noop}
            onDropdownClosed={handleDropdownClosed}
            isMultiple={false}
            showSearch={false}
            showQuickSelect={false}
            isPersistent
        />
    )
}

export const AggregationWindowFilterWithState = connect(
    (state: RootState) => ({
        value: getCleanStatsFiltersWithLogicalOperatorsWithTimezone(state)
            .granularity,
        period: getStatsFiltersWithLogicalOperators(state)[FilterKey.Period],
    }),
    {
        dispatchUpdate: (
            filter: StatsFiltersWithLogicalOperator[FilterKey.AggregationWindow],
        ) =>
            mergeStatsFiltersWithLogicalOperator({
                aggregationWindow: filter,
            }),
    },
)(AggregationWindowFilter)
