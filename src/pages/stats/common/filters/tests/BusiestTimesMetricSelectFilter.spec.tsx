import {screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {FILTER_DROPDOWN_ICON} from 'pages/stats/common/components/Filter/constants'
import {BusiestTimeOfDaysMetrics} from 'pages/stats/support-performance/busiest-times-of-days/types'
import {BusiestTimesMetricSelectFilter} from 'pages/stats/common/filters/BusiestTimesMetricSelectFilter'
import {RootState} from 'state/types'
import {
    busiestTimesSlice,
    initialState,
    setSelectedMetric,
} from 'state/ui/stats/busiestTimesSlice'
import {renderWithStore} from 'utils/testing'
import {metricLabels} from 'pages/stats/support-performance/busiest-times-of-days/utils'
import {SegmentEvent, logEvent} from 'common/segment'
import {FilterComponentKey} from 'models/stat/types'

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {StatFilterSelected: 'stat-filter-selected'},
}))

describe('BusiestTimesMetricSelectFilter', () => {
    const defaultState = {
        ui: {
            stats: {[busiestTimesSlice.name]: initialState},
        },
    } as RootState

    it('should render available metrics', () => {
        renderWithStore(<BusiestTimesMetricSelectFilter />, defaultState)

        expect(
            screen.getByText(metricLabels[initialState.selectedMetric])
        ).toBeInTheDocument()
    })

    it('should update selectedMetric in state on selection', () => {
        const metric = BusiestTimeOfDaysMetrics.TicketsClosed
        const {store} = renderWithStore(
            <BusiestTimesMetricSelectFilter />,
            defaultState
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
