import { assumeMock, renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import { useStatsMetricTrend } from 'domains/reporting/hooks/useStatsMetricTrend'
import { allAgentsAutomatedInteractionsValueQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { IntegrationType } from 'models/integration/types'
import {
    useAiAgentAutomationTickets,
    useKpis,
} from 'pages/aiAgent/Overview/hooks/useKpis'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlagWithLoading: jest.fn(() => ({ value: false, isLoading: false })),
}))

jest.mock('domains/reporting/hooks/useStatsMetricTrend')
const useStatsMetricTrendMock = assumeMock(useStatsMetricTrend)

jest.mock(
    'domains/reporting/models/scopes/aiAgentAutomatedInteractions',
    () => ({
        allAgentsAutomatedInteractionsValueQueryFactoryV2: jest.fn(() => ({
            measures: ['automatedInteractionsCount'],
            metricName: 'mock-metric',
        })),
    }),
)
const v2FactoryMock = assumeMock(
    allAgentsAutomatedInteractionsValueQueryFactoryV2,
)

jest.mock('pages/aiAgent/Overview/hooks/kpis/useGmvInfluenced', () => ({
    useGmvInfluenced: jest.fn(() => 'mockGmvInfluenced'),
}))
jest.mock('pages/aiAgent/Overview/hooks/kpis/useCsat', () => ({
    useCsat: jest.fn(() => 'mockCsat'),
}))
jest.mock(
    'pages/aiAgent/Overview/hooks/kpis/useAiAgentTicketNoHandover',
    () => ({
        useAiAgentTicketNoHandover: jest.fn(() => ({
            data: {
                'TicketCustomFieldsEnriched.ticketCount': {
                    value: 100,
                    prevValue: 80,
                },
            },
            isFetching: false,
        })),
    }),
)
jest.mock('hooks/integrations/useGetTicketChannelsStoreIntegrations', () => ({
    useGetTicketChannelsStoreIntegrations: jest.fn(() => ['123', '456']),
}))
jest.mock('domains/reporting/state/stats/selectors', () => ({
    ...jest.requireActual('domains/reporting/state/stats/selectors'),
    getStatsStoreIntegrations: jest.fn(() => []),
}))

const timezone = 'UTC'
const filters: StatsFilters = {
    period: {
        start_datetime: '2025-01-01T00:00:00Z',
        end_datetime: '2025-01-31T00:00:00Z',
    },
}

const mockStoreState = {
    stats: {
        filters: {
            period: {
                start_datetime: '',
                end_datetime: '',
            },
        },
    },
    integrations: fromJS([
        {
            id: 789,
            name: 'test-shop',
            type: IntegrationType.Shopify,
            meta: { shop_name: 'test-shop' },
        },
        {
            id: 790,
            name: 'another-shop',
            type: IntegrationType.Shopify,
            meta: { shop_name: 'another-shop' },
        },
    ]),
}

describe('useAiAgentAutomationTickets', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        const { useFlagWithLoading } = jest.requireMock('@repo/feature-flags')
        useFlagWithLoading.mockReturnValue({ value: false, isLoading: false })
        v2FactoryMock.mockReturnValue({
            measures: ['automatedInteractionsCount'],
            metricName: 'mock-metric',
        } as any)
        useStatsMetricTrendMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: undefined,
        })
    })

    describe('v1 path (flag off)', () => {
        it('should return v1 data when flag is off', () => {
            const { useAiAgentTicketNoHandover } = jest.requireMock(
                'pages/aiAgent/Overview/hooks/kpis/useAiAgentTicketNoHandover',
            )
            useAiAgentTicketNoHandover.mockReturnValue({
                data: {
                    'TicketCustomFieldsEnriched.ticketCount': {
                        value: 42,
                        prevValue: 30,
                    },
                },
                isFetching: false,
            })

            const { result } = renderHook(
                () => useAiAgentAutomationTickets(filters, timezone),
                { storeState: mockStoreState },
            )

            expect(result.current.value).toBe(42)
            expect(result.current.prevValue).toBe(30)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.title).toBe('Automated interactions')
        })

        it('should return null when v1 measure is missing', () => {
            const { useAiAgentTicketNoHandover } = jest.requireMock(
                'pages/aiAgent/Overview/hooks/kpis/useAiAgentTicketNoHandover',
            )
            useAiAgentTicketNoHandover.mockReturnValue({
                data: {},
                isFetching: false,
            })

            const { result } = renderHook(
                () => useAiAgentAutomationTickets(filters, timezone),
                { storeState: mockStoreState },
            )

            expect(result.current.value).toBeNull()
            expect(result.current.prevValue).toBeNull()
        })

        it('should reflect v1 isFetching', () => {
            const { useAiAgentTicketNoHandover } = jest.requireMock(
                'pages/aiAgent/Overview/hooks/kpis/useAiAgentTicketNoHandover',
            )
            useAiAgentTicketNoHandover.mockReturnValue({
                data: {},
                isFetching: true,
            })

            const { result } = renderHook(
                () => useAiAgentAutomationTickets(filters, timezone),
                { storeState: mockStoreState },
            )

            expect(result.current.isLoading).toBe(true)
        })

        it('should use empty storeFilter when v2IntegrationIds is absent', () => {
            renderHook(
                () =>
                    useAiAgentAutomationTickets(
                        filters,
                        timezone,
                        undefined,
                        undefined,
                    ),
                { storeState: mockStoreState },
            )

            expect(v2FactoryMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    filters: expect.not.objectContaining({
                        storeIntegrations: expect.anything(),
                    }),
                }),
            )
        })

        it('should include storeIntegrations filter when v2IntegrationIds provided', () => {
            renderHook(
                () =>
                    useAiAgentAutomationTickets(
                        filters,
                        timezone,
                        undefined,
                        [123, 456],
                    ),
                { storeState: mockStoreState },
            )

            expect(v2FactoryMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    filters: expect.objectContaining({
                        storeIntegrations: expect.any(Object),
                    }),
                }),
            )
        })
    })

    describe('v2 path (flag on)', () => {
        beforeEach(() => {
            const { useFlagWithLoading } = jest.requireMock(
                '@repo/feature-flags',
            )
            useFlagWithLoading.mockReturnValue({
                value: true,
                isLoading: false,
            })
        })

        it('should return v2 data when flag is on', () => {
            useStatsMetricTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: { value: 99, prevValue: 77 },
            })

            const { result } = renderHook(
                () => useAiAgentAutomationTickets(filters, timezone),
                { storeState: mockStoreState },
            )

            expect(result.current.value).toBe(99)
            expect(result.current.prevValue).toBe(77)
            expect(result.current.isLoading).toBe(false)
        })

        it('should return null when v2 data is undefined', () => {
            useStatsMetricTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: undefined,
            })

            const { result } = renderHook(
                () => useAiAgentAutomationTickets(filters, timezone),
                { storeState: mockStoreState },
            )

            expect(result.current.value).toBeNull()
            expect(result.current.prevValue).toBeNull()
        })

        it('should reflect v2 isFetching', () => {
            useStatsMetricTrendMock.mockReturnValue({
                isFetching: true,
                isError: false,
                data: undefined,
            })

            const { result } = renderHook(
                () => useAiAgentAutomationTickets(filters, timezone),
                { storeState: mockStoreState },
            )

            expect(result.current.isLoading).toBe(true)
        })
    })

    describe('flag loading', () => {
        it('should report loading when flag is still loading', () => {
            const { useFlagWithLoading } = jest.requireMock(
                '@repo/feature-flags',
            )
            useFlagWithLoading.mockReturnValue({
                value: undefined,
                isLoading: true,
            })

            const { result } = renderHook(
                () => useAiAgentAutomationTickets(filters, timezone),
                { storeState: mockStoreState },
            )

            expect(result.current.isLoading).toBe(true)
        })
    })
})

describe('useKpis', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        const { useFlagWithLoading } = jest.requireMock('@repo/feature-flags')
        useFlagWithLoading.mockReturnValue({ value: false, isLoading: false })
        const { getStatsStoreIntegrations } = jest.requireMock(
            'domains/reporting/state/stats/selectors',
        )
        getStatsStoreIntegrations.mockReturnValue([])
        useStatsMetricTrendMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: undefined,
        })
        v2FactoryMock.mockReturnValue({
            measures: ['automatedInteractionsCount'],
            metricName: 'mock-metric',
        } as any)
    })

    it('should return metrics from individual hooks', () => {
        const { result } = renderHook(
            () =>
                useKpis({
                    automationRateFilters: filters,
                    filters,
                    timezone,
                    aiAgentUserId: 123,
                    aiAgentType: 'mixed',
                    showActivationModal: () => {},
                    showEarlyAccessModal: () => {},
                    isOnNewPlan: true,
                }),
            { storeState: mockStoreState },
        )

        expect(result.current.metrics).toHaveLength(3)
        expect(result.current.metrics[0]).toHaveProperty(
            'title',
            'Automated interactions',
        )
        expect(result.current.metrics[1]).toEqual('mockCsat')
        expect(result.current.metrics[2]).toEqual('mockGmvInfluenced')
    })

    it('should return metrics', () => {
        const { result } = renderHook(
            () =>
                useKpis({
                    automationRateFilters: filters,
                    filters,
                    timezone,
                    aiAgentUserId: 123,
                    aiAgentType: 'mixed',
                    showActivationModal: () => {},
                    showEarlyAccessModal: () => {},
                    isOnNewPlan: true,
                    shopName: 'test-shop',
                }),
            { storeState: mockStoreState },
        )

        expect(result.current.metrics).toHaveLength(3)
        expect(result.current.metrics[0]).toHaveProperty(
            'title',
            'Automated interactions',
        )
        expect(result.current.metrics[1]).toEqual('mockCsat')
        expect(result.current.metrics[2]).toEqual('mockGmvInfluenced')
    })

    it('should handle undefined aiAgentType', () => {
        const { result } = renderHook(
            () =>
                useKpis({
                    automationRateFilters: filters,
                    filters,
                    timezone,
                    aiAgentUserId: 123,
                    showActivationModal: () => {},
                    showEarlyAccessModal: () => {},
                    isOnNewPlan: false,
                }),
            { storeState: mockStoreState },
        )

        expect(result.current.metrics).toHaveLength(3)
        expect(result.current.metrics[0]).toHaveProperty(
            'title',
            'Automated interactions',
        )
        expect(result.current.metrics[1]).toEqual('mockCsat')
        expect(result.current.metrics[2]).toEqual('mockGmvInfluenced')
    })

    it('should call hooks with correct parameters', () => {
        const { useAiAgentTicketNoHandover } = jest.requireMock(
            'pages/aiAgent/Overview/hooks/kpis/useAiAgentTicketNoHandover',
        )
        const { useGmvInfluenced } = jest.requireMock(
            'pages/aiAgent/Overview/hooks/kpis/useGmvInfluenced',
        )
        const { useCsat } = jest.requireMock(
            'pages/aiAgent/Overview/hooks/kpis/useCsat',
        )
        const { useGetTicketChannelsStoreIntegrations } = jest.requireMock(
            'hooks/integrations/useGetTicketChannelsStoreIntegrations',
        )

        const showActivationModal = jest.fn()
        const showEarlyAccessModal = jest.fn()
        const customFilters: StatsFilters = {
            period: {
                start_datetime: '2025-01-01T00:00:00Z',
                end_datetime: '2025-01-31T23:59:59Z',
            },
        }

        renderHook(
            () =>
                useKpis({
                    automationRateFilters: customFilters,
                    filters: customFilters,
                    timezone: 'America/New_York',
                    aiAgentUserId: 456,
                    aiAgentType: 'support',
                    showActivationModal,
                    showEarlyAccessModal,
                    isOnNewPlan: true,
                    shopName: 'my-shop',
                }),
            { storeState: mockStoreState },
        )

        expect(useGetTicketChannelsStoreIntegrations).toHaveBeenCalledWith(
            'my-shop',
        )

        const expectedFilters = {
            ...customFilters,
            agents: {
                operator: 'one-of',
                values: [456],
            },
        }

        // v1 path is enabled (flag is off), so useV1=true is passed
        expect(useAiAgentTicketNoHandover).toHaveBeenCalledWith(
            expectedFilters,
            'America/New_York',
            ['123', '456'],
            true,
        )
        expect(useGmvInfluenced).toHaveBeenCalledWith({
            filters: expectedFilters,
            timezone: 'America/New_York',
            aiAgentType: 'support',
            isOnNewPlan: true,
            showEarlyAccessModal,
            showActivationModal,
            integrationIds: [],
        })
        expect(useCsat).toHaveBeenCalledWith(
            expectedFilters,
            'America/New_York',
            456,
            ['123', '456'],
            [],
        )
    })

    it('should filter storeIntegrations by shopName to build gmvIntegrationIds', () => {
        const { getStatsStoreIntegrations } = jest.requireMock(
            'domains/reporting/state/stats/selectors',
        )
        getStatsStoreIntegrations.mockReturnValue([
            { name: 'test-shop', id: 789 },
            { name: 'other-shop', id: 790 },
        ])

        const { useCsat } = jest.requireMock(
            'pages/aiAgent/Overview/hooks/kpis/useCsat',
        )
        const { useGmvInfluenced } = jest.requireMock(
            'pages/aiAgent/Overview/hooks/kpis/useGmvInfluenced',
        )

        renderHook(
            () =>
                useKpis({
                    automationRateFilters: filters,
                    filters,
                    timezone,
                    aiAgentUserId: 123,
                    showActivationModal: () => {},
                    showEarlyAccessModal: () => {},
                    isOnNewPlan: true,
                    shopName: 'test-shop',
                }),
            { storeState: mockStoreState },
        )

        // Only 'test-shop' (id: 789) matches the shopName
        expect(useCsat).toHaveBeenCalledWith(
            expect.any(Object),
            timezone,
            123,
            ['123', '456'],
            [789],
        )
        expect(useGmvInfluenced).toHaveBeenCalledWith(
            expect.objectContaining({ integrationIds: [789] }),
        )
    })

    it('should use v2 integration IDs for useCsat when flag is on', () => {
        const { useFlagWithLoading } = jest.requireMock('@repo/feature-flags')
        useFlagWithLoading.mockReturnValue({ value: true, isLoading: false })

        const { useCsat } = jest.requireMock(
            'pages/aiAgent/Overview/hooks/kpis/useCsat',
        )

        renderHook(
            () =>
                useKpis({
                    automationRateFilters: filters,
                    filters,
                    timezone,
                    aiAgentUserId: 123,
                    aiAgentType: 'mixed',
                    showActivationModal: () => {},
                    showEarlyAccessModal: () => {},
                    isOnNewPlan: true,
                    shopName: 'test-shop',
                }),
            { storeState: mockStoreState },
        )

        // gmvIntegrationIds = [] because getStatsStoreIntegrations is mocked to return []
        expect(useCsat).toHaveBeenCalledWith(
            expect.any(Object),
            timezone,
            123,
            ['123', '456'],
            [],
        )
    })
})
