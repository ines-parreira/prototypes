import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    useJourneyData,
    useJourneys,
    useUpdateJourney,
} from 'AIJourney/queries'
import useAppSelector from 'hooks/useAppSelector'
import {
    AIJourneyProvider,
    useAIJourneyContext,
} from 'pages/aiAgent/PlaygroundV2/contexts/AIJourneyContext'
import { CoreProvider } from 'pages/aiAgent/PlaygroundV2/contexts/CoreContext'
import { SettingsProvider } from 'pages/aiAgent/PlaygroundV2/contexts/SettingsContext'
import { useSettingsChanged } from 'pages/aiAgent/PlaygroundV2/hooks/useSettingsChanged'

jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    useSearchParams: jest.fn(() => [new URLSearchParams(), jest.fn()]),
}))

jest.mock('hooks/useNotify', () => ({
    __esModule: true,
    useNotify: jest.fn(() => ({
        notify: jest.fn(),
    })),
}))

jest.mock('hooks/useAppSelector')

jest.mock('AIJourney/queries', () => ({
    useJourneys: jest.fn(),
    useJourneyData: jest.fn(),
    useUpdateJourney: jest.fn(),
}))

jest.mock('AIJourney/hooks', () => ({
    useAIJourneyProductList: jest.fn(() => ({
        productList: [],
        isLoading: false,
        error: null,
    })),
}))

jest.mock('pages/aiAgent/PlaygroundV2/contexts/EventsContext', () => ({
    useEvents: jest.fn(() => ({
        on: jest.fn(),
        emit: jest.fn(),
    })),
    useSubscribeToEvent: jest.fn(),
    EventsProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

jest.mock('models/aiAgent/queries', () => ({
    useCreateTestSessionMutation: jest.fn(() => ({
        mutateAsync: jest.fn(),
        isLoading: false,
    })),
    useGetTestSessionLogs: jest.fn(() => ({
        data: undefined,
        isLoading: false,
    })),
    useGetTestSession: jest.fn(() => ({
        data: undefined,
        isLoading: false,
    })),
}))

jest.mock('pages/aiAgent/PlaygroundV2/hooks/useTestSession', () => ({
    useTestSession: jest.fn(() => ({
        testSessionId: 'test-session-id',
        isTestSessionLoading: false,
        createTestSession: jest.fn(),
    })),
}))

jest.mock('pages/aiAgent/PlaygroundV2/hooks/usePlaygroundPolling', () => ({
    usePlaygroundPolling: jest.fn(() => ({
        testSessionLogs: undefined,
        isPolling: false,
        startPolling: jest.fn(),
        stopPolling: jest.fn(),
    })),
}))

jest.mock('pages/aiAgent/PlaygroundV2/hooks/useAiAgentHttpIntegration', () => ({
    useAiAgentHttpIntegration: jest.fn(() => ({
        baseUrl: 'http://test.com',
        httpIntegrationId: 123,
    })),
}))

jest.mock('pages/aiAgent/PlaygroundV2/hooks/usePlaygroundChannel', () => ({
    usePlaygroundChannel: jest.fn(() => ({
        channel: 'chat',
        channelAvailability: 'online',
        onChannelChange: jest.fn(),
        onChannelAvailabilityChange: jest.fn(),
    })),
}))

const mockUseJourneys = useJourneys as jest.Mock
const mockUseJourneyData = useJourneyData as jest.Mock
const mockUseUpdateJourney = useUpdateJourney as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock

const mockShopifyIntegrations = [{ id: 123, name: 'test-shop' }]

const mockJourneys = [
    {
        id: 'journey-1',
        type: 'cart_abandoned',
        state: 'active',
    },
]

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    })
    const mockStoreCreator = configureMockStore([thunk])
    const mockStore = mockStoreCreator({})

    return ({ children }: { children: ReactNode }) => (
        <Provider store={mockStore}>
            <QueryClientProvider client={queryClient}>
                <CoreProvider>
                    <SettingsProvider>
                        <AIJourneyProvider shopName="test-shop">
                            {children}
                        </AIJourneyProvider>
                    </SettingsProvider>
                </CoreProvider>
            </QueryClientProvider>
        </Provider>
    )
}

describe('useSettingsChanged', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppSelector.mockReturnValue(mockShopifyIntegrations)
        mockUseJourneys.mockReturnValue({
            data: mockJourneys,
            isLoading: false,
        })
        mockUseJourneyData.mockReturnValue({
            data: null,
            isLoading: false,
        })
        mockUseUpdateJourney.mockReturnValue({
            mutateAsync: jest.fn(),
            isLoading: false,
        })
    })

    it('should return hasChanged as false initially', () => {
        const { result } = renderHook(() => useSettingsChanged(), {
            wrapper: createWrapper(),
        })

        expect(result.current.hasChanged).toBe(false)
        expect(result.current.hasInboundChanged).toBe(false)
        expect(result.current.hasOutboundChanged).toBe(false)
    })

    it('should provide resetInitialState function', () => {
        const { result } = renderHook(() => useSettingsChanged(), {
            wrapper: createWrapper(),
        })

        expect(result.current.resetInitialState).toBeInstanceOf(Function)
    })

    it('should reset state when resetInitialState is called', () => {
        const { result } = renderHook(() => useSettingsChanged(), {
            wrapper: createWrapper(),
        })

        act(() => {
            result.current.resetInitialState()
        })

        expect(result.current.hasChanged).toBe(false)
        expect(result.current.hasInboundChanged).toBe(false)
        expect(result.current.hasOutboundChanged).toBe(false)
    })

    it('should return all expected properties', () => {
        const { result } = renderHook(() => useSettingsChanged(), {
            wrapper: createWrapper(),
        })

        expect(result.current).toHaveProperty('hasChanged')
        expect(result.current).toHaveProperty('hasInboundChanged')
        expect(result.current).toHaveProperty('hasOutboundChanged')
        expect(result.current).toHaveProperty('resetInitialState')
    })

    it('should memoize change detection values', () => {
        const { result, rerender } = renderHook(() => useSettingsChanged(), {
            wrapper: createWrapper(),
        })

        const firstInboundValue = result.current.hasInboundChanged
        const firstOutboundValue = result.current.hasOutboundChanged

        rerender()

        expect(result.current.hasInboundChanged).toBe(firstInboundValue)
        expect(result.current.hasOutboundChanged).toBe(firstOutboundValue)
    })

    it('should not detect changes when only journeyId changes', () => {
        const { result } = renderHook(
            () => ({
                settingsChanged: useSettingsChanged(),
                aiJourneyContext: useAIJourneyContext(),
            }),
            {
                wrapper: createWrapper(),
            },
        )

        expect(result.current.settingsChanged.hasOutboundChanged).toBe(false)

        act(() => {
            result.current.aiJourneyContext.setAIJourneySettings({
                journeyId: 'new-id',
            })
        })

        expect(result.current.settingsChanged.hasOutboundChanged).toBe(false)
    })

    it('should detect changes when outbound settings other than journeyId change', () => {
        const { result } = renderHook(
            () => ({
                settingsChanged: useSettingsChanged(),
                aiJourneyContext: useAIJourneyContext(),
            }),
            {
                wrapper: createWrapper(),
            },
        )

        expect(result.current.settingsChanged.hasOutboundChanged).toBe(false)

        act(() => {
            result.current.aiJourneyContext.setAIJourneySettings({
                totalFollowUp: 5,
            })
        })

        expect(result.current.settingsChanged.hasOutboundChanged).toBe(true)
    })

    it('should reset initial state when journeyId changes', () => {
        const { result } = renderHook(
            () => ({
                settingsChanged: useSettingsChanged(),
                aiJourneyContext: useAIJourneyContext(),
            }),
            {
                wrapper: createWrapper(),
            },
        )

        act(() => {
            result.current.aiJourneyContext.setAIJourneySettings({
                totalFollowUp: 5,
            })
        })

        expect(result.current.settingsChanged.hasOutboundChanged).toBe(true)

        act(() => {
            result.current.aiJourneyContext.setAIJourneySettings({
                journeyId: 'other-id',
            })
        })

        expect(result.current.settingsChanged.hasOutboundChanged).toBe(false)
    })
})
