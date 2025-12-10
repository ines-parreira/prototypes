import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import moment from 'moment'
import { Provider } from 'react-redux'

import { METRIC_NAMES } from '../../../../hooks/metricNames'
import { useMetric } from '../../../../hooks/useMetric'
import { useMetricPerDimensionV2 } from '../../../../hooks/useMetricPerDimension'
import { LogicalOperatorEnum } from '../../../../pages/common/components/Filter/constants'
import { FilterKey, type StatsFilters } from '../../../stat/types'
import {
    createV1Query,
    parseIntentsData,
    useResourceMetrics,
} from '../resourceMetrics'

jest.mock('../../../../hooks/useMetric')
jest.mock('../../../../hooks/useMetricPerDimension')
jest.mock(
    '../../../../../../pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
    () => ({
        useGetCustomTicketsFieldsDefinitionData: jest.fn(() => ({
            outcomeCustomFieldId: 123,
            intentCustomFieldId: 456,
        })),
    }),
)
jest.mock('../../../../../../hooks/useAppSelector', () =>
    jest.fn(() => 'America/New_York'),
)

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
})

const mockStore = {
    getState: () => ({
        currentUser: {
            data: {
                timezone: 'America/New_York',
            },
        },
    }),
    subscribe: jest.fn(),
    dispatch: jest.fn(),
}

const wrapper = ({ children }: any) => (
    <Provider store={mockStore as any}>
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    </Provider>
)

describe('createV1Query', () => {
    const periodStart = moment()
    const periodEnd = periodStart.clone().add(7, 'days')
    const resourceSourceId = 123
    const resourceSourceSetId = 456
    const timezone = 'America/New_York'

    const baseStatsFilters: StatsFilters = {
        [FilterKey.Period]: {
            start_datetime: periodStart.toISOString(),
            end_datetime: periodEnd.toISOString(),
        },
    }

    describe('base query structure', () => {
        it('should produce query with base filters', () => {
            const query = createV1Query(
                METRIC_NAMES.KNOWLEDGE_TICKETS,
                resourceSourceId,
                resourceSourceSetId,
                baseStatsFilters,
                timezone,
                'TicketInsightsTaskV3.ticketCount',
            )

            expect(query).toMatchObject({
                metricName: METRIC_NAMES.KNOWLEDGE_TICKETS,
                measures: ['TicketInsightsTaskV3.ticketCount'],
                timezone,
            })

            expect(query.filters).toContainEqual({
                member: 'TicketInsightsTaskV3.resourceSourceId',
                operator: 'equals',
                values: [String(resourceSourceId)],
            })
            expect(query.filters).toContainEqual({
                member: 'TicketInsightsTaskV3.resourceSourceSetId',
                operator: 'equals',
                values: [String(resourceSourceSetId)],
            })
            expect(query.filters).toContainEqual({
                member: 'TicketEnrichedV3.isTrashed',
                operator: 'equals',
                values: ['0'],
            })
            expect(query.filters).toContainEqual({
                member: 'TicketEnrichedV3.isSpam',
                operator: 'equals',
                values: ['0'],
            })
        })

        it('should include period filters', () => {
            const query = createV1Query(
                METRIC_NAMES.KNOWLEDGE_TICKETS,
                resourceSourceId,
                resourceSourceSetId,
                baseStatsFilters,
                timezone,
                'TicketInsightsTaskV3.ticketCount',
            )

            expect(query.filters).toContainEqual({
                member: 'TicketEnrichedV3.periodStart',
                operator: 'afterDate',
                values: [baseStatsFilters.period.start_datetime],
            })
            expect(query.filters).toContainEqual({
                member: 'TicketEnrichedV3.periodEnd',
                operator: 'beforeDate',
                values: [baseStatsFilters.period.end_datetime],
            })
        })

        it('should include time dimensions', () => {
            const query = createV1Query(
                METRIC_NAMES.KNOWLEDGE_TICKETS,
                resourceSourceId,
                resourceSourceSetId,
                baseStatsFilters,
                timezone,
                'TicketInsightsTaskV3.ticketCount',
            )

            expect(query.timeDimensions).toEqual([
                {
                    dimension: 'TicketEnrichedV3.createdDatetime',
                    dateRange: [
                        baseStatsFilters.period.start_datetime,
                        baseStatsFilters.period.end_datetime,
                    ],
                },
            ])
        })
    })

    describe('dimensions override', () => {
        it('should use standard dimensions for non-intents metrics', () => {
            const query = createV1Query(
                METRIC_NAMES.KNOWLEDGE_TICKETS,
                resourceSourceId,
                resourceSourceSetId,
                baseStatsFilters,
                timezone,
                'TicketInsightsTaskV3.ticketCount',
            )

            expect(query.dimensions).toEqual([
                'TicketInsightsTaskV3.resourceType',
                'TicketInsightsTaskV3.resourceSourceId',
                'TicketInsightsTaskV3.resourceSourceSetId',
            ])
        })

        it('should use extended dimensions for intents metrics', () => {
            const query = createV1Query(
                METRIC_NAMES.KNOWLEDGE_INTENTS,
                resourceSourceId,
                resourceSourceSetId,
                baseStatsFilters,
                timezone,
                'TicketInsightsTaskV3.ticketCount',
            )

            expect(query.dimensions).toEqual([
                'TicketCustomFieldsEnrichedV3.top2LevelsValue',
                'TicketInsightsTaskV3.resourceType',
                'TicketInsightsTaskV3.resourceSourceId',
                'TicketInsightsTaskV3.resourceSourceSetId',
            ])
        })
    })

    describe('custom field filters', () => {
        it('should add custom field filters when present', () => {
            const customFieldId = 789
            const filtersWithCustomField: StatsFilters = {
                ...baseStatsFilters,
                [FilterKey.CustomFields]: [
                    {
                        customFieldId,
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['Value1', 'Value2'],
                    },
                ],
            }

            const query = createV1Query(
                METRIC_NAMES.KNOWLEDGE_HANDOVER_TICKETS,
                resourceSourceId,
                resourceSourceSetId,
                filtersWithCustomField,
                timezone,
                'TicketInsightsTaskV3.ticketCount',
            )

            expect(query.filters).toContainEqual({
                member: 'TicketCustomFieldsEnrichedV3.customFieldId',
                operator: 'equals',
                values: [String(customFieldId)],
            })
            expect(query.filters).toContainEqual({
                member: 'TicketCustomFieldsEnrichedV3.valueString',
                operator: 'equals',
                values: ['Value1', 'Value2'],
            })
        })

        it('should use notEquals operator for NOT_ONE_OF', () => {
            const customFieldId = 789
            const filtersWithCustomField: StatsFilters = {
                ...baseStatsFilters,
                [FilterKey.CustomFields]: [
                    {
                        customFieldId,
                        operator: LogicalOperatorEnum.NOT_ONE_OF,
                        values: ['Spam', 'NoReply'],
                    },
                ],
            }

            const query = createV1Query(
                METRIC_NAMES.KNOWLEDGE_INTENTS,
                resourceSourceId,
                resourceSourceSetId,
                filtersWithCustomField,
                timezone,
                'TicketInsightsTaskV3.ticketCount',
            )

            expect(query.filters).toContainEqual({
                member: 'TicketCustomFieldsEnrichedV3.valueString',
                operator: 'notEquals',
                values: ['Spam', 'NoReply'],
            })
        })

        it('should handle multiple custom field filters', () => {
            const filtersWithMultipleCustomFields: StatsFilters = {
                ...baseStatsFilters,
                [FilterKey.CustomFields]: [
                    {
                        customFieldId: 111,
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['ValueA'],
                    },
                    {
                        customFieldId: 222,
                        operator: LogicalOperatorEnum.NOT_ONE_OF,
                        values: ['ValueB'],
                    },
                ],
            }

            const query = createV1Query(
                METRIC_NAMES.KNOWLEDGE_CSAT,
                resourceSourceId,
                resourceSourceSetId,
                filtersWithMultipleCustomFields,
                timezone,
                'TicketInsightsTaskV3.avgSurveyScore',
            )

            expect(query.filters).toContainEqual({
                member: 'TicketCustomFieldsEnrichedV3.customFieldId',
                operator: 'equals',
                values: ['111'],
            })
            expect(query.filters).toContainEqual({
                member: 'TicketCustomFieldsEnrichedV3.valueString',
                operator: 'equals',
                values: ['ValueA'],
            })

            expect(query.filters).toContainEqual({
                member: 'TicketCustomFieldsEnrichedV3.customFieldId',
                operator: 'equals',
                values: ['222'],
            })
            expect(query.filters).toContainEqual({
                member: 'TicketCustomFieldsEnrichedV3.valueString',
                operator: 'notEquals',
                values: ['ValueB'],
            })
        })

        it('should not add custom field filters when absent', () => {
            const query = createV1Query(
                METRIC_NAMES.KNOWLEDGE_TICKETS,
                resourceSourceId,
                resourceSourceSetId,
                baseStatsFilters,
                timezone,
                'TicketInsightsTaskV3.ticketCount',
            )

            const customFieldFilters = query.filters.filter(
                (f: any) =>
                    f.member === 'TicketCustomFieldsEnrichedV3.customFieldId' ||
                    f.member === 'TicketCustomFieldsEnrichedV3.valueString',
            )

            expect(customFieldFilters).toHaveLength(0)
        })
    })

    describe('different metric types', () => {
        it('should handle ticket count metric', () => {
            const query = createV1Query(
                METRIC_NAMES.KNOWLEDGE_TICKETS,
                resourceSourceId,
                resourceSourceSetId,
                baseStatsFilters,
                timezone,
                'TicketInsightsTaskV3.ticketCount',
            )

            expect(query.metricName).toBe(METRIC_NAMES.KNOWLEDGE_TICKETS)
            expect(query.measures).toEqual(['TicketInsightsTaskV3.ticketCount'])
        })

        it('should handle handover tickets metric', () => {
            const query = createV1Query(
                METRIC_NAMES.KNOWLEDGE_HANDOVER_TICKETS,
                resourceSourceId,
                resourceSourceSetId,
                baseStatsFilters,
                timezone,
                'TicketInsightsTaskV3.ticketCount',
            )

            expect(query.metricName).toBe(
                METRIC_NAMES.KNOWLEDGE_HANDOVER_TICKETS,
            )
            expect(query.measures).toEqual(['TicketInsightsTaskV3.ticketCount'])
        })

        it('should handle CSAT metric', () => {
            const query = createV1Query(
                METRIC_NAMES.KNOWLEDGE_CSAT,
                resourceSourceId,
                resourceSourceSetId,
                baseStatsFilters,
                timezone,
                'TicketInsightsTaskV3.avgSurveyScore',
            )

            expect(query.metricName).toBe(METRIC_NAMES.KNOWLEDGE_CSAT)
            expect(query.measures).toEqual([
                'TicketInsightsTaskV3.avgSurveyScore',
            ])
        })

        it('should handle intents metric', () => {
            const query = createV1Query(
                METRIC_NAMES.KNOWLEDGE_INTENTS,
                resourceSourceId,
                resourceSourceSetId,
                baseStatsFilters,
                timezone,
                'TicketInsightsTaskV3.ticketCount',
            )

            expect(query.metricName).toBe(METRIC_NAMES.KNOWLEDGE_INTENTS)
            expect(query.measures).toEqual(['TicketInsightsTaskV3.ticketCount'])
        })
    })
})

describe('parseIntentsData', () => {
    describe('sorting by ticket count', () => {
        it('should sort intents by ticket count descending', () => {
            const mockData = [
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Billing::Payment',
                    'TicketInsightsTaskV3.ticketCount': '5',
                },
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Support::Technical',
                    'TicketInsightsTaskV3.ticketCount': '15',
                },
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Shipping::Delay',
                    'TicketInsightsTaskV3.ticketCount': '10',
                },
            ]

            const result = parseIntentsData(mockData, false)

            expect(result).toEqual([
                'Support::Technical',
                'Shipping::Delay',
                'Billing::Payment',
            ])
        })

        it('should handle missing or invalid ticket counts', () => {
            const mockData = [
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Valid::Intent',
                    'TicketInsightsTaskV3.ticketCount': '10',
                },
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Missing::Count',
                },
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Invalid::Count',
                    'TicketInsightsTaskV3.ticketCount': 'not-a-number',
                },
            ]

            const result = parseIntentsData(mockData, false)

            expect(result?.[0]).toBe('Valid::Intent')
        })
    })

    describe('filtering', () => {
        it('should filter out empty string intents', () => {
            const mockData = [
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue': '',
                    'TicketInsightsTaskV3.ticketCount': '10',
                },
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Valid::Intent',
                    'TicketInsightsTaskV3.ticketCount': '5',
                },
            ]

            const result = parseIntentsData(mockData, false)

            expect(result).toEqual(['Valid::Intent'])
        })

        it('should filter out null and undefined intents', () => {
            const mockData = [
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue': null,
                    'TicketInsightsTaskV3.ticketCount': '10',
                },
                {
                    'TicketInsightsTaskV3.ticketCount': '8',
                },
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Valid::Intent',
                    'TicketInsightsTaskV3.ticketCount': '5',
                },
            ]

            const result = parseIntentsData(mockData, false)

            expect(result).toEqual(['Valid::Intent'])
        })
    })

    describe('edge cases', () => {
        it('should return undefined when allData is undefined', () => {
            expect(parseIntentsData(undefined, false)).toBeUndefined()
        })

        it('should return undefined when isError is true', () => {
            const mockData = [
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Test::Intent',
                    'TicketInsightsTaskV3.ticketCount': '5',
                },
            ]

            expect(parseIntentsData(mockData, true)).toBeUndefined()
        })

        it('should return empty array when allData is empty', () => {
            expect(parseIntentsData([], false)).toEqual([])
        })
    })

    describe('complete scenarios', () => {
        it('should handle realistic data with sorting, filtering, and transformation', () => {
            const mockData = [
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Order::Status',
                    'TicketInsightsTaskV3.ticketCount': '100',
                },
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue': '',
                    'TicketInsightsTaskV3.ticketCount': '50',
                },
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Shipping::Inquiry',
                    'TicketInsightsTaskV3.ticketCount': '75',
                },
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Returns::Process',
                    'TicketInsightsTaskV3.ticketCount': '60',
                },
            ]

            const result = parseIntentsData(mockData, false)

            expect(result).toEqual([
                'Order::Status',
                'Shipping::Inquiry',
                'Returns::Process',
            ])
        })
    })
})

describe('useResourceMetrics', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
    })

    it('should return loading state when metrics are fetching', () => {
        ;(useMetric as jest.Mock).mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        })
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        })

        const { result } = renderHook(
            () =>
                useResourceMetrics({
                    resourceSourceId: 100,
                    resourceSourceSetId: 200,
                    timezone: 'America/New_York',
                }),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toBeUndefined()
    })

    it('should return error state when any metric has error', () => {
        ;(useMetric as jest.Mock)
            .mockReturnValueOnce({
                isFetching: false,
                isError: true,
                data: undefined,
            })
            .mockReturnValue({
                isFetching: false,
                isError: false,
                data: { value: 10 },
            })
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            isFetching: false,
            isError: false,
            data: { allData: [] },
        })

        const { result } = renderHook(
            () =>
                useResourceMetrics({
                    resourceSourceId: 100,
                    resourceSourceSetId: 200,
                    timezone: 'America/New_York',
                }),
            { wrapper },
        )

        expect(result.current.isError).toBe(true)
        expect(result.current.data).toBeUndefined()
    })

    it('should return data when all metrics are successful', () => {
        ;(useMetric as jest.Mock)
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: { value: 100 },
            })
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: { value: 5 },
            })
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: { value: 4.5 },
            })
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                allData: [
                    {
                        'TicketInsightsTaskV3.ticketCount': '10',
                        'TicketCustomFieldsEnriched.top2LevelsValue':
                            'Intent::A',
                    },
                ],
            },
        })

        const { result } = renderHook(
            () =>
                useResourceMetrics({
                    resourceSourceId: 100,
                    resourceSourceSetId: 200,
                    timezone: 'America/New_York',
                }),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
        expect(result.current.data?.tickets?.value).toBe(100)
        expect(result.current.data?.handoverTickets?.value).toBe(5)
        expect(result.current.data?.csat?.value).toBe(4.5)
        expect(result.current.data?.intents).toEqual(['Intent::A'])
    })

    it('should return null for metrics without values', () => {
        ;(useMetric as jest.Mock).mockReturnValue({
            isFetching: false,
            isError: false,
            data: undefined,
        })
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            isFetching: false,
            isError: false,
            data: { allData: [] },
        })

        const { result } = renderHook(
            () =>
                useResourceMetrics({
                    resourceSourceId: 100,
                    resourceSourceSetId: 200,
                    timezone: 'America/New_York',
                }),
            { wrapper },
        )

        expect(result.current.data?.tickets).toBeNull()
        expect(result.current.data?.handoverTickets).toBeNull()
        expect(result.current.data?.csat).toBeNull()
    })

    it('should respect enabled parameter', () => {
        ;(useMetric as jest.Mock).mockReturnValue({
            isFetching: false,
            isError: false,
            data: undefined,
        })
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            isFetching: false,
            isError: false,
            data: undefined,
        })

        renderHook(
            () =>
                useResourceMetrics({
                    resourceSourceId: 100,
                    resourceSourceSetId: 200,
                    timezone: 'America/New_York',
                    enabled: false,
                }),
            { wrapper },
        )

        expect(useMetric).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            false,
        )
        expect(useMetricPerDimensionV2).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            undefined,
            false,
        )
    })

    it('should round CSAT to 2 decimal places', () => {
        ;(useMetric as jest.Mock)
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: undefined,
            })
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: undefined,
            })
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: { value: 4.567890123 },
            })
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            isFetching: false,
            isError: false,
            data: { allData: [] },
        })

        const { result } = renderHook(
            () =>
                useResourceMetrics({
                    resourceSourceId: 100,
                    resourceSourceSetId: 200,
                    timezone: 'America/New_York',
                }),
            { wrapper },
        )

        expect(result.current.data?.csat?.value).toBe(4.57)
    })
})
