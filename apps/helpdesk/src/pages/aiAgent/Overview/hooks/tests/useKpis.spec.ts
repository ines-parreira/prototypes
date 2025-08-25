import { fromJS } from 'immutable'

import { IntegrationType } from 'models/integration/types'
import { useKpis } from 'pages/aiAgent/Overview/hooks/useKpis'
import { renderHookWithStoreAndQueryClientProvider } from 'tests/renderHookWithStoreAndQueryClientProvider'

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
jest.mock('launchdarkly-react-client-sdk', () => ({
    useFlags: jest.fn(() => ({})),
}))

const timezone = 'UTC'
const filters = {
    period: {
        start_datetime: '',
        end_datetime: '',
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

describe('useKpis', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return metrics from individual hooks', () => {
        const { result } = renderHookWithStoreAndQueryClientProvider(
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
            mockStoreState,
        )

        expect(result.current.metrics).toHaveLength(3)
        expect(result.current.metrics[0]).toHaveProperty(
            'title',
            'AI Agent automated interactions',
        )
        expect(result.current.metrics[1]).toEqual('mockCsat')
        expect(result.current.metrics[2]).toEqual('mockGmvInfluenced')
    })

    it('should return metrics', () => {
        const { result } = renderHookWithStoreAndQueryClientProvider(
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
            mockStoreState,
        )

        expect(result.current.metrics).toHaveLength(3)
        expect(result.current.metrics[0]).toHaveProperty(
            'title',
            'AI Agent automated interactions',
        )
        expect(result.current.metrics[1]).toEqual('mockCsat')
        expect(result.current.metrics[2]).toEqual('mockGmvInfluenced')
    })

    it('should handle undefined aiAgentType', () => {
        const { result } = renderHookWithStoreAndQueryClientProvider(
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
            mockStoreState,
        )

        expect(result.current.metrics).toHaveLength(3)
        expect(result.current.metrics[0]).toHaveProperty(
            'title',
            'AI Agent automated interactions',
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
        const customFilters = {
            period: {
                start_datetime: '2025-01-01T00:00:00Z',
                end_datetime: '2025-01-31T23:59:59Z',
            },
        }

        renderHookWithStoreAndQueryClientProvider(
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
            mockStoreState,
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

        expect(useAiAgentTicketNoHandover).toHaveBeenCalledWith(
            expectedFilters,
            'America/New_York',
            ['123', '456'],
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
        )
    })
})
