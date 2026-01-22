import { assumeMock } from '@repo/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useSatisfiedOrBreachedVoiceCallsTimeSeries } from 'domains/reporting/hooks/sla/useSatisfiedOrBreachedVoiceCallsTimeSeries'
import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { BarChart } from 'domains/reporting/pages/common/components/charts/BarChart/BarChart'
import { formatLabeledTimeSeriesData } from 'domains/reporting/pages/common/utils'
import {
    AchievedAndBreachedVoiceCallsChart,
    CHART_FIELDS,
    CHART_TITLE,
    HINT,
} from 'domains/reporting/pages/sla/components/AchievedAndBreachedVoiceCallsChart'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'

const mockStore = configureMockStore([thunk])

jest.mock(
    'domains/reporting/pages/common/components/charts/BarChart/BarChart',
    () => ({
        BarChart: jest.fn(),
    }),
)
const BarChartMock = assumeMock(BarChart as unknown as jest.Mock)

jest.mock(
    'domains/reporting/hooks/sla/useSatisfiedOrBreachedVoiceCallsTimeSeries',
)
const useSatisfiedOrBreachedVoiceCallsTimeSeriesMock = assumeMock(
    useSatisfiedOrBreachedVoiceCallsTimeSeries,
)

describe('<AchievedAndBreachedVoiceCallsChart />', () => {
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

    const exampleData: TimeSeriesDataItem[][] = [
        [
            {
                dateTime: '2021-02-03T00:00:00.000Z',
                value: 654,
                label: 'achievedExposures',
            },
            {
                dateTime: '2021-02-04T00:00:00.000Z',
                value: 987,
                label: 'achievedExposures',
            },
            {
                dateTime: '2021-02-05T00:00:00.000Z',
                value: 321,
                label: 'achievedExposures',
            },
        ],
        [
            {
                dateTime: '2021-02-03T00:00:00.000Z',
                value: 123,
                label: 'breachedExposures',
            },
            {
                dateTime: '2021-02-04T00:00:00.000Z',
                value: 456,
                label: 'breachedExposures',
            },
            {
                dateTime: '2021-02-05T00:00:00.000Z',
                value: 789,
                label: 'breachedExposures',
            },
        ],
    ]

    beforeEach(() => {
        BarChartMock.mockReturnValue(() => null)
        useSatisfiedOrBreachedVoiceCallsTimeSeriesMock.mockReturnValue({
            data: exampleData,
            isLoading: false,
        } as any)
    })

    it('should render the loading skeleton', () => {
        useSatisfiedOrBreachedVoiceCallsTimeSeriesMock.mockReturnValue({
            data: [[]],
            isLoading: true,
        } as any)

        render(
            <Provider store={mockStore(defaultState)}>
                <AchievedAndBreachedVoiceCallsChart />
            </Provider>,
        )

        expect(
            document.querySelector('.react-loading-skeleton'),
        ).toBeInTheDocument()
    })

    it('should render the title and hint', async () => {
        const user = userEvent.setup()
        render(
            <Provider store={mockStore(defaultState)}>
                <AchievedAndBreachedVoiceCallsChart />
            </Provider>,
        )

        await act(() => user.hover(screen.getByText('info')))

        expect(screen.getByText(CHART_TITLE)).toBeInTheDocument()
        await waitFor(() => {
            expect(screen.getByText(HINT)).toBeInTheDocument()
        })
    })

    it('should render the data as stacked BarChart', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <AchievedAndBreachedVoiceCallsChart />
            </Provider>,
        )

        expect(BarChartMock).toHaveBeenCalledWith(
            expect.objectContaining({ isStacked: true }),
            {},
        )
        expect(BarChartMock).toHaveBeenCalledWith(
            expect.objectContaining({
                data: formatLabeledTimeSeriesData(
                    exampleData,
                    CHART_FIELDS.map((metric) => metric.label),
                    ReportingGranularity.Day,
                ),
            }),
            {},
        )
    })
})
