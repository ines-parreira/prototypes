import {screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {ReportingGranularity} from 'models/reporting/types'
import {FilterKey} from 'models/stat/types'
import {
    FILTER_DROPDOWN_ICON,
    FILTER_VALUE_PLACEHOLDER,
} from 'pages/stats/common/components/Filter/constants'
import {AggregationWindowFilter} from 'pages/stats/common/filters/AggregationWindowFilter'
import {ReportingGranularityLabels} from 'pages/stats/common/filters/constants'
import {
    defaultStatsFilters,
    mergeStatsFiltersWithLogicalOperator,
} from 'state/stats/statsSlice'

import {renderWithStore} from 'utils/testing'

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {StatFilterSelected: 'stat-filter-selected'},
}))

describe('AggregationWindowFilter', () => {
    const defaultState = {}
    const period = {
        start_datetime: '1970-01-01T00:00:00+00:00',
        end_datetime: '1970-02-01T00:00:00+00:00',
    }

    it('should render available aggregations', () => {
        renderWithStore(
            <AggregationWindowFilter period={period} />,
            defaultState
        )

        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))

        const allowedAggregationWindows = [
            ReportingGranularity.Day,
            ReportingGranularity.Week,
            ReportingGranularity.Month,
        ]
        allowedAggregationWindows.forEach((granularity) => {
            expect(
                screen.getByRole('option', {
                    name: new RegExp(ReportingGranularityLabels[granularity]),
                })
            ).toBeInTheDocument()
        })
    })

    it('should update selectedMetric in state on selection', () => {
        const aggregation = ReportingGranularity.Week

        const {store} = renderWithStore(
            <AggregationWindowFilter period={period} />,
            defaultState
        )

        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))
        userEvent.click(
            screen.getByText(ReportingGranularityLabels[aggregation])
        )

        expect(store.getActions()).toContainEqual(
            mergeStatsFiltersWithLogicalOperator({
                [FilterKey.AggregationWindow]: aggregation,
            })
        )
    })

    it('should call segment analytics log event on filter dropdown close', () => {
        renderWithStore(
            <AggregationWindowFilter period={defaultStatsFilters.period} />,
            defaultState
        )

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.StatFilterSelected, {
            name: FilterKey.AggregationWindow,
            logical_operator: null,
        })
    })
})
