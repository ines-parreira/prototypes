import React, { useCallback, useMemo } from 'react'

import _noop from 'lodash/noop'
import { connect } from 'react-redux'

import { ListItem, Select, SelectTrigger } from '@gorgias/axiom'

import type {
    AggregationWindow,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import Filter from 'domains/reporting/pages/common/components/Filter'
import css from 'domains/reporting/pages/common/filters/AggregationWindowFilter.less'
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
    compact?: boolean
}

export const AggregationWindowFilter = ({
    value,
    period,
    dispatchUpdate,
    compact = false,
}: Props) => {
    const allowedAggregationWindows = useMemo(
        () =>
            getAllowedAggregationWindows(period).map((granularity) => {
                const value = `${granularity}`
                return {
                    id: value,
                    value,
                    label: ReportingGranularityLabels[granularity],
                }
            }),
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

    const handleCompactSelectionChange = useCallback(
        (option: { value: string; label: string }) => {
            dispatchUpdate(option.value as AggregationWindow)
            logSegmentEvent(FilterKey.AggregationWindow, null)
        },
        [dispatchUpdate],
    )

    const handleDropdownClosed = () => {
        logSegmentEvent(FilterKey.AggregationWindow, null)
    }

    const selectedItem = useMemo(
        () =>
            allowedAggregationWindows.find(
                (option) => option.value === value,
            ) || null,
        [allowedAggregationWindows, value],
    )

    const selectedLabel = selectedItem?.label || ''

    if (compact) {
        return (
            <Select
                onSelect={handleCompactSelectionChange}
                aria-label="Aggregation window"
                items={allowedAggregationWindows}
                selectedItem={selectedItem}
                trigger={({ ref }) => (
                    <SelectTrigger ref={ref}>
                        <div className={css.compactTrigger}>
                            <span className={css.compactLabel}>
                                Aggregation
                            </span>
                            <span className={css.compactValue}>
                                {selectedLabel}
                            </span>
                        </div>
                    </SelectTrigger>
                )}
            >
                {(option) => (
                    <ListItem textValue={option.label} label={option.label} />
                )}
            </Select>
        )
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
