import { useFlag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, render, userEvent } from '@repo/testing'
import { screen } from '@testing-library/react'

import { FilterComponentKey } from 'domains/reporting/models/stat/types'
import { BusiestTimesMetricSelectFilter } from 'domains/reporting/pages/common/filters/BusiestTimesMetricSelectFilter'
import { BusiestTimeOfDaysMetrics } from 'domains/reporting/pages/support-performance/busiest-times-of-days/types'
import { metricLabels } from 'domains/reporting/pages/support-performance/busiest-times-of-days/utils'
import {
    busiestTimesSlice,
    initialState,
    setSelectedMetric,
} from 'domains/reporting/state/ui/stats/busiestTimesSlice'
import { FILTER_DROPDOWN_ICON } from 'pages/common/forms/FilterInput/constants'
import type { RootState } from 'state/types'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { StatFilterSelected: 'stat-filter-selected' },
}))
jest.mock('@repo/feature-flags')
const useFlagMock = assumeMock(useFlag)

describe('BusiestTimesMetricSelectFilter', () => {
    const defaultState = {
        ui: {
            stats: { [busiestTimesSlice.name]: initialState },
        },
    } as RootState

    beforeEach(() => {
        useFlagMock.mockReturnValue(false)
    })

    it('should render available metrics', () => {
        render(<BusiestTimesMetricSelectFilter />, { storeState: defaultState })

        expect(
            screen.getByText(metricLabels[initialState.selectedMetric]),
        ).toBeInTheDocument()
    })

    it('should render Messages Received metric when the flag is on', () => {
        useFlagMock.mockReturnValue(true)

        render(<BusiestTimesMetricSelectFilter />, { storeState: defaultState })
        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))

        expect(
            screen.getByText(
                metricLabels[BusiestTimeOfDaysMetrics.MessagesReceived],
            ),
        ).toBeInTheDocument()
    })

    it('should update selectedMetric in state on selection', () => {
        const metric = BusiestTimeOfDaysMetrics.TicketsClosed
        const { store } = render(<BusiestTimesMetricSelectFilter />, {
            storeState: defaultState,
        })

        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))
        userEvent.click(screen.getByText(metricLabels[metric]))

        expect(store.getActions()).toContainEqual(setSelectedMetric(metric))
    })

    it('should call segment analytics log event on filter dropdown close', () => {
        render(<BusiestTimesMetricSelectFilter />, { storeState: defaultState })

        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))
        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))

        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.StatFilterSelected, {
            name: FilterComponentKey.BusiestTimesMetricSelectFilter,
            logical_operator: null,
        })
    })
})
