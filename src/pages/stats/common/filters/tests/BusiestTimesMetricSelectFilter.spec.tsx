import {screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
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

describe('BusiestTimesMetricSelectFilter', () => {
    const defaultState = {
        ui: {
            [busiestTimesSlice.name]: initialState,
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

        userEvent.click(screen.getByText('arrow_drop_down'))
        userEvent.click(screen.getByText(metricLabels[metric]))

        expect(store.getActions()).toContainEqual(setSelectedMetric(metric))
    })
})
