import {screen} from '@testing-library/react'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import {FiltersPanel} from 'pages/stats/common/filters/FiltersPanel'
import {
    BUSIEST_TIME_OF_DAY_PAGE_TITLE,
    BusiestTimesOfDays,
} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDays'
import {BusiestTimesOfDaysDownloadDataButton} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysDownloadDataButton'
import {BusiestTimesOfDaysTable} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysTable'
import {BusiestTimeOfDaysMetrics} from 'pages/stats/support-performance/busiest-times-of-days/types'
import {getMetricQuery} from 'pages/stats/support-performance/busiest-times-of-days/utils'
import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'
import {RootState} from 'state/types'
import {busiestTimesSlice, initialState} from 'state/ui/stats/busiestTimesSlice'
import {assumeMock, renderWithStore} from 'utils/testing'

jest.mock('pages/stats/SupportPerformanceFilters')
const FiltersMock = assumeMock(SupportPerformanceFilters)
jest.mock('pages/stats/common/filters/FiltersPanel')
const FiltersPanelMock = assumeMock(FiltersPanel)
jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))
jest.mock('pages/stats/AnalyticsFooter.tsx')
const AnalyticsFooterMock = assumeMock(AnalyticsFooter)
jest.mock(
    'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysTable'
)
const BusiestTimesOfDaysTableMock = assumeMock(BusiestTimesOfDaysTable)
jest.mock(
    'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysDownloadDataButton'
)
const BusiestTimesOfDaysDownloadDataButtonMock = assumeMock(
    BusiestTimesOfDaysDownloadDataButton
)
const componentMock = () => <div />

describe('BusiestTimesOfDays page', () => {
    const defaultState = {
        ui: {
            stats: {[busiestTimesSlice.name]: initialState},
        },
    } as RootState

    beforeEach(() => {
        FiltersMock.mockImplementation(componentMock)
        FiltersPanelMock.mockImplementation(componentMock)
        AnalyticsFooterMock.mockImplementation(componentMock)
        BusiestTimesOfDaysTableMock.mockImplementation(componentMock)
        BusiestTimesOfDaysDownloadDataButtonMock.mockImplementation(
            componentMock
        )
    })

    it('should render the page title', () => {
        const defaultMetric = BusiestTimeOfDaysMetrics.TicketsCreated

        renderWithStore(<BusiestTimesOfDays />, defaultState)

        expect(
            screen.getByText(BUSIEST_TIME_OF_DAY_PAGE_TITLE)
        ).toBeInTheDocument()
        expect(BusiestTimesOfDaysTableMock).toHaveBeenCalledWith(
            {
                metricName: defaultMetric,
                useMetricQuery: getMetricQuery(defaultMetric),
                isHeatmapMode: true,
            },
            {}
        )
    })

    it('should render FiltersPanel with New Filters flag', () => {
        mockFlags({[FeatureFlagKey.AnalyticsNewFilters]: true})

        renderWithStore(<BusiestTimesOfDays />, defaultState)

        expect(FiltersPanelMock).toHaveBeenCalled()
    })
})
