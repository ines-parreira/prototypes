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
    ACHIEVED_AND_BREACHED_CALLS_CHART_HINT,
    ACHIEVED_AND_BREACHED_CALLS_CHART_TITLE,
    AchievedAndBreachedVoiceCallsChart,
    CHART_FIELDS,
} from 'domains/reporting/pages/sla/components/AchievedAndBreachedVoiceCallsChart'
import { VoiceSLAStatus } from 'domains/reporting/pages/sla/constants'
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

    const exampleData: Record<string, TimeSeriesDataItem[][]> = {
        [VoiceSLAStatus.Breached]: [
            [
                {
                    dateTime: '2026-01-28T00:00:00.000',
                    value: 0,
                    label: 'totalExposures',
                },
                {
                    dateTime: '2026-01-29T00:00:00.000',
                    value: 1,
                    label: 'totalExposures',
                    rawData: {
                        callSlaStatusLabel: 'achieved',
                        'queuedDate.day': '2026-01-29T00:00:00.000',
                        totalExposures: '1',
                        queuedDate: '2026-01-29T00:00:00.000',
                    },
                },
                {
                    dateTime: '2026-01-30T00:00:00.000',
                    value: 0,
                    label: 'totalExposures',
                },
            ],
        ],
        [VoiceSLAStatus.Satisfied]: [
            [
                {
                    dateTime: '2026-01-28T00:00:00.000',
                    value: 0,
                    label: 'totalExposures',
                },
                {
                    dateTime: '2026-01-29T00:00:00.000',
                    value: 0,
                    label: 'totalExposures',
                },
                {
                    dateTime: '2026-01-30T00:00:00.000',
                    value: 1,
                    label: 'totalExposures',
                    rawData: {
                        callSlaStatusLabel: 'breached',
                        'queuedDate.day': '2026-02-02T00:00:00.000',
                        totalExposures: '1',
                        queuedDate: '2026-02-02T00:00:00.000',
                    },
                },
            ],
        ],
    }

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

        expect(
            screen.getByText(ACHIEVED_AND_BREACHED_CALLS_CHART_TITLE),
        ).toBeInTheDocument()
        await waitFor(() => {
            expect(
                screen.getByText(ACHIEVED_AND_BREACHED_CALLS_CHART_HINT),
            ).toBeInTheDocument()
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
                    [
                        exampleData[VoiceSLAStatus.Satisfied][0],
                        exampleData[VoiceSLAStatus.Breached][0],
                    ],
                    CHART_FIELDS.map((metric) => metric.label),
                    ReportingGranularity.Day,
                ),
            }),
            {},
        )
    })
})
