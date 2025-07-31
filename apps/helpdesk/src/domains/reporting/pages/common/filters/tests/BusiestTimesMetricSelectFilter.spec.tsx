import React from 'react'

import { userEvent } from '@repo/testing'
import { screen } from '@testing-library/react'

import { logEvent, SegmentEvent } from 'common/segment'
import { useFlag } from 'core/flags'
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
import { RootState } from 'state/types'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { StatFilterSelected: 'stat-filter-selected' },
}))
jest.mock('core/flags')
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
        renderWithStore(<BusiestTimesMetricSelectFilter />, defaultState)

        expect(
            screen.getByText(metricLabels[initialState.selectedMetric]),
        ).toBeInTheDocument()
    })

    it('should render Messages Received metric when the flag is on', () => {
        useFlagMock.mockReturnValue(true)

        renderWithStore(<BusiestTimesMetricSelectFilter />, defaultState)
        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))

        expect(
            screen.getByText(
                metricLabels[BusiestTimeOfDaysMetrics.MessagesReceived],
            ),
        ).toBeInTheDocument()
    })

    it('should update selectedMetric in state on selection', () => {
        const metric = BusiestTimeOfDaysMetrics.TicketsClosed
        const { store } = renderWithStore(
            <BusiestTimesMetricSelectFilter />,
            defaultState,
        )

        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))
        userEvent.click(screen.getByText(metricLabels[metric]))

        expect(store.getActions()).toContainEqual(setSelectedMetric(metric))
    })

    it('should call segment analytics log event on filter dropdown close', () => {
        renderWithStore(<BusiestTimesMetricSelectFilter />, defaultState)

        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))
        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))

        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.StatFilterSelected, {
            name: FilterComponentKey.BusiestTimesMetricSelectFilter,
            logical_operator: null,
        })
    })
})
