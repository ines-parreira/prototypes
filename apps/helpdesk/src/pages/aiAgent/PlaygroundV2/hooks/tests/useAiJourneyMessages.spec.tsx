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
import { useTriggerAIJourney } from 'models/aiAgent/queries'
import {
    AIJourneyProvider,
    useAIJourneyContext,
} from 'pages/aiAgent/PlaygroundV2/contexts/AIJourneyContext'
import { useConfigurationContext } from 'pages/aiAgent/PlaygroundV2/contexts/ConfigurationContext'
import { useCoreContext } from 'pages/aiAgent/PlaygroundV2/contexts/CoreContext'
import { useAiJourneyMessages } from 'pages/aiAgent/PlaygroundV2/hooks/useAiJourneyMessages'

jest.mock('hooks/useAppSelector')
jest.mock('AIJourney/queries')
jest.mock('AIJourney/hooks', () => ({
    useAIJourneyProductList: jest.fn(() => ({
        productList: [],
        isLoading: false,
        error: null,
    })),
}))
jest.mock('models/aiAgent/queries')
jest.mock('pages/aiAgent/PlaygroundV2/contexts/ConfigurationContext')
jest.mock('pages/aiAgent/PlaygroundV2/contexts/CoreContext')

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
    useTriggerAIJourney: jest.fn(),
}))

const mockUseJourneys = useJourneys as jest.Mock
const mockUseJourneyData = useJourneyData as jest.Mock
const mockUseUpdateJourney = useUpdateJourney as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock
const mockUseTriggerAIJourney = useTriggerAIJourney as jest.Mock
const mockUseConfigurationContext = useConfigurationContext as jest.Mock
const mockUseCoreContext = useCoreContext as jest.Mock

const mockShopifyIntegrations = [
    {
        id: 123,
        name: 'test-shop',
        meta: { shop_domain: 'test-shop.myshopify.com' },
    },
]

const mockJourneys = [
    {
        id: 'journey-1',
        type: 'cart_abandoned',
        state: 'active',
    },
]

const mockJourneyData = {
    configuration: {
        max_follow_up_messages: 2,
        include_image: false,
        offer_discount: true,
        max_discount_percent: 15,
        discount_code_message_threshold: 2,
        sms_sender_number: '+1234567890',
        sms_sender_integration_id: 456,
    },
    message_instructions: 'Test instructions',
}

describe('useAiJourneyMessages', () => {
    const mockMutateAsync = jest.fn()
    const mockCreateTestSession = jest.fn()
    const mockStartPolling = jest.fn()

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
                    <AIJourneyProvider shopName="test-shop">
                        {children}
                    </AIJourneyProvider>
                </QueryClientProvider>
            </Provider>
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppSelector.mockReturnValue(mockShopifyIntegrations)
        mockUseJourneys.mockReturnValue({
            data: mockJourneys,
            isLoading: false,
        })
        mockUseJourneyData.mockReturnValue({
            data: mockJourneyData,
            isLoading: false,
        })
        mockUseUpdateJourney.mockReturnValue({
            mutateAsync: jest.fn(),
            isLoading: false,
        })
        mockUseTriggerAIJourney.mockReturnValue({
            mutateAsync: mockMutateAsync,
            isLoading: false,
        })
        mockUseConfigurationContext.mockReturnValue({
            accountId: 123,
            storeConfiguration: null,
            accountConfiguration: null,
            snippetHelpCenterId: undefined,
            httpIntegrationId: 789,
            baseUrl: 'http://test.com',
            gorgiasDomain: 'test-domain.gorgias.com',
            chatIntegrationId: undefined,
            shopName: 'test-shop',
        })
        mockUseCoreContext.mockReturnValue({
            testSessionId: 'test-session-id',
            isTestSessionLoading: false,
            createTestSession: mockCreateTestSession,
            testSessionLogs: undefined,
            isPolling: false,
            startPolling: mockStartPolling,
            stopPolling: jest.fn(),
            channel: 'chat',
            channelAvailability: 'online',
            onChannelChange: jest.fn(),
            onChannelAvailabilityChange: jest.fn(),
        })
        mockMutateAsync.mockResolvedValue({})
        mockCreateTestSession.mockResolvedValue('new-session-id')
    })

    it('should return triggerMessage function', () => {
        const { result } = renderHook(() => useAiJourneyMessages(), {
            wrapper: createWrapper(),
        })

        expect(result.current.triggerMessage).toBeDefined()
        expect(typeof result.current.triggerMessage).toBe('function')
    })

    it('should trigger AI journey message with correct payload', async () => {
        const { result } = renderHook(() => useAiJourneyMessages(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            await result.current.triggerMessage()
        })

        expect(mockMutateAsync).toHaveBeenCalledWith([
            expect.objectContaining({
                accountId: 123,
                storeIntegrationId: 123,
                storeName: 'test-shop',
                storeType: 'shopify',
                journeyId: 'journey-1',
                journeyType: 'cart_abandoned',
                testModeSessionId: 'test-session-id',
                followUpAttempt: 0,
            }),
        ])
    })

    it('should include product in payload when selectedProduct is set', async () => {
        const mockProduct = {
            id: 123,
            handle: 'test-product',
            title: 'Test Product',
            variants: [{ id: 456, price: '99.99' }],
        }

        const { result } = renderHook(
            () => ({
                aiJourneyMessages: useAiJourneyMessages(),
                aiJourneyContext: useAIJourneyContext(),
            }),
            {
                wrapper: createWrapper(),
            },
        )

        await act(async () => {
            result.current.aiJourneyContext.setAIJourneySettings({
                selectedProduct: mockProduct as any,
            })
        })

        await act(async () => {
            await result.current.aiJourneyMessages.triggerMessage()
        })

        expect(mockMutateAsync).toHaveBeenCalledWith([
            expect.objectContaining({
                cart: {
                    lineItems: [
                        {
                            variantId: '456',
                            productId: '123',
                            quantity: 1,
                            linePrice: 99.99,
                        },
                    ],
                },
                page: {
                    url: 'https://test-shop.myshopify.com/products/test-product',
                    productId: '123',
                },
                lastOrder: {
                    id: 1,
                    createdAt: expect.any(String),
                    items: [
                        {
                            name: 'Test Product',
                            variantId: '456',
                            productId: '123',
                            quantity: 1,
                            linePrice: 99.99,
                        },
                    ],
                },
                order: {
                    id: expect.stringMatching(/^order-\d+$/),
                    lineItems: [
                        {
                            productId: '123',
                            variantId: '456',
                            quantity: 1,
                            price: '99.99',
                            title: 'Test Product',
                        },
                    ],
                    totalPrice: 99.99,
                    currency: 'USD',
                    financialStatus: 'paid',
                    fulfillmentStatus: null,
                    createdAt: expect.any(String),
                },
            }),
        ])
    })

    it('should use fallback values when product variant data is missing', async () => {
        const mockProduct = {
            id: 789,
            handle: 'incomplete-product',
            title: 'Incomplete Product',
            variants: [],
        }

        const { result } = renderHook(
            () => ({
                aiJourneyMessages: useAiJourneyMessages(),
                aiJourneyContext: useAIJourneyContext(),
            }),
            {
                wrapper: createWrapper(),
            },
        )

        await act(async () => {
            result.current.aiJourneyContext.setAIJourneySettings({
                selectedProduct: mockProduct as any,
            })
        })

        await act(async () => {
            await result.current.aiJourneyMessages.triggerMessage()
        })

        expect(mockMutateAsync).toHaveBeenCalledWith([
            expect.objectContaining({
                cart: {
                    lineItems: [
                        {
                            variantId: 'variant-1',
                            productId: '789',
                            quantity: 1,
                            linePrice: 99.99,
                        },
                    ],
                },
                order: {
                    id: expect.stringMatching(/^order-\d+$/),
                    lineItems: [
                        {
                            productId: '789',
                            variantId: 'variant-1',
                            quantity: 1,
                            price: '99.99',
                            title: 'Incomplete Product',
                        },
                    ],
                    totalPrice: 99.99,
                    currency: 'USD',
                    financialStatus: 'paid',
                    fulfillmentStatus: null,
                    createdAt: expect.any(String),
                },
            }),
        ])
    })

    it('should call startPolling after triggering message', async () => {
        const { result } = renderHook(() => useAiJourneyMessages(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            await result.current.triggerMessage()
        })

        expect(mockStartPolling).toHaveBeenCalled()
    })

    it('should increment followUpMessagesSent after triggering message', async () => {
        const { result } = renderHook(
            () => ({
                aiJourneyMessages: useAiJourneyMessages(),
                aiJourneyContext: useAIJourneyContext(),
            }),
            {
                wrapper: createWrapper(),
            },
        )

        const initialCount =
            result.current.aiJourneyContext.followUpMessagesSent

        await act(async () => {
            await result.current.aiJourneyMessages.triggerMessage()
        })

        expect(result.current.aiJourneyContext.followUpMessagesSent).toBe(
            initialCount + 1,
        )
    })

    it('should throw error when currentJourney is missing', async () => {
        mockUseJourneys.mockReturnValue({
            data: [],
            isLoading: false,
        })

        const { result } = renderHook(() => useAiJourneyMessages(), {
            wrapper: createWrapper(),
        })

        await expect(async () => {
            await act(async () => {
                await result.current.triggerMessage()
            })
        }).rejects.toThrow('Missing journey or integration configuration')
    })

    it('should throw error when shopifyIntegration is missing', async () => {
        mockUseAppSelector.mockReturnValue([])

        const { result } = renderHook(() => useAiJourneyMessages(), {
            wrapper: createWrapper(),
        })

        await expect(async () => {
            await act(async () => {
                await result.current.triggerMessage()
            })
        }).rejects.toThrow('Missing journey or integration configuration')
    })

    it('should create new test session when testSessionId is not set', async () => {
        mockUseCoreContext.mockReturnValue({
            testSessionId: null,
            isTestSessionLoading: false,
            createTestSession: mockCreateTestSession,
            testSessionLogs: undefined,
            isPolling: false,
            startPolling: mockStartPolling,
            stopPolling: jest.fn(),
            channel: 'chat',
            channelAvailability: 'online',
            onChannelChange: jest.fn(),
            onChannelAvailabilityChange: jest.fn(),
        })

        const { result } = renderHook(() => useAiJourneyMessages(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            await result.current.triggerMessage()
        })

        expect(mockCreateTestSession).toHaveBeenCalled()
        expect(mockMutateAsync).toHaveBeenCalledWith([
            expect.objectContaining({
                testModeSessionId: 'new-session-id',
            }),
        ])
    })

    it('should include journey settings in payload', async () => {
        const { result } = renderHook(
            () => ({
                aiJourneyMessages: useAiJourneyMessages(),
                aiJourneyContext: useAIJourneyContext(),
            }),
            {
                wrapper: createWrapper(),
            },
        )

        await act(async () => {
            result.current.aiJourneyContext.setAIJourneySettings({
                totalFollowUp: 5,
                includeDiscountCode: false,
                discountCodeValue: 20,
                discountCodeMessageIdx: 3,
                outboundMessageInstructions: 'Custom instructions',
            })
        })

        await act(async () => {
            await result.current.aiJourneyMessages.triggerMessage()
        })

        expect(mockMutateAsync).toHaveBeenCalledWith([
            expect.objectContaining({
                journeyMessageInstructions: 'Custom instructions',
                settings: expect.objectContaining({
                    maxFollowUpMessages: 5,
                    offerDiscount: false,
                    maxDiscountPercent: 20,
                    discountCodeMessageThreshold: 3,
                }),
            }),
        ])
    })

    it('should include SMS configuration from journey data', async () => {
        const { result } = renderHook(() => useAiJourneyMessages(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            await result.current.triggerMessage()
        })

        expect(mockMutateAsync).toHaveBeenCalledWith([
            expect.objectContaining({
                settings: expect.objectContaining({
                    smsSenderNumber: '+1234567890',
                    smsSenderIntegrationId: 456,
                }),
            }),
        ])
    })

    it('should set maxDiscountPercent to null when discountCodeValue is undefined', async () => {
        const { result } = renderHook(
            () => ({
                aiJourneyMessages: useAiJourneyMessages(),
                aiJourneyContext: useAIJourneyContext(),
            }),
            {
                wrapper: createWrapper(),
            },
        )

        await act(async () => {
            result.current.aiJourneyContext.setAIJourneySettings({
                totalFollowUp: 5,
                includeDiscountCode: true,
                discountCodeValue: undefined,
                discountCodeMessageIdx: 2,
                outboundMessageInstructions: 'Test instructions',
            })
        })

        await act(async () => {
            await result.current.aiJourneyMessages.triggerMessage()
        })

        expect(mockMutateAsync).toHaveBeenCalledWith([
            expect.objectContaining({
                settings: expect.objectContaining({
                    offerDiscount: true,
                    maxDiscountPercent: null,
                    discountCodeMessageThreshold: 2,
                }),
            }),
        ])
    })
})
