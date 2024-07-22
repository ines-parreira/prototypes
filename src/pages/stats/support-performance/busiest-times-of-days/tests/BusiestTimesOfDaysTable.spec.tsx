import {act, fireEvent, render, screen, waitFor} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {
    get24Hours,
    hourFromHourIndex,
} from 'pages/stats/support-performance/busiest-times-of-days/utils'
import {ReportingGranularity} from 'models/reporting/types'
import {LegacyStatsFilters} from 'models/stat/types'
import {BusiestTimesOfDaysTable} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysTable'
import {
    BusiestTimeOfDaysMetrics,
    columnsOrder,
} from 'pages/stats/support-performance/busiest-times-of-days/types'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import {assumeMock} from 'utils/testing'

const mockStore = configureMockStore([thunk])
jest.mock('state/ui/stats/selectors')
const getCleanStatsFiltersWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithTimezone
)

describe('<BusiestTimesOfDaysTable />', () => {
    const defaultStatsFilters: LegacyStatsFilters = {
        period: {
            start_datetime: '2021-05-29T00:00:00+02:00',
            end_datetime: '2021-05-30T23:59:59+02:00',
        },
    }

    beforeEach(() => {
        getCleanStatsFiltersWithTimezoneMock.mockReturnValue({
            userTimezone: 'someTimezone',
            cleanStatsFilters: defaultStatsFilters,
            granularity: ReportingGranularity.Day,
        })
    })

    const queryMock = jest.fn().mockReturnValue({data: [[]], isLoading: false})

    it('should render all columns and rows', () => {
        render(
            <Provider store={mockStore({})}>
                <BusiestTimesOfDaysTable
                    metricName={BusiestTimeOfDaysMetrics.TicketsCreated}
                    useMetricQuery={queryMock}
                    isHeatmapMode={false}
                />
            </Provider>
        )

        columnsOrder.forEach((column) =>
            expect(screen.getByText(column.label)).toBeInTheDocument()
        )
        get24Hours().forEach((hour) =>
            expect(
                screen.getByText(hourFromHourIndex(hour))
            ).toBeInTheDocument()
        )
    })

    it('should handle table scrolling', async () => {
        render(
            <Provider store={mockStore({})}>
                <BusiestTimesOfDaysTable
                    metricName={BusiestTimeOfDaysMetrics.TicketsCreated}
                    useMetricQuery={queryMock}
                    isHeatmapMode={false}
                />
            </Provider>
        )
        act(() => {
            const tableRow = document.getElementsByClassName('container')[0]
            fireEvent.scroll(tableRow, {target: {scrollLeft: 50}})
        })

        await waitFor(() => {
            expect(screen.getAllByRole('cell')[0]).toHaveClass('withShadow')
        })
    })

    it('should handle table scrolling to the left border', async () => {
        render(
            <Provider store={mockStore({})}>
                <BusiestTimesOfDaysTable
                    metricName={BusiestTimeOfDaysMetrics.TicketsCreated}
                    useMetricQuery={queryMock}
                    isHeatmapMode={false}
                />
            </Provider>
        )
        act(() => {
            const tableRow = document.getElementsByClassName('container')[0]
            fireEvent.scroll(tableRow, {target: {scrollLeft: 0}})
        })

        await waitFor(() => {
            expect(screen.getAllByRole('cell')[0]).not.toHaveClass('withShadow')
        })
    })
})
