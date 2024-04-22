import {act, renderHook} from '@testing-library/react-hooks'
import moment from 'moment/moment'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {HelpdeskMessageMeasure} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketCustomFieldsMember} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {TicketSatisfactionSurveyDimension} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {OrderDirection} from 'models/api/types'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {
    EnrichmentFields,
    ReportingFilterOperator,
    ReportingGranularity,
} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {TicketChannel, TicketStatus} from 'business/types/ticket'
import {agents} from 'fixtures/agents'
import {
    defaultEnrichmentFields,
    DRILL_DOWN_PER_PAGE,
    formatDrillDownRowData,
    useDrillDownData,
} from 'hooks/reporting/useDrillDownData'
import {useMetricPerDimensionWithEnrichment} from 'hooks/reporting/useMetricPerDimension'
import {getHumanAndAutomationBotAgentsJS} from 'state/agents/selectors'
import {RootState, StoreDispatch} from 'state/types'
import {DrillDownMetric} from 'state/ui/stats/drillDownSlice'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import {OverviewMetric, TicketFieldsMetric} from 'state/ui/stats/types'
import {formatReportingQueryDate} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('state/ui/stats/selectors')
const getCleanStatsFiltersWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithTimezone
)
jest.mock('state/agents/selectors')
const getHumanAndBotAgentsJSMock = assumeMock(getHumanAndAutomationBotAgentsJS)
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
    const metricDimension = HelpdeskMessageMeasure.MessageCount
    const ticketIdField = TicketDimension.TicketId
    const exampleRow = {
        [TicketDimension.TicketId]: '777',
        [EnrichmentFields.TicketName]: 'Some Ticket',
        [EnrichmentFields.Description]: 'Some description',
        [EnrichmentFields.Channel]: TicketChannel.FacebookMention,
        [EnrichmentFields.Status]: TicketStatus.Open,
        [EnrichmentFields.CreatedDatetime]: '2023-04-07T00:00:00.000',
        [EnrichmentFields.ContactReason]: 'some contact reason',
        [EnrichmentFields.AssigneeId]: '1',
        [EnrichmentFields.IsUnread]: true,
        [metricDimension]: 12,
    }
    const rowData = [exampleRow]
    const metricData: DrillDownMetric = {
        metricName: OverviewMetric.MessagesSent,
    }

    beforeEach(() => {
        getCleanStatsFiltersWithTimezoneMock.mockReturnValue({
            cleanStatsFilters: statsFilters,
            userTimezone,
            granularity: ReportingGranularity.Day,
        })
        getHumanAndBotAgentsJSMock.mockReturnValue(agents)
        useMetricPerDimensionWithEnrichmentMock.mockReturnValue({
            data: {allData: rowData} as unknown as any,
            isFetching: false,
            isError: false,
        })
    })

    it('should return formatted Data', () => {
        const {result} = renderHook(() => useDrillDownData(metricData), {
            wrapper: ({children}) => (
                <Provider store={mockStore({})}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual({
            isFetching: false,
            perPage: DRILL_DOWN_PER_PAGE,
            currentPage: 1,
            pagesCount: Math.ceil(rowData.length / DRILL_DOWN_PER_PAGE),
            totalResults: rowData.length,
            onPageChange: expect.any(Function),
            data: rowData.map((row) =>
                formatDrillDownRowData(
                    row,
                    agents,
                    metricDimension,
                    ticketIdField
                )
            ),
        })
    })

    it('should apply period filters for CustomField Metrics', () => {
        const start_datetime = '2023-12-19T00:00:00.000'
        const end_datetime = '2023-12-20T00:00:00.000'
        const metricData: DrillDownMetric = {
            metricName: TicketFieldsMetric.TicketCustomFieldsTicketCount,
            customFieldId: 123,
            customFieldValue: [],
            dateRange: {
                start_datetime,
                end_datetime,
            },
        }
        renderHook(() => useDrillDownData(metricData), {
            wrapper: ({children}) => (
                <Provider store={mockStore({})}>{children}</Provider>
            ),
        })

        expect(useMetricPerDimensionWithEnrichmentMock).toHaveBeenCalledWith(
            expect.objectContaining({
                filters: expect.arrayContaining([
                    expect.objectContaining({
                        member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
                        operator: ReportingFilterOperator.InDateRange,
                        values: [start_datetime, end_datetime],
                    }),
                ]),
            }),
            defaultEnrichmentFields
        )
    })

    it('should apply default period filters for CustomField Metrics', () => {
        const metricData: DrillDownMetric = {
            metricName: TicketFieldsMetric.TicketCustomFieldsTicketCount,
            customFieldId: 123,
            customFieldValue: [],
        }
        renderHook(() => useDrillDownData(metricData), {
            wrapper: ({children}) => (
                <Provider store={mockStore({})}>{children}</Provider>
            ),
        })

        expect(useMetricPerDimensionWithEnrichmentMock).toHaveBeenCalledWith(
            expect.objectContaining({
                filters: expect.arrayContaining([
                    expect.objectContaining({
                        member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
                        operator: ReportingFilterOperator.InDateRange,
                        values: [periodStart, periodEnd],
                    }),
                ]),
            }),
            defaultEnrichmentFields
        )
    })

    it('should sort ascending CSAT metrics', () => {
        const metricData: DrillDownMetric = {
            metricName: OverviewMetric.CustomerSatisfaction,
        }
        renderHook(() => useDrillDownData(metricData), {
            wrapper: ({children}) => (
                <Provider store={mockStore({})}>{children}</Provider>
            ),
        })

        expect(useMetricPerDimensionWithEnrichmentMock).toHaveBeenCalledWith(
            expect.objectContaining({
                order: [
                    [
                        TicketSatisfactionSurveyDimension.SurveyScore,
                        OrderDirection.Asc,
                    ],
                ],
            }),
            defaultEnrichmentFields
        )
    })

    it('should assume unread Tickets when ticket enrichment missing missing and null other fields', () => {
        useMetricPerDimensionWithEnrichmentMock.mockReturnValue({
            data: {
                allData: [
                    {
                        [EnrichmentFields.IsUnread]: undefined,
                    },
                ],
            } as unknown as any,
            isFetching: false,
            isError: false,
        })
        const metricData: DrillDownMetric = {
            metricName: OverviewMetric.MessagesSent,
        }

        const {result} = renderHook(() => useDrillDownData(metricData), {
            wrapper: ({children}) => (
                <Provider store={mockStore({})}>{children}</Provider>
            ),
        })

        expect(result.current.data).toContainEqual(
            expect.objectContaining({
                ticket: expect.objectContaining({
                    isRead: false,
                    id: null,
                    subject: null,
                    description: null,
                    channel: null,
                    created: null,
                    contactReason: null,
                }),
            })
        )
    })

    it('should return null when assignee missing', () => {
        useMetricPerDimensionWithEnrichmentMock.mockReturnValue({
            data: {
                allData: [
                    {...exampleRow, [EnrichmentFields.AssigneeId]: undefined},
                ],
            } as unknown as any,
            isFetching: false,
            isError: false,
        })

        const {result} = renderHook(() => useDrillDownData(metricData), {
            wrapper: ({children}) => (
                <Provider store={mockStore({})}>{children}</Provider>
            ),
        })

        expect(result.current.data).toContainEqual(
            expect.objectContaining({assignee: null})
        )
    })

    it('should switch to next page of data', () => {
        useMetricPerDimensionWithEnrichmentMock.mockReturnValue({
            data: {
                allData: new Array(DRILL_DOWN_PER_PAGE + 1).fill(exampleRow),
            } as unknown as any,
            isFetching: false,
            isError: false,
        })

        const {result} = renderHook(() => useDrillDownData(metricData), {
            wrapper: ({children}) => (
                <Provider store={mockStore({})}>{children}</Provider>
            ),
        })
        act(() => {
            result.current.onPageChange(2)
        })

        expect(result.current.currentPage).toEqual(2)
    })
})
