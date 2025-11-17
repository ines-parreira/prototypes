import { assumeMock, renderHook } from '@repo/testing'

import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { useAutomationRateTrend } from 'domains/reporting/hooks/automate/useAutomationRateTrend'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { useMultipleMetricsTrends } from 'domains/reporting/hooks/useMultipleMetricsTrend'
import { TicketCustomFieldsMeasure } from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import { customFieldsTicketTotalCountQueryFactory } from 'domains/reporting/models/queryFactories/ticket-insights/customFieldsTicketCount'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ticketFieldDefinitions } from 'fixtures/customField'
import { useAiAgentAutomationRate } from 'pages/aiAgent/Overview/hooks/kpis/useAiAgentAutomationRate'
import { useCoverageRate } from 'pages/aiAgent/Overview/hooks/kpis/useCoverageRate'

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)

jest.mock('domains/reporting/hooks/useMultipleMetricsTrend')
const useMultipleMetricsTrendsMock = assumeMock(useMultipleMetricsTrends)

jest.mock('domains/reporting/hooks/automate/useAutomationRateTrend')
const useAutomationRateTrendMock = assumeMock(useAutomationRateTrend)

jest.mock('pages/aiAgent/Overview/hooks/kpis/useAiAgentAutomationRate')
const useAiAgentAutomationRateMock = assumeMock(useAiAgentAutomationRate)

jest.mock(
    'domains/reporting/models/queryFactories/ticket-insights/customFieldsTicketCount',
)
const customFieldsTicketTotalCountQueryFactoryMock = assumeMock(
    customFieldsTicketTotalCountQueryFactory,
)

const timezone = 'UTC'
const filters: StatsFilters = {
    period: {
        start_datetime: '2025-02-06T16:55:37.914Z',
        end_datetime: '2025-01-09T16:56:07.727Z',
    },
}

describe('useCoverageRate', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        useCustomFieldDefinitionsMock.mockReturnValue({
            data: { data: ticketFieldDefinitions },
            isLoading: false,
        } as any)

        customFieldsTicketTotalCountQueryFactoryMock.mockReturnValue({
            measures: [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount],
            dimensions: [],
            filters: [],
            timeDimensions: [],
            metricName: METRIC_NAMES.TEST_METRIC,
        })
    })

    it.each([
        {
            automationRateTrendLoading: true,
            iAgentAutomationRateLoading: true,
            aiAgentCoverageRateLoading: true,
        },
        {
            automationRateTrendLoading: true,
            iAgentAutomationRateLoading: false,
            aiAgentCoverageRateLoading: true,
        },
        {
            automationRateTrendLoading: true,
            iAgentAutomationRateLoading: true,
            aiAgentCoverageRateLoading: false,
        },
        {
            automationRateTrendLoading: false,
            iAgentAutomationRateLoading: true,
            aiAgentCoverageRateLoading: true,
        },
        {
            automationRateTrendLoading: false,
            iAgentAutomationRateLoading: false,
            aiAgentCoverageRateLoading: true,
        },
        {
            automationRateTrendLoading: false,
            iAgentAutomationRateLoading: true,
            aiAgentCoverageRateLoading: false,
        },
        {
            automationRateTrendLoading: true,
            iAgentAutomationRateLoading: false,
            aiAgentCoverageRateLoading: false,
        },
    ])(
        'should return loading state when the query is still loading ($automationRateTrendLoading, $iAgentAutomationRateLoading, $aiAgentCoverageRateLoading)',
        ({
            iAgentAutomationRateLoading,
            automationRateTrendLoading,
            aiAgentCoverageRateLoading,
        }) => {
            useMultipleMetricsTrendsMock.mockReturnValue({
                isFetching: aiAgentCoverageRateLoading,
            } as any)

            useAutomationRateTrendMock.mockReturnValue({
                isFetching: automationRateTrendLoading,
            } as any)

            useAiAgentAutomationRateMock.mockReturnValue({
                isLoading: iAgentAutomationRateLoading,
            } as any)

            const { result } = renderHook(() =>
                useCoverageRate(filters, timezone),
            )

            expect(result.current).toEqual({
                'data-candu-id': 'ai-agent-overview-kpi-coverage-rate',
                metricFormat: 'decimal-to-percent-precision-1',
                value: null,
                prevValue: null,
                isLoading: true,
            })
        },
    )

    describe('when queries are not loading', () => {
        beforeEach(() => {
            useMultipleMetricsTrendsMock.mockReturnValue({
                data: {
                    'TicketCustomFieldsEnriched.ticketCount': {
                        value: 3.1,
                        prevValue: 3.5,
                    },
                    'TicketEnriched.ticketCount': {
                        value: 2,
                        prevValue: 1,
                    },
                },
                isFetching: false,
            } as any)
        })

        it('should return AI Agent Coverage Rate when global automation rate equal AI agent automation rate (compare 4 digits)', () => {
            useAutomationRateTrendMock.mockReturnValue({
                isFetching: false,
                data: {
                    value: 0.1234,
                    prevValue: 0,
                },
            } as any)

            useAiAgentAutomationRateMock.mockReturnValue({
                isLoading: false,
                value: 0.1234,
                prevValue: 0,
            } as any)

            const { result } = renderHook(() =>
                useCoverageRate(filters, timezone),
            )

            expect(result.current).toEqual({
                'data-candu-id': 'ai-agent-overview-kpi-coverage-rate',
                title: 'Coverage Rate',
                hint: {
                    title: 'Percentage of tickets that AI Agent attempted to respond to.',
                },
                metricFormat: 'decimal-to-percent-precision-1',
                value: 1.55,
                prevValue: 3.5,
                isLoading: false,
            })
        })

        it.each([
            { aiAgentAutomationRateValue: 0.1235 },
            { aiAgentAutomationRateValue: undefined },
        ])(
            'should return Global Coverage Rate when global automation rate different than AI agent automation rate (compare 4 digits)',
            ({ aiAgentAutomationRateValue }) => {
                useAutomationRateTrendMock.mockReturnValue({
                    isFetching: false,
                    data: {
                        value: 0.1234,
                        prevValue: 0,
                    },
                } as any)

                useAiAgentAutomationRateMock.mockReturnValue({
                    isLoading: false,
                    value: aiAgentAutomationRateValue,
                    prevValue: 0,
                } as any)

                const { result } = renderHook(() =>
                    useCoverageRate(filters, timezone),
                )

                expect(result.current).toEqual({
                    'data-candu-id': 'ai-agent-overview-kpi-coverage-rate',
                    title: 'Automation Rate',
                    hint: {
                        link: 'https://link.gorgias.com/mnp',
                        linkText: 'How is it calculated?',
                        title: 'Automated interactions as a percent of all customer interactions.',
                    },
                    metricFormat: 'decimal-to-percent-precision-1',
                    value: 0.1234,
                    prevValue: 0,
                    isLoading: false,
                })
            },
        )

        it('should return Global Coverage Rate when global automation rate and AI agent automation rate are 0', () => {
            useAutomationRateTrendMock.mockReturnValue({
                isFetching: false,
                data: {
                    value: 0,
                    prevValue: 0,
                },
            } as any)

            useAiAgentAutomationRateMock.mockReturnValue({
                isLoading: false,
                value: 0,
                prevValue: 0,
            } as any)

            const { result } = renderHook(() =>
                useCoverageRate(filters, timezone),
            )

            expect(result.current).toEqual({
                'data-candu-id': 'ai-agent-overview-kpi-coverage-rate',
                title: 'Automation Rate',
                hint: {
                    link: 'https://link.gorgias.com/mnp',
                    linkText: 'How is it calculated?',
                    title: 'Automated interactions as a percent of all customer interactions.',
                },
                metricFormat: 'decimal-to-percent-precision-1',
                value: 0,
                prevValue: 0,
                isLoading: false,
            })
        })
    })

    it('should pass integrationIds to customFieldsTicketTotalCountQueryFactory correctly', () => {
        const integrationIds = ['123', '456']

        useMultipleMetricsTrendsMock.mockReturnValue({
            data: {
                'TicketCustomFieldsEnriched.ticketCustomFieldsTicketCount': {
                    value: 3.1,
                    prevValue: 3.5,
                },
                'TicketEnriched.ticketCount': {
                    value: 2,
                    prevValue: 1,
                },
            },
            isFetching: false,
            isError: false,
        } as any)

        useAutomationRateTrendMock.mockReturnValue({
            isFetching: false,
            data: {
                value: 0.1234,
                prevValue: 0,
            },
            isError: false,
        } as any)

        useAiAgentAutomationRateMock.mockReturnValue({
            isLoading: false,
            value: 0.1235,
            prevValue: 0,
        })

        renderHook(() => useCoverageRate(filters, timezone, integrationIds))

        expect(
            customFieldsTicketTotalCountQueryFactoryMock,
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                additionalFilters: [
                    {
                        member: 'TicketMessagesEnriched.integrationChannelPair',
                        operator: 'equals',
                        values: ['123', '456'],
                    },
                ],
            }),
        )

        expect(
            customFieldsTicketTotalCountQueryFactoryMock,
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                filters: expect.objectContaining({
                    period: expect.objectContaining({
                        start_datetime: expect.any(String),
                        end_datetime: expect.any(String),
                    }),
                }),
                additionalFilters: [
                    {
                        member: 'TicketMessagesEnriched.integrationChannelPair',
                        operator: 'equals',
                        values: ['123', '456'],
                    },
                ],
            }),
        )
    })

    it('should not pass additionalFilters when integrationIds is undefined', () => {
        useMultipleMetricsTrendsMock.mockReturnValue({
            data: {
                'TicketCustomFieldsEnriched.ticketCustomFieldsTicketCount': {
                    value: 3.1,
                    prevValue: 3.5,
                },
                'TicketEnriched.ticketCount': {
                    value: 2,
                    prevValue: 1,
                },
            },
            isFetching: false,
            isError: false,
        } as any)

        useAutomationRateTrendMock.mockReturnValue({
            isFetching: false,
            data: {
                value: 0.1234,
                prevValue: 0,
            },
            isError: false,
        } as any)

        useAiAgentAutomationRateMock.mockReturnValue({
            isLoading: false,
            value: 0.1235,
            prevValue: 0,
        })

        renderHook(() => useCoverageRate(filters, timezone))

        expect(
            customFieldsTicketTotalCountQueryFactoryMock,
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                additionalFilters: undefined,
            }),
        )

        expect(
            customFieldsTicketTotalCountQueryFactoryMock,
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                filters: expect.objectContaining({
                    period: expect.objectContaining({
                        start_datetime: expect.any(String),
                        end_datetime: expect.any(String),
                    }),
                }),
                additionalFilters: undefined,
            }),
        )
    })
})
