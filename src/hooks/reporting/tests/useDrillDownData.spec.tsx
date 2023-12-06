import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment/moment'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {TicketMessagesDimension} from 'models/reporting/cubes/TicketMessagesCube'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {EnrichmentFields, ReportingGranularity} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {TicketChannel, TicketStatus} from 'business/types/ticket'
import {agents} from 'fixtures/agents'
import {
    DRILL_DOWN_PER_PAGE,
    formatDrillDownRowData,
    useDrillDownData,
} from 'hooks/reporting/useDrillDownData'
import {useMetricPerDimensionWithEnrichment} from 'hooks/reporting/useMetricPerDimension'
import {getAgentsJS} from 'state/agents/selectors'
import {RootState, StoreDispatch} from 'state/types'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/agentPerformanceSlice'
import {DrillDownMetric} from 'state/ui/stats/drillDownSlice'
import {OverviewMetric} from 'state/ui/stats/types'
import {formatReportingQueryDate} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('state/ui/stats/agentPerformanceSlice')
const getCleanStatsFiltersWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithTimezone
)
jest.mock('state/agents/selectors')
const getAgentsJSMock = assumeMock(getAgentsJS)
jest.mock('hooks/reporting/useMetricPerDimension')
const useMetricPerDimensionWithEnrichmentMock = assumeMock(
    useMetricPerDimensionWithEnrichment
)

describe('useDrillDownData', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const userTimezone = 'someTimeZone'
    const metricDimension = TicketMessagesDimension.MessagesCount
    const rowData = [
        {
            [TicketDimension.TicketId]: '777',
            [EnrichmentFields.TicketName]: 'Some Ticket',
            [EnrichmentFields.Description]: 'Some description',
            [EnrichmentFields.Channel]: TicketChannel.FacebookMention,
            [EnrichmentFields.Status]: TicketStatus.Open,
            [EnrichmentFields.CreatedDatetime]: '2023-04-07T00:00:00.000',
            [EnrichmentFields.ContactReason]: 'some contact reason',
            [EnrichmentFields.AssigneeId]: '1',
            [metricDimension]: 12,
        },
    ]

    beforeEach(() => {
        getCleanStatsFiltersWithTimezoneMock.mockReturnValue({
            cleanStatsFilters: statsFilters,
            userTimezone,
            granularity: ReportingGranularity.Day,
        })
        getAgentsJSMock.mockReturnValue(agents)
        useMetricPerDimensionWithEnrichmentMock.mockReturnValue({
            data: {allData: rowData} as unknown as any,
            isFetching: false,
            isError: false,
        })
    })

    it('should return formatted Data', () => {
        const metricData: DrillDownMetric = {
            metricName: OverviewMetric.MessagesSent,
        }

        const {result} = renderHook(() => useDrillDownData(metricData), {
            wrapper: ({children}) => (
                <Provider store={mockStore({})}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual({
            isFetching: false,
            perPage: DRILL_DOWN_PER_PAGE,
            currentPage: 1,
            onPageChange: expect.any(Function),
            data: rowData.map((row) =>
                formatDrillDownRowData(row, agents, metricDimension)
            ),
        })
    })
})
