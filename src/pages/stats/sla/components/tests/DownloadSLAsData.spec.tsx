import {fireEvent, render} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {UseQueryResult} from '@tanstack/react-query'
import {DOWNLOAD_DATA_BUTTON_LABEL} from 'pages/stats/constants'
import {
    useBreachedSlaTicketsTrend,
    usePendingSlaTicketsTrend,
    useSatisfiedSlaTicketsTrend,
} from 'hooks/reporting/sla/useSLAsTicketsTrends'
import {useSatisfiedOrBreachedTicketsTimeSeries} from 'hooks/reporting/sla/useSatisfiedOrBreachedTicketsTimeSeries'
import {useTicketSlaAchievementRateTrend} from 'hooks/reporting/sla/useTicketSlaAchievementRate'

import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {TicketChannel} from 'business/types/ticket'
import {logEvent, SegmentEvent} from 'common/segment'
import {agents} from 'fixtures/agents'
import {integrationsState} from 'fixtures/integrations'
import {StatsFilters} from 'models/stat/types'
import {RootState, StoreDispatch} from 'state/types'
import {drillDownSlice, initialState} from 'state/ui/stats/drillDownSlice'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {assumeMock} from 'utils/testing'
import {DownloadSLAsData} from 'pages/stats/sla/components/DownloadSLAsData'
import {saveReport} from 'services/reporting/SLAsReportingService'
import {TicketSLAStatus} from 'models/reporting/cubes/sla/TicketSLACube'
import {TimeSeriesDataItem} from 'hooks/reporting/useTimeSeries'

jest.mock('models/reporting/queries')

jest.mock('services/reporting/SLAsReportingService')
const saveReportMock = assumeMock(saveReport)

jest.mock('common/segment')
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

jest.mock('utils/file')

jest.mock('hooks/reporting/sla/useSLAsTicketsTrends')
const useBreachedSlaTicketsTrendMock = assumeMock(useBreachedSlaTicketsTrend)
const usePendingSlaTicketsTrendMock = assumeMock(usePendingSlaTicketsTrend)
const useSatisfiedSlaTicketsTrendMock = assumeMock(useSatisfiedSlaTicketsTrend)

jest.mock('hooks/reporting/sla/useSatisfiedOrBreachedTicketsTimeSeries')
const useSatisfiedOrBreachedTicketsTimeSeriesMock = assumeMock(
    useSatisfiedOrBreachedTicketsTimeSeries
)

jest.mock('hooks/reporting/sla/useTicketSlaAchievementRate')
const useTicketSlaAchievementRateTrendMock = assumeMock(
    useTicketSlaAchievementRateTrend
)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('DownloadSLAsData', () => {
    const defaultStatsFilters: StatsFilters = {
        period: {
            start_datetime: '2021-02-03T00:00:00.000Z',
            end_datetime: '2021-02-03T23:59:59.999Z',
        },
        channels: [TicketChannel.Chat],
        integrations: [integrationsState.integrations[0].id],
        agents: [agents[0].id],
        tags: [1],
    }

    const defaultState = {
        stats: {
            filters: defaultStatsFilters,
        },
        ui: {
            stats: uiStatsInitialState,
            [drillDownSlice.name]: initialState,
        },
    } as RootState

    const defaultMetricTrend: MetricTrend = {
        isFetching: false,
        isError: true,
        data: {
            value: 456,
            prevValue: 123,
        },
    }
    const breachedTicketsSLAsMetricTrend = {
        ...defaultMetricTrend,
        data: {
            value: 95,
            prevValue: 100,
        },
    }
    const pendingTicketsSLAsMetricTrend = {
        ...defaultMetricTrend,
        data: {
            value: 96,
            prevValue: 100,
        },
    }
    const satisfiedTicketsSLAsMetricTrend = {
        ...defaultMetricTrend,
        data: {
            value: 97,
            prevValue: 100,
        },
    }
    const slaTicketAchievementRateMetricTrend = {
        ...defaultMetricTrend,
        data: {
            value: 98,
            prevValue: 100,
        },
    }

    const satisfiedOrBreachedTimeSeries = {
        isFetching: false,
        isError: false,
        data: {
            [TicketSLAStatus.Breached]: [
                [
                    {
                        dateTime: '2022-02-02T12:45:33.122',
                        value: 200,
                        label: TicketSLAStatus.Satisfied,
                    },
                ],
            ],
            [TicketSLAStatus.Pending]: [
                [
                    {
                        dateTime: '2022-02-02T12:45:33.122',
                        value: 400,
                        label: TicketSLAStatus.Pending,
                    },
                ],
            ],
            [TicketSLAStatus.Satisfied]: [
                [
                    {
                        dateTime: '2022-02-02T12:45:33.122',
                        value: 600,
                        label: TicketSLAStatus.Satisfied,
                    },
                ],
            ],
        },
    } as UseQueryResult<Record<TicketSLAStatus, TimeSeriesDataItem[][]>>

    beforeEach(() => {
        jest.resetAllMocks()
        useBreachedSlaTicketsTrendMock.mockReturnValue(
            breachedTicketsSLAsMetricTrend
        )
        usePendingSlaTicketsTrendMock.mockReturnValue(
            pendingTicketsSLAsMetricTrend
        )
        useSatisfiedSlaTicketsTrendMock.mockReturnValue(
            satisfiedTicketsSLAsMetricTrend
        )
        useTicketSlaAchievementRateTrendMock.mockReturnValue(
            slaTicketAchievementRateMetricTrend
        )
        useSatisfiedOrBreachedTicketsTimeSeriesMock.mockReturnValue(
            satisfiedOrBreachedTimeSeries
        )
    })

    it('should send event to segment and call saveReport on download data button click', () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <DownloadSLAsData />
            </Provider>
        )

        fireEvent.click(getByText(DOWNLOAD_DATA_BUTTON_LABEL))

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            expect.objectContaining({
                name: 'all-metrics',
            })
        )
        expect(saveReportMock).toHaveBeenCalled()
    })
})
