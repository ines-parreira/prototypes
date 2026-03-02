import React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { act } from '@testing-library/react'
import moment from 'moment/moment'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketChannel, TicketStatus } from 'business/types/ticket'
import {
    defaultEnrichmentFields,
    DRILL_DOWN_PER_PAGE,
    filterCSATDataBasedOnIntent,
    getDrillDownMetricOrder,
    useDrillDownData,
    useDrillDownDataV2,
    useEnrichedDrillDownData,
    useEnrichedDrillDownDataUnpaginated,
} from 'domains/reporting/hooks/useDrillDownData'
import {
    useMetricPerDimension,
    useMetricPerDimensionV2,
    useMetricPerDimensionWithEnrichment,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { HelpdeskMessageMeasure } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import {
    TicketSLADimension,
    TicketSLAMeasure,
} from 'domains/reporting/models/cubes/sla/TicketSLACube'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import { TicketCustomFieldsMember } from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import { TicketSatisfactionSurveyDimension } from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { TicketTimeReference } from 'domains/reporting/models/stat/types'
import {
    EnrichmentFields,
    ReportingFilterOperator,
    ReportingGranularity,
} from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    formatConvertCampaignSalesDrillDownRowData,
    formatTicketDrillDownRowData,
    formatVoiceDrillDownRowData,
} from 'domains/reporting/pages/common/drill-down/DrillDownFormatters'
import {
    getDrillDownQuery,
    getDrillDownQueryV2,
} from 'domains/reporting/pages/common/drill-down/helpers'
import { OrderConversionDimension } from 'domains/reporting/pages/convert/clients/constants'
import { OverviewMetric } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import {
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
    getCleanStatsFiltersWithTimezone,
} from 'domains/reporting/state/ui/stats/selectors'
import {
    AIInsightsMetric,
    ConvertMetric,
    SlaMetric,
    TicketFieldsMetric,
    VoiceMetric,
} from 'domains/reporting/state/ui/stats/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import { agents } from 'fixtures/agents'
import useAppDispatch from 'hooks/useAppDispatch'
import { OrderDirection } from 'models/api/types'
import { getHumanAndAutomationBotAgentsJS } from 'state/agents/selectors'
import type { RootState, StoreDispatch } from 'state/types'

import { VoiceCallDimension } from '../../models/cubes/VoiceCallCube'

const initialState = {
    ui: {
        stats: {
            drillDown: {
                currentPage: 1,
            },
        },
    },
} as RootState
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('hooks/useAppDispatch', () => jest.fn())
let dispatch: jest.Mock
const useAppDispatchMock = useAppDispatch as jest.Mock

jest.mock('domains/reporting/state/ui/stats/selectors')
const getCleanStatsFiltersWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithTimezone,
)
const getCleanStatsFiltersWithLogicalOperatorsWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
)
jest.mock('state/agents/selectors')
const getHumanAndBotAgentsJSMock = assumeMock(getHumanAndAutomationBotAgentsJS)
jest.mock('domains/reporting/hooks/useMetricPerDimension')
const useMetricPerDimensionWithEnrichmentMock = assumeMock(
    useMetricPerDimensionWithEnrichment,
)
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)
const useMetricPerDimensionV2Mock = assumeMock(useMetricPerDimensionV2)

jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
)

describe('DrillDownData hooks', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const statsFiltersWithLogicalOperators = {
        period: statsFilters.period,
        channels: withDefaultLogicalOperator(['Email']),
    }
    const userTimezone = 'someTimeZone'

    beforeEach(() => {
        dispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatch)
        getCleanStatsFiltersWithTimezoneMock.mockReturnValue({
            cleanStatsFilters: statsFilters,
            userTimezone,
            granularity: ReportingGranularity.Day,
        })
        getCleanStatsFiltersWithLogicalOperatorsWithTimezoneMock.mockReturnValue(
            {
                cleanStatsFilters: statsFiltersWithLogicalOperators,
                userTimezone,
                granularity: ReportingGranularity.Day,
            },
        )
    })

    describe('useEnrichedDrillDownData', () => {
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
            getHumanAndBotAgentsJSMock.mockReturnValue(agents)
            useMetricPerDimensionWithEnrichmentMock.mockReturnValue({
                data: { allData: rowData } as unknown as any,
                isFetching: false,
                isError: false,
            })
        })

        it('should return formatted Data', () => {
            const { result } = renderHook(
                () =>
                    useEnrichedDrillDownData(
                        getDrillDownQuery(metricData),
                        metricData,
                        defaultEnrichmentFields,
                        formatTicketDrillDownRowData,
                        EnrichmentFields.TicketId,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(initialState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current).toEqual({
                isFetching: false,
                perPage: DRILL_DOWN_PER_PAGE,
                currentPage: 1,
                pagesCount: Math.ceil(rowData.length / DRILL_DOWN_PER_PAGE),
                totalResults: rowData.length,
                onPageChange: expect.any(Function),
                data: rowData.map((row) =>
                    formatTicketDrillDownRowData({
                        row,
                        metricField: metricDimension,
                        agents,
                        ticketIdField,
                    }),
                ),
            })
        })

        it('should return formatted Data when stats filters have logical operators', () => {
            const state = {
                ui: {
                    stats: {
                        drillDown: {
                            ...initialState.ui.stats.drillDown,
                        },
                    },
                },
            } as RootState
            const { result } = renderHook(
                () =>
                    useEnrichedDrillDownData(
                        getDrillDownQuery(metricData),
                        metricData,
                        defaultEnrichmentFields,
                        formatTicketDrillDownRowData,
                        EnrichmentFields.TicketId,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(state)}>{children}</Provider>
                    ),
                },
            )

            expect(result.current).toEqual({
                isFetching: false,
                perPage: DRILL_DOWN_PER_PAGE,
                currentPage: 1,
                pagesCount: Math.ceil(rowData.length / DRILL_DOWN_PER_PAGE),
                totalResults: rowData.length,
                onPageChange: expect.any(Function),
                data: rowData.map((row) =>
                    formatTicketDrillDownRowData({
                        row,
                        metricField: metricDimension,
                        agents,
                        ticketIdField,
                    }),
                ),
            })
        })

        it('should return empty array when no data', () => {
            useMetricPerDimensionWithEnrichmentMock.mockReturnValue({
                data: null,
                isFetching: false,
                isError: false,
            })

            const { result } = renderHook(
                () =>
                    useEnrichedDrillDownData(
                        getDrillDownQuery(metricData),
                        metricData,
                        defaultEnrichmentFields,
                        formatTicketDrillDownRowData,
                        EnrichmentFields.TicketId,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(initialState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current).toEqual({
                isFetching: false,
                perPage: DRILL_DOWN_PER_PAGE,
                currentPage: 1,
                pagesCount: 0,
                totalResults: 0,
                onPageChange: expect.any(Function),
                data: [],
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
                ticketTimeReference: TicketTimeReference.TaggedAt,
            }
            const enrichmentIdField = EnrichmentFields.TicketId

            renderHook(
                () =>
                    useEnrichedDrillDownData(
                        getDrillDownQuery(metricData),
                        metricData,
                        defaultEnrichmentFields,
                        formatTicketDrillDownRowData,
                        enrichmentIdField,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(initialState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(
                useMetricPerDimensionWithEnrichmentMock,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    filters: expect.arrayContaining([
                        expect.objectContaining({
                            member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
                            operator: ReportingFilterOperator.InDateRange,
                            values: [start_datetime, end_datetime],
                        }),
                    ]),
                }),
                defaultEnrichmentFields,
                'Ticket.id',
            )
        })

        it('should apply default period filters for CustomField Metrics', () => {
            const metricData: DrillDownMetric = {
                metricName: TicketFieldsMetric.TicketCustomFieldsTicketCount,
                customFieldId: 123,
                customFieldValue: [],
                ticketTimeReference: TicketTimeReference.TaggedAt,
            }
            const enrichmentIdField = EnrichmentFields.TicketId

            renderHook(
                () =>
                    useEnrichedDrillDownData(
                        getDrillDownQuery(metricData),
                        metricData,
                        defaultEnrichmentFields,
                        formatTicketDrillDownRowData,
                        enrichmentIdField,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(initialState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(
                useMetricPerDimensionWithEnrichmentMock,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    filters: expect.arrayContaining([
                        expect.objectContaining({
                            member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
                            operator: ReportingFilterOperator.InDateRange,
                            values: [periodStart, periodEnd],
                        }),
                    ]),
                }),
                defaultEnrichmentFields,
                'Ticket.id',
            )
        })

        it('should sort ascending CSAT metrics', () => {
            const metricData: DrillDownMetric = {
                metricName: OverviewMetric.CustomerSatisfaction,
            }
            const enrichmentIdField = EnrichmentFields.TicketId

            renderHook(
                () =>
                    useEnrichedDrillDownData(
                        getDrillDownQuery(metricData),
                        metricData,
                        defaultEnrichmentFields,
                        formatTicketDrillDownRowData,
                        enrichmentIdField,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(initialState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(
                useMetricPerDimensionWithEnrichmentMock,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    order: [
                        [
                            TicketSatisfactionSurveyDimension.SurveyScore,
                            OrderDirection.Asc,
                        ],
                    ],
                }),
                defaultEnrichmentFields,
                'Ticket.id',
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
            const enrichmentIdField = EnrichmentFields.TicketId

            const { result } = renderHook(
                () =>
                    useEnrichedDrillDownData(
                        getDrillDownQuery(metricData),
                        metricData,
                        defaultEnrichmentFields,
                        formatTicketDrillDownRowData,
                        enrichmentIdField,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(initialState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

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
                }),
            )
        })

        it('should return null when assignee missing', () => {
            useMetricPerDimensionWithEnrichmentMock.mockReturnValue({
                data: {
                    allData: [
                        {
                            ...exampleRow,
                            [EnrichmentFields.AssigneeId]: undefined,
                        },
                    ],
                } as unknown as any,
                isFetching: false,
                isError: false,
            })

            const { result } = renderHook(
                () =>
                    useEnrichedDrillDownData(
                        getDrillDownQuery(metricData),
                        metricData,
                        defaultEnrichmentFields,
                        formatTicketDrillDownRowData,
                        EnrichmentFields.TicketId,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(initialState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current.data).toContainEqual(
                expect.objectContaining({ assignee: null }),
            )
        })

        it('should switch to next page of data', () => {
            useMetricPerDimensionWithEnrichmentMock.mockReturnValue({
                data: {
                    allData: new Array(DRILL_DOWN_PER_PAGE + 1).fill(
                        exampleRow,
                    ),
                } as unknown as any,
                isFetching: false,
                isError: false,
            })

            const { result } = renderHook(
                () =>
                    useEnrichedDrillDownData(
                        getDrillDownQuery(metricData),
                        metricData,
                        defaultEnrichmentFields,
                        formatTicketDrillDownRowData,
                        EnrichmentFields.TicketId,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(initialState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            act(() => {
                result.current.onPageChange(2)
            })

            expect(dispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'drillDown/setCurrentPage',
                    payload: 2,
                }),
            )
        })

        it('should merge SLA metrics into one entry per ticket', () => {
            const metricName = SlaMetric.AchievementRate
            const FRTMetricName = 'FRT'
            const RTMetricName = 'RT'
            const FRTData = {
                [TicketDimension.TicketId]: '448211952',
                [TicketSLADimension.TicketId]: '448211952',
                [TicketSLADimension.SlaStatus]: 'BREACHED',
                [TicketSLADimension.SlaPolicyMetricName]: FRTMetricName,
                [TicketSLADimension.SlaPolicyMetricStatus]: 'BREACHED',
                [TicketSLADimension.SlaDelta]: null,
                [TicketSLADimension.SlaAnchorDatetime]:
                    '2024-05-30T00:00:00.000',
                [TicketSLAMeasure.TicketCount]: '1',
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

            const RTData = {
                [TicketDimension.TicketId]: '448211952',
                [TicketSLADimension.TicketId]: '448211952',
                [TicketSLADimension.SlaStatus]: 'BREACHED',
                [TicketSLADimension.SlaPolicyMetricName]: RTMetricName,
                [TicketSLADimension.SlaPolicyMetricStatus]: 'BREACHED',
                [TicketSLADimension.SlaDelta]: null,
                [TicketSLADimension.SlaAnchorDatetime]:
                    '2024-05-30T00:00:00.000',
                [TicketSLAMeasure.TicketCount]: '1',
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

            useMetricPerDimensionWithEnrichmentMock.mockReturnValue({
                data: {
                    allData: [FRTData, RTData],
                } as unknown as any,
                isFetching: false,
                isError: false,
            })
            const metricData: DrillDownMetric = {
                metricName: metricName,
            }

            const { result } = renderHook(
                () =>
                    useEnrichedDrillDownData(
                        getDrillDownQuery(metricData),
                        metricData,
                        defaultEnrichmentFields,
                        formatTicketDrillDownRowData,
                        EnrichmentFields.TicketId,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(initialState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current.data).toContainEqual(
                expect.objectContaining({
                    slas: expect.objectContaining({
                        [FRTMetricName]: expect.objectContaining(FRTData),
                        [RTMetricName]: expect.objectContaining(RTData),
                    }),
                }),
            )
        })
    })

    describe('useEnrichedDrillDownDataUnpaginated', () => {
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
            getHumanAndBotAgentsJSMock.mockReturnValue(agents)
            useMetricPerDimensionWithEnrichmentMock.mockReturnValue({
                data: { allData: rowData } as unknown as any,
                isFetching: false,
                isError: false,
            })
        })

        it('should return formatted data without pagination', () => {
            const { result } = renderHook(
                () =>
                    useEnrichedDrillDownDataUnpaginated(
                        getDrillDownQuery(metricData),
                        metricData,
                        defaultEnrichmentFields,
                        formatTicketDrillDownRowData,
                        EnrichmentFields.TicketId,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(initialState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current).toEqual({
                isFetching: false,
                totalResults: rowData.length,
                data: rowData.map((row) =>
                    formatTicketDrillDownRowData({
                        row,
                        metricField: metricDimension,
                        agents,
                        ticketIdField,
                    }),
                ),
            })
        })

        it('should return empty data when no results', () => {
            useMetricPerDimensionWithEnrichmentMock.mockReturnValue({
                data: { allData: [], value: null } as unknown as any,
                isFetching: false,
                isError: false,
            })

            const { result } = renderHook(
                () =>
                    useEnrichedDrillDownDataUnpaginated(
                        getDrillDownQuery(metricData),
                        metricData,
                        defaultEnrichmentFields,
                        formatTicketDrillDownRowData,
                        EnrichmentFields.TicketId,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(initialState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current.data).toEqual([])
            expect(result.current.totalResults).toBe(0)
        })

        it('should handle loading state correctly', () => {
            useMetricPerDimensionWithEnrichmentMock.mockReturnValue({
                data: null,
                isFetching: true,
                isError: false,
            })

            const { result } = renderHook(
                () =>
                    useEnrichedDrillDownDataUnpaginated(
                        getDrillDownQuery(metricData),
                        metricData,
                        defaultEnrichmentFields,
                        formatTicketDrillDownRowData,
                        EnrichmentFields.TicketId,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(initialState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current.isFetching).toBe(true)
            expect(result.current.data).toEqual([])
        })

        it('should handle multiple tickets correctly', () => {
            const multipleRowData = [
                exampleRow,
                {
                    ...exampleRow,
                    [TicketDimension.TicketId]: '888',
                    [EnrichmentFields.TicketName]: 'Another Ticket',
                },
                {
                    ...exampleRow,
                    [TicketDimension.TicketId]: '999',
                    [EnrichmentFields.TicketName]: 'Third Ticket',
                },
            ]

            useMetricPerDimensionWithEnrichmentMock.mockReturnValue({
                data: {
                    allData: multipleRowData,
                    value: null,
                } as unknown as any,
                isFetching: false,
                isError: false,
            })

            const { result } = renderHook(
                () =>
                    useEnrichedDrillDownDataUnpaginated(
                        getDrillDownQuery(metricData),
                        metricData,
                        defaultEnrichmentFields,
                        formatTicketDrillDownRowData,
                        EnrichmentFields.TicketId,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(initialState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current.data).toHaveLength(3)
            expect(result.current.totalResults).toBe(3)
        })

        it('should merge SLA metrics into one entry per ticket', () => {
            const metricName = SlaMetric.AchievementRate
            const FRTMetricName = 'FRT'
            const RTMetricName = 'RT'
            const FRTData = {
                [TicketDimension.TicketId]: '448211952',
                [TicketSLADimension.TicketId]: '448211952',
                [TicketSLADimension.SlaStatus]: 'BREACHED',
                [TicketSLADimension.SlaPolicyMetricName]: FRTMetricName,
                [TicketSLADimension.SlaPolicyMetricStatus]: 'BREACHED',
                [TicketSLADimension.SlaDelta]: null,
                [TicketSLADimension.SlaAnchorDatetime]:
                    '2024-05-30T00:00:00.000',
                [TicketSLAMeasure.TicketCount]: '1',
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

            const RTData = {
                [TicketDimension.TicketId]: '448211952',
                [TicketSLADimension.TicketId]: '448211952',
                [TicketSLADimension.SlaStatus]: 'BREACHED',
                [TicketSLADimension.SlaPolicyMetricName]: RTMetricName,
                [TicketSLADimension.SlaPolicyMetricStatus]: 'BREACHED',
                [TicketSLADimension.SlaDelta]: null,
                [TicketSLADimension.SlaAnchorDatetime]:
                    '2024-05-30T00:00:00.000',
                [TicketSLAMeasure.TicketCount]: '1',
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

            useMetricPerDimensionWithEnrichmentMock.mockReturnValue({
                data: {
                    allData: [FRTData, RTData],
                } as unknown as any,
                isFetching: false,
                isError: false,
            })
            const slaMetricData: DrillDownMetric = {
                metricName: metricName,
            }

            const { result } = renderHook(
                () =>
                    useEnrichedDrillDownDataUnpaginated(
                        getDrillDownQuery(slaMetricData),
                        slaMetricData,
                        defaultEnrichmentFields,
                        formatTicketDrillDownRowData,
                        EnrichmentFields.TicketId,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(initialState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current.data).toHaveLength(1)
            expect(result.current.data).toContainEqual(
                expect.objectContaining({
                    slas: expect.objectContaining({
                        [FRTMetricName]: expect.objectContaining(FRTData),
                        [RTMetricName]: expect.objectContaining(RTData),
                    }),
                }),
            )
        })

        it('should filter data by intent for CSAT drilldown', () => {
            const ticketWithMatchingIntent = {
                [TicketDimension.TicketId]: '123',
                [EnrichmentFields.CustomFields]: {
                    100: 'order_status::checking',
                },
                [EnrichmentFields.TicketName]: 'Matching Ticket',
            }

            const ticketWithoutMatchingIntent = {
                [TicketDimension.TicketId]: '456',
                [EnrichmentFields.CustomFields]: {
                    100: 'shipping::tracking',
                },
                [EnrichmentFields.TicketName]: 'Non-Matching Ticket',
            }

            useMetricPerDimensionWithEnrichmentMock.mockReturnValue({
                data: {
                    allData: [
                        ticketWithMatchingIntent,
                        ticketWithoutMatchingIntent,
                    ],
                    value: null,
                } as unknown as any,
                isFetching: false,
                isError: false,
            })

            const csatMetricData: DrillDownMetric = {
                metricName:
                    AIInsightsMetric.TicketDrillDownPerCustomerSatisfaction,
                intentFieldId: 100,
                intentFieldValues: ['order_status'],
            } as DrillDownMetric

            const { result } = renderHook(
                () =>
                    useEnrichedDrillDownDataUnpaginated(
                        getDrillDownQuery(csatMetricData),
                        csatMetricData,
                        [
                            ...defaultEnrichmentFields,
                            EnrichmentFields.CustomFields,
                        ],
                        formatTicketDrillDownRowData,
                        EnrichmentFields.TicketId,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(initialState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current.data).toHaveLength(1)
            expect(result.current.totalResults).toBe(1)
        })

        it('should use measure when second dimension is not available', () => {
            useMetricPerDimensionWithEnrichmentMock.mockReturnValue({
                data: { allData: rowData, value: null } as unknown as any,
                isFetching: false,
                isError: false,
            })

            const { result } = renderHook(
                () =>
                    useEnrichedDrillDownDataUnpaginated(
                        getDrillDownQuery(metricData),
                        metricData,
                        defaultEnrichmentFields,
                        formatTicketDrillDownRowData,
                        EnrichmentFields.TicketId,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(initialState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current.data).toHaveLength(1)
        })

        it('should handle null data gracefully', () => {
            useMetricPerDimensionWithEnrichmentMock.mockReturnValue({
                data: null,
                isFetching: false,
                isError: false,
            })

            const { result } = renderHook(
                () =>
                    useEnrichedDrillDownDataUnpaginated(
                        getDrillDownQuery(metricData),
                        metricData,
                        defaultEnrichmentFields,
                        formatTicketDrillDownRowData,
                        EnrichmentFields.TicketId,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(initialState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current.data).toEqual([])
            expect(result.current.totalResults).toBe(0)
        })
    })

    describe('useDrillDownData', () => {
        const metricDimension = OrderConversionDimension.orderId
        const idField = OrderConversionDimension.customerId
        const campaignId = '14a8cca6-057f-4e2f-a588-ad435ecbe195'
        const exampleRow = {
            [idField]: '1323',
            [OrderConversionDimension.orderId]: 12,
            [OrderConversionDimension.orderAmount]: '777',
            [OrderConversionDimension.orderCurrency]: 'USD',
            [OrderConversionDimension.orderProductIds]: ['prodId1', 'prodId2'],
            [OrderConversionDimension.campaignId]: campaignId,
            [OrderConversionDimension.createdDatatime]:
                '2023-04-07T00:00:00.000',
        }
        const rowData = [exampleRow]
        const metricData: DrillDownMetric = {
            metricName: ConvertMetric.CampaignSalesCount,
            campaignsOperator: LogicalOperatorEnum.ONE_OF,
            shopName: 'shopify:shopName',
            selectedCampaignIds: [],
            context: {
                channel_connection_external_ids: [],
            },
        }

        beforeEach(() => {
            useMetricPerDimensionMock.mockReturnValue({
                data: { allData: rowData } as unknown as any,
                isFetching: false,
                isError: false,
            })
        })

        it('should return formatted Data', () => {
            const { result } = renderHook(
                () =>
                    useDrillDownData(
                        getDrillDownQuery(metricData),
                        metricData,
                        formatConvertCampaignSalesDrillDownRowData,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(initialState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current).toEqual({
                isFetching: false,
                perPage: DRILL_DOWN_PER_PAGE,
                currentPage: 1,
                pagesCount: Math.ceil(rowData.length / DRILL_DOWN_PER_PAGE),
                totalResults: rowData.length,
                onPageChange: expect.any(Function),
                data: rowData.map((row) =>
                    formatConvertCampaignSalesDrillDownRowData({
                        row,
                        metricField: metricDimension,
                    }),
                ),
            })
        })

        it('should return formatted Data with measure instead of dimension', () => {
            const query = getDrillDownQuery(metricData)(
                statsFilters,
                userTimezone,
                getDrillDownMetricOrder(metricData.metricName),
            )
            const { result } = renderHook(
                () =>
                    useDrillDownData(
                        getDrillDownQuery(metricData),
                        {
                            metricName: OverviewMetric.MessagesSent,
                        },
                        formatTicketDrillDownRowData,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(initialState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current).toEqual({
                isFetching: false,
                perPage: DRILL_DOWN_PER_PAGE,
                currentPage: 1,
                pagesCount: Math.ceil(rowData.length / DRILL_DOWN_PER_PAGE),
                totalResults: rowData.length,
                onPageChange: expect.any(Function),
                data: rowData.map((row) =>
                    formatTicketDrillDownRowData({
                        row,
                        metricField: query.dimensions[1] ?? query.measures[0],
                        agents,
                        ticketIdField: TicketDimension.TicketId,
                    }),
                ),
            })
        })

        it('should return empty array when no data', () => {
            useMetricPerDimensionMock.mockReturnValue({
                data: null,
                isFetching: false,
                isError: false,
            })

            const { result } = renderHook(
                () =>
                    useDrillDownData(
                        getDrillDownQuery(metricData),
                        metricData,
                        formatConvertCampaignSalesDrillDownRowData,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(initialState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current).toEqual({
                isFetching: false,
                perPage: DRILL_DOWN_PER_PAGE,
                currentPage: 1,
                pagesCount: 0,
                totalResults: 0,
                onPageChange: expect.any(Function),
                data: [],
            })
        })

        it('should switch to next page of data', () => {
            useMetricPerDimensionMock.mockReturnValue({
                data: {
                    allData: new Array(DRILL_DOWN_PER_PAGE + 1).fill(
                        exampleRow,
                    ),
                } as unknown as any,
                isFetching: false,
                isError: false,
            })

            const { result } = renderHook(
                () =>
                    useDrillDownData(
                        getDrillDownQuery(metricData),
                        metricData,
                        formatConvertCampaignSalesDrillDownRowData,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(initialState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            act(() => {
                result.current.onPageChange(2)
            })

            expect(dispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'drillDown/setCurrentPage',
                    payload: 2,
                }),
            )
        })
    })

    describe('useDrillDownDataV2', () => {
        const metricDimension = VoiceCallDimension.CallSlaStatus
        const idField = VoiceCallDimension.CreatedAt
        const exampleRow = {
            [idField]: '1323',
            [VoiceCallDimension.CustomerId]: 12,
            [VoiceCallDimension.Duration]: '777',
            [VoiceCallDimension.CallSlaStatus]: 'breached',
        }
        const rowData = [exampleRow]
        const metricData: DrillDownMetric = {
            metricName: VoiceMetric.VoiceCallsBreachedRate,
            title: 'Breached calls',
        }

        beforeEach(() => {
            useMetricPerDimensionV2Mock.mockReturnValue({
                data: { allData: rowData } as unknown as any,
                isFetching: false,
                isError: false,
            })
        })

        it('should return formatted Data', () => {
            const { result } = renderHook(
                () =>
                    useDrillDownDataV2(
                        getDrillDownQuery(metricData),
                        getDrillDownQueryV2(metricData),
                        metricData,
                        formatVoiceDrillDownRowData,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(initialState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current).toEqual({
                isFetching: false,
                perPage: DRILL_DOWN_PER_PAGE,
                currentPage: 1,
                pagesCount: Math.ceil(rowData.length / DRILL_DOWN_PER_PAGE),
                totalResults: rowData.length,
                onPageChange: expect.any(Function),
                data: rowData.map((row) =>
                    formatVoiceDrillDownRowData({
                        row,
                        metricField: metricDimension,
                    }),
                ),
            })
        })

        it('should work for no V2 query', () => {
            const { result } = renderHook(
                () =>
                    useDrillDownDataV2(
                        getDrillDownQuery(metricData),
                        undefined,
                        metricData,
                        formatVoiceDrillDownRowData,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(initialState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current).toEqual({
                isFetching: false,
                perPage: DRILL_DOWN_PER_PAGE,
                currentPage: 1,
                pagesCount: Math.ceil(rowData.length / DRILL_DOWN_PER_PAGE),
                totalResults: rowData.length,
                onPageChange: expect.any(Function),
                data: rowData.map((row) =>
                    formatVoiceDrillDownRowData({
                        row,
                        metricField: metricDimension,
                    }),
                ),
            })
        })

        it('should return empty array when no data', () => {
            useMetricPerDimensionV2Mock.mockReturnValue({
                data: null,
                isFetching: false,
                isError: false,
            })

            const { result } = renderHook(
                () =>
                    useDrillDownDataV2(
                        getDrillDownQuery(metricData),
                        getDrillDownQueryV2(metricData),
                        metricData,
                        formatVoiceDrillDownRowData,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(initialState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current).toEqual({
                isFetching: false,
                perPage: DRILL_DOWN_PER_PAGE,
                currentPage: 1,
                pagesCount: 0,
                totalResults: 0,
                onPageChange: expect.any(Function),
                data: [],
            })
        })

        it('should switch to next page of data', () => {
            useMetricPerDimensionV2Mock.mockReturnValue({
                data: {
                    allData: new Array(DRILL_DOWN_PER_PAGE + 1).fill(
                        exampleRow,
                    ),
                } as unknown as any,
                isFetching: false,
                isError: false,
            })

            const { result } = renderHook(
                () =>
                    useDrillDownDataV2(
                        getDrillDownQuery(metricData),
                        getDrillDownQueryV2(metricData),
                        metricData,
                        formatVoiceDrillDownRowData,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(initialState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            act(() => {
                result.current.onPageChange(2)
            })

            expect(dispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'drillDown/setCurrentPage',
                    payload: 2,
                }),
            )
        })
    })

    describe('filterCSATDataBasedOnIntent', () => {
        it('should filter data based on intent field values', () => {
            const metricData: DrillDownMetric = {
                metricName:
                    AIInsightsMetric.TicketDrillDownPerCustomerSatisfaction,
                intentFieldValues: ['value1', 'value2'],
                intentFieldId: 1,
            } as unknown as DrillDownMetric

            const data = [
                {
                    [EnrichmentFields.CustomFields]: {
                        1: 'value1',
                    },
                },
                {
                    [EnrichmentFields.CustomFields]: {
                        1: 'otherValue',
                    },
                },
            ]

            const result = filterCSATDataBasedOnIntent(metricData, data)
            expect(result).toEqual([data[0]])
        })

        it('should return the original data if no intent field values are provided', () => {
            const metricData: DrillDownMetric = {
                metricName:
                    AIInsightsMetric.TicketDrillDownPerCustomerSatisfaction,
                intentFieldValues: [],
                intentFieldId: 1,
            } as unknown as DrillDownMetric

            const data = [
                {
                    [EnrichmentFields.CustomFields]: {
                        1: 'value1',
                    },
                },
                {
                    [EnrichmentFields.CustomFields]: {
                        1: 'otherValue',
                    },
                },
            ]

            const result = filterCSATDataBasedOnIntent(metricData, data)
            expect(result).toEqual(data)
        })
        it('should return false when fieldValue is not a string', () => {
            const metricData = {
                metricName:
                    AIInsightsMetric.TicketDrillDownPerCustomerSatisfaction,
                intentFieldId: 1,
                intentFieldValues: ['value1'],
            } as unknown as DrillDownMetric

            const data = [
                {
                    [EnrichmentFields.CustomFields]: { intent1: 123 }, // not a string
                },
            ]

            const result = filterCSATDataBasedOnIntent(metricData, data)
            expect(result).toEqual([])
        })
    })
})
