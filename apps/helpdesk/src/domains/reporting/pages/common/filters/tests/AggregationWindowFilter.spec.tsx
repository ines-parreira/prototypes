import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { userEvent } from '@repo/testing'
import { screen } from '@testing-library/react'

import { FilterKey } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import {
    AggregationWindowFilter,
    AggregationWindowFilterWithState,
} from 'domains/reporting/pages/common/filters/AggregationWindowFilter'
import { ReportingGranularityLabels } from 'domains/reporting/pages/common/filters/constants'
import * as statsSlice from 'domains/reporting/state/stats/statsSlice'
import * as filtersSlice from 'domains/reporting/state/ui/stats/filtersSlice'
import {
    FILTER_DROPDOWN_ICON,
    FILTER_VALUE_PLACEHOLDER,
} from 'pages/common/forms/FilterInput/constants'
import { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { StatFilterSelected: 'stat-filter-selected' },
}))

describe('AggregationWindowFilter', () => {
    const defaultState = {
        stats: statsSlice.initialState,
        ui: {
            stats: {
                filters: filtersSlice.initialState,
            },
        },
    } as RootState
    const period = {
        start_datetime: '1970-01-01T00:00:00+00:00',
        end_datetime: '1970-02-01T00:00:00+00:00',
    }
    const dispatchUpdate = jest.fn()

    it('should render available aggregations', () => {
        renderWithStore(
            <AggregationWindowFilter
                period={period}
                dispatchUpdate={dispatchUpdate}
            />,
            defaultState,
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
                }),
            ).toBeInTheDocument()
        })
    })

    it('should update selectedMetric in state on selection', () => {
        const aggregation = ReportingGranularity.Week

        renderWithStore(
            <AggregationWindowFilter
                period={period}
                dispatchUpdate={dispatchUpdate}
            />,
            defaultState,
        )

        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))
        userEvent.click(
            screen.getByText(ReportingGranularityLabels[aggregation]),
        )

        expect(dispatchUpdate).toHaveBeenCalledWith(aggregation)
    })

    it('should call segment analytics log event on filter dropdown close', () => {
        renderWithStore(
            <AggregationWindowFilter
                period={statsSlice.defaultStatsFilters.period}
                dispatchUpdate={dispatchUpdate}
            />,
            defaultState,
        )

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.StatFilterSelected, {
            name: FilterKey.AggregationWindow,
            logical_operator: null,
        })
    })

    describe('AggregationWindowFilterWithState', () => {
        it('should call dispatchUpdate', () => {
            const aggregation = ReportingGranularity.Hour
            const spy = jest.spyOn(
                statsSlice,
                'mergeStatsFiltersWithLogicalOperator',
            )
            renderWithStore(<AggregationWindowFilterWithState />, defaultState)

            userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))
            userEvent.click(
                screen.getByRole('option', {
                    name: new RegExp(ReportingGranularityLabels[aggregation]),
                }),
            )

            expect(spy).toHaveBeenCalled()
        })
    })
})
