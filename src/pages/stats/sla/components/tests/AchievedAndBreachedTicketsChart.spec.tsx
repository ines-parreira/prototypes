import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useSatisfiedOrBreachedTicketsTimeSeries } from 'hooks/reporting/sla/useSatisfiedOrBreachedTicketsTimeSeries'
import { TimeSeriesDataItem } from 'hooks/reporting/useTimeSeries'
import { TicketSLAStatus } from 'models/reporting/cubes/sla/TicketSLACube'
import { ReportingGranularity } from 'models/reporting/types'
import BarChart from 'pages/stats/common/components/charts/BarChart/BarChart'
import { formatLabeledTimeSeriesData } from 'pages/stats/common/utils'
import {
    AchievedAndBreachedTicketsChart,
    CHART_FIELDS,
    CHART_TITLE,
    HINT,
} from 'pages/stats/sla/components/AchievedAndBreachedTicketsChart'
import { initialState as uiStatsInitialState } from 'state/ui/stats/filtersSlice'
import { assumeMock } from 'utils/testing'

const mockStore = configureMockStore([thunk])

jest.mock('pages/stats/common/components/charts/BarChart/BarChart')
const BarChartMock = assumeMock(BarChart as unknown as jest.Mock)

jest.mock('hooks/reporting/sla/useSatisfiedOrBreachedTicketsTimeSeries')
const useSatisfiedAndBreachedTicketsTimeSeriesMock = assumeMock(
    useSatisfiedOrBreachedTicketsTimeSeries,
)

describe('<AchievedAndBreachedTicketsChart />', () => {
    const defaultState = {
        stats: {
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-07T23:59:59.999Z',
                },
            },
        },
        ui: {
            stats: { filters: uiStatsInitialState },
        },
    }
    const exampleData: Record<string, TimeSeriesDataItem[][]> = {
        [TicketSLAStatus.Breached]: [
            [
                {
                    dateTime: '2021-02-03T00:00:00.000Z',
                    value: 123,
                },
                {
                    dateTime: '2021-02-04T00:00:00.000Z',
                    value: 456,
                },
                {
                    dateTime: '2021-02-05T00:00:00.000Z',
                    value: 789,
                },
            ],
        ],
        [TicketSLAStatus.Satisfied]: [
            [
                {
                    dateTime: '2021-02-03T00:00:00.000Z',
                    value: 654,
                },
                {
                    dateTime: '2021-02-04T00:00:00.000Z',
                    value: 987,
                },
                {
                    dateTime: '2021-02-05T00:00:00.000Z',
                    value: 321,
                },
            ],
        ],
    }

    beforeEach(() => {
        BarChartMock.mockReturnValue(() => null)
        useSatisfiedAndBreachedTicketsTimeSeriesMock.mockReturnValue({
            data: exampleData,
            isLoading: false,
        } as any)
    })

    it('should render the loading skeleton', () => {
        useSatisfiedAndBreachedTicketsTimeSeriesMock.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as any)

        render(
            <Provider store={mockStore(defaultState)}>
                <AchievedAndBreachedTicketsChart />
            </Provider>,
        )

        expect(
            document.querySelector('.react-loading-skeleton'),
        ).toBeInTheDocument()
    })

    it('should render the title and hint', async () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <AchievedAndBreachedTicketsChart />
            </Provider>,
        )
        userEvent.hover(screen.getByText('info'))

        expect(screen.getByText(CHART_TITLE)).toBeInTheDocument()
        await waitFor(() => {
            expect(screen.getByText(HINT)).toBeInTheDocument()
        })
    })

    it('should render the data as stacked BarChart', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <AchievedAndBreachedTicketsChart />
            </Provider>,
        )

        expect(BarChartMock).toHaveBeenCalledWith(
            expect.objectContaining({ isStacked: true }),
            {},
        )
        expect(BarChartMock).toHaveBeenCalledWith(
            expect.objectContaining({
                data: formatLabeledTimeSeriesData(
                    [
                        exampleData[TicketSLAStatus.Satisfied][0],
                        exampleData[TicketSLAStatus.Breached][0],
                    ],
                    CHART_FIELDS.map((metric) => metric.label),
                    ReportingGranularity.Day,
                ),
            }),
            {},
        )
    })
})
