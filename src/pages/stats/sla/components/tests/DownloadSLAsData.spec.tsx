// import {UseQueryResult} from '@tanstack/react-query'
import {act, fireEvent, render, waitFor} from '@testing-library/react'

import React from 'react'
// import {Provider} from 'react-redux'
// import configureMockStore from 'redux-mock-store'
// import thunk from 'redux-thunk'

import {TicketChannel} from 'business/types/ticket'
import {logEvent, SegmentEvent} from 'common/segment'
import {agents} from 'fixtures/agents'
import {integrationsState} from 'fixtures/integrations'
import {
    SLA_OVERVIEW_FILENAME,
    SLA_REPORT_FILENAME,
    SLA_TICKETS_IN_POLICY_FILENAME,
    SLA_TREND_FILENAME,
    // useDownloadSLAsData,
} from 'hooks/reporting/sla/useDownloadSLAsData'
import {
    fetchSatisfiedOrBreachedTicketsTimeSeries,
    // useSatisfiedOrBreachedTicketsTimeSeries,
} from 'hooks/reporting/sla/useSatisfiedOrBreachedTicketsTimeSeries'
import {
    fetchBreachedSlaTicketsTrend,
    fetchSatisfiedSlaTicketsTrend,
    // useBreachedSlaTicketsTrend,
    // useSatisfiedSlaTicketsTrend,
} from 'hooks/reporting/sla/useSLAsTicketsTrends'
import {
    fetchTicketSlaAchievementRateTrend,
    // useTicketSlaAchievementRateTrend,
} from 'hooks/reporting/sla/useTicketSlaAchievementRate'
import {getCsvFileNameWithDates} from 'hooks/reporting/support-performance/overview/useDownloadOverviewData'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {TimeSeriesDataItem} from 'hooks/reporting/useTimeSeries'
import {TicketSLAStatus} from 'models/reporting/cubes/sla/TicketSLACube'
import {ReportingGranularity} from 'models/reporting/types'
import {LegacyStatsFilters} from 'models/stat/types'
import {
    DEFAULT_TIMEZONE,
    DOWNLOAD_DATA_BUTTON_LABEL,
} from 'pages/stats/constants'

import {DownloadSLAsData} from 'pages/stats/sla/components/DownloadSLAsData'
import {
    ACHIEVED_SLA_LABEL,
    ACHIEVEMENT_RATE_LABEL,
    BREACHED_SLA_LABEL,
    DATES_WITHIN_PERIOD_LABEL,
    TICKETS_WITH_BREACHED_SLAS_LABEL,
} from 'services/reporting/constants'
import {createTimeSeriesPerDimensionReport} from 'services/reporting/SLAsReportingService'
import {createTrendReport} from 'services/reporting/supportPerformanceReportingService'
// import {saveReport} from 'services/reporting/SLAsReportingService'
// import {fromLegacyStatsFilters} from 'state/stats/utils'
// import {RootState, StoreDispatch} from 'state/types'
// import {drillDownSlice, initialState} from 'state/ui/stats/drillDownSlice'
// import {initialState as uiStatsInitialState} from 'state/ui/stats/filtersSlice'
import * as files from 'utils/file'
// import {saveZippedFiles} from "utils/file";
import {assumeMock} from 'utils/testing'

jest.mock('models/reporting/queries')

// jest.mock('services/reporting/SLAsReportingService')
// const saveReportMock = assumeMock(saveReport)

jest.mock('common/segment')
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

// jest.mock('utils/file')
// const saveZippedFilesMock = assumeMock(saveZippedFiles)

// jest.mock('hooks/reporting/sla/useDownloadSLAsData')
// const useDownloadSLAsDataMock = assumeMock(useDownloadSLAsData)

jest.mock('hooks/reporting/sla/useSLAsTicketsTrends')
// const useBreachedSlaTicketsTrendMock = assumeMock(useBreachedSlaTicketsTrend)
// const useSatisfiedSlaTicketsTrendMock = assumeMock(useSatisfiedSlaTicketsTrend)

jest.mock('hooks/reporting/sla/useSatisfiedOrBreachedTicketsTimeSeries')
// const useSatisfiedOrBreachedTicketsTimeSeriesMock = assumeMock(
//     useSatisfiedOrBreachedTicketsTimeSeries
// )

jest.mock('hooks/reporting/sla/useTicketSlaAchievementRate')
// const useTicketSlaAchievementRateTrendMock = assumeMock(
//     useTicketSlaAchievementRateTrend
// )
const fetchTicketSlaAchievementRateTrendMock = assumeMock(
    fetchTicketSlaAchievementRateTrend
)

jest.mock('hooks/reporting/support-performance/useNewStatsFilters')
const useNewStatsFiltersMock = assumeMock(useNewStatsFilters)

// const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const fetchBreachedSlaTicketsTrendMock = assumeMock(
    fetchBreachedSlaTicketsTrend
)
const fetchSatisfiedSlaTicketsTrendMock = assumeMock(
    fetchSatisfiedSlaTicketsTrend
)
const fetchSatisfiedOrBreachedTicketsTimeSeriesMock = assumeMock(
    fetchSatisfiedOrBreachedTicketsTimeSeries
)

const defaultStatsFilters: LegacyStatsFilters = {
    period: {
        start_datetime: '2021-02-03T00:00:00.000',
        end_datetime: '2021-02-03T23:59:59.999',
    },
    channels: [TicketChannel.Chat],
    integrations: [integrationsState.integrations[0].id],
    agents: [agents[0].id],
    tags: [1],
}

// const defaultState = {
//     stats: {
//         filters: fromLegacyStatsFilters(defaultStatsFilters),
//     },
//     ui: {
//         stats: {
//             filters: uiStatsInitialState,
//             [drillDownSlice.name]: initialState,
//         },
//     },
// } as RootState

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
const timeSeriesData: Record<string, TimeSeriesDataItem[][]> = {
    [TicketSLAStatus.Breached]: [
        [
            {
                dateTime: '2021-02-03T00:00:00.000Z',
                value: 200,
                label: TicketSLAStatus.Satisfied,
            },
        ],
    ],
    [TicketSLAStatus.Pending]: [
        [
            {
                dateTime: '2021-02-03T00:00:00.000Z',
                value: 400,
                label: TicketSLAStatus.Pending,
            },
        ],
    ],
    [TicketSLAStatus.Satisfied]: [
        [
            {
                dateTime: '2021-02-03T00:00:00.000Z',
                value: 600,
                label: TicketSLAStatus.Satisfied,
            },
        ],
    ],
}
// const satisfiedOrBreachedTimeSeries = {
//     isFetching: false,
//     isError: false,
//     data: timeSeriesData,
// } as UseQueryResult<Record<TicketSLAStatus, TimeSeriesDataItem[][]>>

describe('DownloadSLAsData', () => {
    // const reportFiles = {
    //     ['someReportFileName']: 'someReport',
    // }
    // const fileName = 'someFileName'
    beforeEach(() => {
        // jest.resetAllMocks()
        useNewStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: defaultStatsFilters,
            userTimezone: DEFAULT_TIMEZONE,
            granularity: ReportingGranularity.Day,
            isAnalyticsNewFilters: true,
        })
        fetchTicketSlaAchievementRateTrendMock.mockResolvedValue(
            slaTicketAchievementRateMetricTrend
        )
        fetchBreachedSlaTicketsTrendMock.mockResolvedValue(
            breachedTicketsSLAsMetricTrend
        )
        fetchSatisfiedSlaTicketsTrendMock.mockResolvedValue(
            satisfiedTicketsSLAsMetricTrend
        )
        fetchSatisfiedOrBreachedTicketsTimeSeriesMock.mockResolvedValue(
            timeSeriesData
        )
        // useBreachedSlaTicketsTrendMock.mockReturnValue(
        //     breachedTicketsSLAsMetricTrend
        // )
        // useSatisfiedSlaTicketsTrendMock.mockReturnValue(
        //     satisfiedTicketsSLAsMetricTrend
        // )
        // useTicketSlaAchievementRateTrendMock.mockReturnValue(
        //     slaTicketAchievementRateMetricTrend
        // )
        // useSatisfiedOrBreachedTicketsTimeSeriesMock.mockReturnValue(
        //     satisfiedOrBreachedTimeSeries
        // )
        // useDownloadSLAsDataMock.mockReturnValue({
        //     files: reportFiles,
        //     fileName,
        //     isLoading: false,
        // })
    })

    it('should send event to segment and call saveReport on download data button click', async () => {
        const spy = jest.spyOn(files, 'saveZippedFiles')
        const {getByText} = render(
            // <Provider store={mockStore(defaultState)}>
            <DownloadSLAsData />
            // </Provider>
        )

        const button = getByText(DOWNLOAD_DATA_BUTTON_LABEL)
        await waitFor(() => {
            expect(button).toBeAriaEnabled()
        })
        act(() => {
            fireEvent.click(button)
        })

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            expect.objectContaining({
                name: 'all-metrics',
            })
        )
        expect(spy).toHaveBeenCalledWith(
            {
                ...createTrendReport(
                    [
                        {
                            ...slaTicketAchievementRateMetricTrend.data,
                            label: ACHIEVEMENT_RATE_LABEL,
                        },
                        {
                            ...breachedTicketsSLAsMetricTrend.data,
                            label: TICKETS_WITH_BREACHED_SLAS_LABEL,
                        },
                    ],
                    getCsvFileNameWithDates(
                        defaultStatsFilters.period,
                        SLA_OVERVIEW_FILENAME
                    )
                ).files,
                ...createTrendReport(
                    [
                        {
                            ...breachedTicketsSLAsMetricTrend.data,
                            label: BREACHED_SLA_LABEL,
                        },
                        {
                            ...satisfiedTicketsSLAsMetricTrend.data,
                            label: ACHIEVED_SLA_LABEL,
                        },
                    ],
                    getCsvFileNameWithDates(
                        defaultStatsFilters.period,
                        SLA_TICKETS_IN_POLICY_FILENAME
                    )
                ).files,
                ...createTimeSeriesPerDimensionReport(
                    [
                        {
                            data: [
                                [
                                    DATES_WITHIN_PERIOD_LABEL,
                                    BREACHED_SLA_LABEL,
                                    ACHIEVED_SLA_LABEL,
                                ],
                                [
                                    defaultStatsFilters.period.start_datetime,
                                    'N/A',
                                    'N/A',
                                ],
                            ],
                            label: SLA_TREND_FILENAME,
                        },
                    ],
                    defaultStatsFilters.period
                ).files,
            },
            getCsvFileNameWithDates(
                defaultStatsFilters.period,
                SLA_REPORT_FILENAME
            )
        )
    })
})

// describe('DownloadSLAsData with AnalyticsNewFilters', () => {
//     beforeEach(() => {
//         // jest.resetAllMocks()
//         // useBreachedSlaTicketsTrendMock.mockReturnValue(
//         //     breachedTicketsSLAsMetricTrend
//         // )
//         // useSatisfiedSlaTicketsTrendMock.mockReturnValue(
//         //     satisfiedTicketsSLAsMetricTrend
//         // )
//         // useTicketSlaAchievementRateTrendMock.mockReturnValue(
//         //     slaTicketAchievementRateMetricTrend
//         // )
//         // useSatisfiedOrBreachedTicketsTimeSeriesMock.mockReturnValue(
//         //     satisfiedOrBreachedTimeSeries
//         // )
//         // useNewStatsFiltersMock.mockReturnValue({
//         //     cleanStatsFilters: defaultStatsFilters,
//         //     userTimezone: DEFAULT_TIMEZONE,
//         //     granularity: ReportingGranularity.Day,
//         //     isAnalyticsNewFilters: true,
//         // })
//         useDownloadSLAsDataMock.mockReturnValue({
//             files: reportFiles,
//             fileName,
//             isLoading: false,
//         })
//     })
//
//     it('should send event to segment and call saveReport on download data button click', () => {
//         const {getByText} = render(
//             <Provider store={mockStore(defaultState)}>
//                 <DownloadSLAsData />
//             </Provider>
//         )
//
//         fireEvent.click(getByText(DOWNLOAD_DATA_BUTTON_LABEL))
//
//         expect(logEventMock).toHaveBeenCalledWith(
//             SegmentEvent.StatDownloadClicked,
//             expect.objectContaining({
//                 name: 'all-metrics',
//             })
//         )
//         // expect(saveReportMock).toHaveBeenCalled()
//     })
// })
