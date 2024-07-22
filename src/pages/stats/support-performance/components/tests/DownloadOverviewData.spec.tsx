import {fireEvent, render} from '@testing-library/react'
import LD from 'launchdarkly-react-client-sdk'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {FeatureFlagKey} from 'config/featureFlags'
import {DOWNLOAD_DATA_BUTTON_LABEL} from 'pages/stats/constants'
import {
    useWorkloadPerChannelDistribution,
    useWorkloadPerChannelDistributionForPreviousPeriod,
} from 'hooks/reporting/distributions'
import {
    useClosedTicketsTrend,
    useCustomerSatisfactionTrend,
    useMedianFirstResponseTimeTrend,
    useMedianResolutionTimeTrend,
    useMessagesPerTicketTrend,
    useMessagesSentTrend,
    useOpenTicketsTrend,
    useTicketsCreatedTrend,
    useTicketsRepliedTrend,
} from 'hooks/reporting/metricTrends'
import {
    useMessagesSentTimeSeries,
    useTicketsClosedTimeSeries,
    useTicketsCreatedTimeSeries,
    useTicketsRepliedTimeSeries,
} from 'hooks/reporting/timeSeries'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {useTimeSeries} from 'hooks/reporting/useTimeSeries'
import {DownloadOverviewData} from 'pages/stats/support-performance/components/DownloadOverviewData'
import {TicketChannel} from 'business/types/ticket'
import {logEvent, SegmentEvent} from 'common/segment'
import {agents} from 'fixtures/agents'
import {integrationsState} from 'fixtures/integrations'
import {LegacyStatsFilters} from 'models/stat/types'
import {saveReport} from 'services/reporting/supportPerformanceReportingService'

import {fromLegacyStatsFilters} from 'state/stats/utils'
import {RootState, StoreDispatch} from 'state/types'
import {drillDownSlice, initialState} from 'state/ui/stats/drillDownSlice'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {assumeMock} from 'utils/testing'

jest.mock('models/reporting/queries')

jest.mock('services/reporting/supportPerformanceReportingService')
const saveReportMock = assumeMock(saveReport)

jest.mock('common/segment')
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

jest.mock('utils/file')
jest.mock('services/reporting/supportPerformanceReportingService')

jest.mock('hooks/reporting/useCleanStatsFilters')
const useCleanStatsFiltersMock = assumeMock(useCleanStatsFilters)

jest.mock('hooks/reporting/metricTrends')
const useCustomerSatisfactionTrendMock = assumeMock(
    useCustomerSatisfactionTrend
)
const useMedianFirstResponseTimeTrendMock = assumeMock(
    useMedianFirstResponseTimeTrend
)
const useMedianResolutionTimeTrendMock = assumeMock(
    useMedianResolutionTimeTrend
)
const useMessagesPerTicketTrendMock = assumeMock(useMessagesPerTicketTrend)
const useOpenTicketsTrendMock = assumeMock(useOpenTicketsTrend)
const useClosedTicketsTrendMock = assumeMock(useClosedTicketsTrend)
const useTicketsCreatedTrendMock = assumeMock(useTicketsCreatedTrend)
const useTicketsRepliedTrendMock = assumeMock(useTicketsRepliedTrend)
const useMessagesSentTrendMock = assumeMock(useMessagesSentTrend)

jest.mock('hooks/reporting/timeSeries')
const useTicketsCreatedTimeSeriesMock = assumeMock(useTicketsCreatedTimeSeries)
const useTicketsClosedTimeSeriesMock = assumeMock(useTicketsClosedTimeSeries)
const useTicketsRepliedTimeSeriesMock = assumeMock(useTicketsRepliedTimeSeries)
const useMessagesSentTimeSeriesMock = assumeMock(useMessagesSentTimeSeries)

jest.mock('hooks/reporting/distributions')
const useWorkloadPerChannelDistributionMock = assumeMock(
    useWorkloadPerChannelDistribution
)
const useWorkloadPerChannelDistributionForPreviousPeriodMock = assumeMock(
    useWorkloadPerChannelDistributionForPreviousPeriod
)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('DownloadOverviewData', () => {
    const defaultStatsFilters: LegacyStatsFilters = {
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
            filters: fromLegacyStatsFilters(defaultStatsFilters),
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
    const openTicketsMetricTrend = {
        ...defaultMetricTrend,
        data: {
            value: 90,
            prevValue: 100,
        },
    }
    const closedTicketsMetricTrend = {
        ...defaultMetricTrend,
        data: {
            value: 91,
            prevValue: 100,
        },
    }
    const createdTicketsMetricTrend = {
        ...defaultMetricTrend,
        data: {
            value: 92,
            prevValue: 100,
        },
    }
    const repliedTicketsMetricTrend = {
        ...defaultMetricTrend,
        data: {
            value: 93,
            prevValue: 100,
        },
    }
    const messagesSentMetricTrend = {
        ...defaultMetricTrend,
        data: {
            value: 94,
            prevValue: 100,
        },
    }
    const customerSatisfactionMetricTrend = {
        ...defaultMetricTrend,
        data: {
            interpretAs: 'more-is-better',
            value: 95,
            prevValue: 100,
        },
    }
    const medianFirstResponseTimeMetricTrend = {
        ...defaultMetricTrend,
        data: {
            interpretAs: 'less-is-better',
            value: 96,
            prevValue: 100,
        },
    }
    const medianResolutionTimeMetricTrend = {
        ...defaultMetricTrend,
        data: {
            interpretAs: 'less-is-better',
            value: 97,
            prevValue: 100,
        },
    }
    const messagesPerTicketMetricTrend = {
        ...defaultMetricTrend,
        data: {
            interpretAs: 'less-is-better',
            value: 98,
            prevValue: 100,
        },
    }

    const defaultTimeSeries = {
        data: [
            [
                {
                    dateTime: '2022-02-02T12:45:33.122',
                    value: 23,
                },
            ],
        ],
    } as ReturnType<typeof useTimeSeries>

    const workloadDistribution = {
        data: [
            {
                value: 200,
                label: TicketChannel.Email,
            },
            {
                value: 34,
                label: TicketChannel.Chat,
            },
        ],
    } as ReturnType<typeof useWorkloadPerChannelDistributionForPreviousPeriod>

    beforeEach(() => {
        jest.resetAllMocks()
        useCustomerSatisfactionTrendMock.mockReturnValue(
            customerSatisfactionMetricTrend
        )
        useMedianFirstResponseTimeTrendMock.mockReturnValue(
            medianFirstResponseTimeMetricTrend
        )
        useMedianResolutionTimeTrendMock.mockReturnValue(
            medianResolutionTimeMetricTrend
        )
        useMessagesPerTicketTrendMock.mockReturnValue(
            messagesPerTicketMetricTrend
        )
        useOpenTicketsTrendMock.mockReturnValue(openTicketsMetricTrend)
        useClosedTicketsTrendMock.mockReturnValue(closedTicketsMetricTrend)
        useTicketsCreatedTrendMock.mockReturnValue(createdTicketsMetricTrend)
        useTicketsRepliedTrendMock.mockReturnValue(repliedTicketsMetricTrend)
        useMessagesSentTrendMock.mockReturnValue(messagesSentMetricTrend)
        useTicketsCreatedTimeSeriesMock.mockReturnValue(defaultTimeSeries)
        useTicketsClosedTimeSeriesMock.mockReturnValue(defaultTimeSeries)
        useTicketsRepliedTimeSeriesMock.mockReturnValue(defaultTimeSeries)
        useMessagesSentTimeSeriesMock.mockReturnValue(defaultTimeSeries)
        useWorkloadPerChannelDistributionForPreviousPeriodMock.mockReturnValue(
            workloadDistribution
        )
        useWorkloadPerChannelDistributionMock.mockReturnValue(
            workloadDistribution
        )
        useCleanStatsFiltersMock.mockReturnValue(defaultStatsFilters)
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.AnalyticsDeferredLoadingExperiment]: false,
        }))
    })

    it('should send event to segment and call saveReport on download data button click', () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <DownloadOverviewData />
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
