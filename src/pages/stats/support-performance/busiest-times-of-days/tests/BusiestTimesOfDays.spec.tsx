import {render, screen} from '@testing-library/react'
import React from 'react'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'
import {BusiestTimesOfDaysTable} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysTable'
import {BusiestTimeOfDaysMetrics} from 'pages/stats/support-performance/busiest-times-of-days/types'
import {getMetricQuery} from 'pages/stats/support-performance/busiest-times-of-days/utils'
import {
    BUSIEST_TIME_OF_DAY_PAGE_TITLE,
    BusiestTimesOfDays,
} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDays'
import {assumeMock} from 'utils/testing'

jest.mock('pages/stats/SupportPerformanceFilters')
const FiltersMock = assumeMock(SupportPerformanceFilters)
jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))
jest.mock('pages/stats/AnalyticsFooter.tsx')
const AnalyticsFooterMock = assumeMock(AnalyticsFooter)
jest.mock(
    'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysTable'
)
const BusiestTimesOfDaysTableMock = assumeMock(BusiestTimesOfDaysTable)
const componentMock = () => <div />

describe('BusiestTimesOfDays page', () => {
    beforeEach(() => {
        FiltersMock.mockImplementation(componentMock)
        AnalyticsFooterMock.mockImplementation(componentMock)
        BusiestTimesOfDaysTableMock.mockImplementation(componentMock)
    })

    it('should render the page title', () => {
        const defaultMetric = BusiestTimeOfDaysMetrics.TicketsCreated

        render(<BusiestTimesOfDays />)

        expect(
            screen.getByText(BUSIEST_TIME_OF_DAY_PAGE_TITLE)
        ).toBeInTheDocument()
        expect(BusiestTimesOfDaysTableMock).toHaveBeenCalledWith(
            {
                metricName: defaultMetric,
                useMetricQuery: getMetricQuery(defaultMetric),
                isHeatmapMode: false,
            },
            {}
        )
    })
})
