import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { JourneyTypeEnum } from '@gorgias/convert-client'

import {
    useJourneyData,
    useJourneys,
    useUpdateJourney,
} from '../../../../../AIJourney/queries'
import useAppSelector from '../../../../../hooks/useAppSelector'
import { PlaygroundEvent } from '../../types'
import {
    AI_JOURNEY_DEFAULT_STATE,
    AIJourneyProvider,
    useAIJourneyContext,
} from '../AIJourneyContext'
import { useEvents, useSubscribeToEvent } from '../EventsContext'

jest.mock('AIJourney/queries', () => ({
    useJourneyData: jest.fn(),
    useJourneys: jest.fn(),
    useUpdateJourney: jest.fn(),
}))

jest.mock('AIJourney/hooks', () => ({
    useAIJourneyProductList: jest.fn(() => ({
        productList: [],
        isLoading: false,
        error: null,
    })),
}))

jest.mock('AIJourney/providers', () => ({
    TokenProvider: ({ children }: any) => <div>{children}</div>,
}))

jest.mock('hooks/useAppSelector')

jest.mock('pages/aiAgent/PlaygroundV2/contexts/EventsContext', () => ({
    useEvents: jest.fn(),
    useSubscribeToEvent: jest.fn(),
}))

const mockUseJourneys = useJourneys as jest.Mock
const mockUseJourneyData = useJourneyData as jest.Mock
const mockUseUpdateJourney = useUpdateJourney as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock
const mockUseEvents = useEvents as jest.Mock
const mockUseSubscribeToEvent = useSubscribeToEvent as jest.Mock

const mockShopifyIntegrations = [
    { id: 123, name: 'test-shop' },
    { id: 456, name: 'other-shop' },
]

const mockJourneys = [
    {
        id: 'journey-1',
        type: 'cart_abandoned',
        state: 'active',
    },
    {
        id: 'journey-2',
        type: 'session_abandoned',
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
    },
    message_instructions: 'Test instructions',
}

describe('AIJourneyContext', () => {
    let queryClient: QueryClient
    const mockStoreCreator = configureMockStore([thunk])
    let mockEventOn: jest.Mock
    let mockEventEmit: jest.Mock

    const createWrapper = (shopName = 'test-shop') => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        })
        const mockStore = mockStoreCreator({})

        return ({ children }: { children: React.ReactNode }) => (
            <Provider store={mockStore}>
                <QueryClientProvider client={queryClient}>
                    <AIJourneyProvider shopName={shopName}>
                        {children}
                    </AIJourneyProvider>
                </QueryClientProvider>
            </Provider>
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockEventOn = jest.fn()
        mockEventEmit = jest.fn()
        mockUseEvents.mockReturnValue({
            on: mockEventOn,
            emit: mockEventEmit,
        })
        mockUseAppSelector.mockReturnValue(mockShopifyIntegrations)
        mockUseJourneys.mockReturnValue({
            data: mockJourneys,
            isLoading: false,
        })
        mockUseJourneyData.mockImplementation((journeyId) => {
            return {
                data: journeyId === 'journey-1' ? mockJourneyData : undefined,
                isLoading: false,
            }
        })
        mockUseUpdateJourney.mockReturnValue({
            mutateAsync: jest.fn(),
            isLoading: false,
        })
    })

    describe('useAIJourneyContext', () => {
        it('should throw error when used outside provider', () => {
            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {})

            expect(() => {
                renderHook(() => useAIJourneyContext())
            }).toThrow(
                'useAIJourneyContext must be used within AIJourneyProvider',
            )

            consoleErrorSpy.mockRestore()
        })

        it('should return context value when used inside provider', () => {
            const { result } = renderHook(() => useAIJourneyContext(), {
                wrapper: createWrapper(),
            })

            expect(result.current).toBeDefined()
            expect(result.current.shopifyIntegration).toEqual({
                id: 123,
                name: 'test-shop',
            })
            expect(result.current.shopName).toBe('test-shop')
        })
    })

    describe('AIJourneyProvider', () => {
        it('should provide shopifyIntegration based on shopName', () => {
            const { result } = renderHook(() => useAIJourneyContext(), {
                wrapper: createWrapper('test-shop'),
            })

            expect(result.current.shopifyIntegration).toEqual({
                id: 123,
                name: 'test-shop',
            })
        })

        it('should return undefined shopifyIntegration when shop not found', () => {
            const { result } = renderHook(() => useAIJourneyContext(), {
                wrapper: createWrapper('non-existent-shop'),
            })

            expect(result.current.shopifyIntegration).toBeUndefined()
        })

        it('should provide journeys from useJourneys hook', () => {
            const { result } = renderHook(() => useAIJourneyContext(), {
                wrapper: createWrapper(),
            })

            expect(result.current.journeys).toEqual(mockJourneys)
        })

        it('should provide empty array when journeys is undefined', () => {
            mockUseJourneys.mockReturnValue({
                data: undefined,
                isLoading: false,
            })

            const { result } = renderHook(() => useAIJourneyContext(), {
                wrapper: createWrapper(),
            })

            expect(result.current.journeys).toEqual([])
        })

        it('should provide isLoadingJourneys from useJourneys hook', () => {
            mockUseJourneys.mockReturnValue({
                data: mockJourneys,
                isLoading: true,
            })

            const { result } = renderHook(() => useAIJourneyContext(), {
                wrapper: createWrapper(),
            })

            expect(result.current.isLoadingJourneys).toBe(true)
        })

        it('should provide default AI journey settings', () => {
            mockUseJourneyData.mockReturnValue({
                data: undefined,
                isLoading: false,
            })

            const { result } = renderHook(() => useAIJourneyContext(), {
                wrapper: createWrapper(),
            })

            expect(result.current.aiJourneySettings).toEqual({
                ...AI_JOURNEY_DEFAULT_STATE,
                journeyType: 'cart_abandoned',
            })
        })

        it('should merge journey configuration with default settings', () => {
            mockUseJourneyData.mockReturnValue({
                data: mockJourneyData,
                isLoading: false,
            })

            const { result } = renderHook(() => useAIJourneyContext(), {
                wrapper: createWrapper(),
            })

            expect(result.current.aiJourneySettings).toEqual({
                ...AI_JOURNEY_DEFAULT_STATE,
                totalFollowUp: 2,
                includeProductImage: false,
                includeDiscountCode: true,
                discountCodeValue: 15,
                discountCodeMessageIdx: 2,
                outboundMessageInstructions: 'Test instructions',
            })
        })

        it('should provide isLoadingJourneyData from useJourneyData hook', () => {
            mockUseJourneyData.mockReturnValue({
                data: undefined,
                isLoading: true,
            })

            const { result } = renderHook(() => useAIJourneyContext(), {
                wrapper: createWrapper(),
            })

            expect(result.current.isLoadingJourneyData).toBe(true)
        })

        it('should provide isSavingJourneyData from useUpdateJourney hook', () => {
            mockUseUpdateJourney.mockReturnValue({
                mutateAsync: jest.fn(),
                isLoading: true,
            })

            const { result } = renderHook(() => useAIJourneyContext(), {
                wrapper: createWrapper(),
            })

            expect(result.current.isSavingJourneyData).toBe(true)
        })

        describe('setAIJourneySettings', () => {
            it('should update AI journey settings', () => {
                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                act(() => {
                    result.current.setAIJourneySettings({
                        totalFollowUp: 3,
                    })
                })

                expect(result.current.aiJourneySettings.totalFollowUp).toBe(3)
            })

            it('should merge multiple settings updates', () => {
                mockUseJourneyData.mockReturnValue({
                    data: undefined,
                    isLoading: false,
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                act(() => {
                    result.current.setAIJourneySettings({
                        totalFollowUp: 3,
                        includeProductImage: false,
                    })
                })

                act(() => {
                    result.current.setAIJourneySettings({
                        discountCodeValue: 25,
                    })
                })

                expect(result.current.aiJourneySettings).toEqual({
                    ...AI_JOURNEY_DEFAULT_STATE,
                    journeyType: 'cart_abandoned',
                    totalFollowUp: 3,
                    includeProductImage: false,
                    discountCodeValue: 25,
                })
            })

            it('should update journeyType and trigger journey data fetch', () => {
                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                act(() => {
                    result.current.setAIJourneySettings({
                        journeyType: JourneyTypeEnum.SessionAbandoned,
                    })
                })

                expect(result.current.aiJourneySettings.journeyType).toBe(
                    JourneyTypeEnum.SessionAbandoned,
                )
            })
        })

        describe('resetAIJourneySettings', () => {
            it('should reset settings to defaults', () => {
                mockUseJourneyData.mockReturnValue({
                    data: undefined,
                    isLoading: false,
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                act(() => {
                    result.current.setAIJourneySettings({
                        totalFollowUp: 5,
                        discountCodeValue: 30,
                    })
                })

                expect(result.current.aiJourneySettings.totalFollowUp).toBe(5)

                act(() => {
                    result.current.resetAIJourneySettings()
                })

                expect(result.current.aiJourneySettings).toEqual({
                    ...AI_JOURNEY_DEFAULT_STATE,
                    journeyType: 'cart_abandoned',
                })
            })

            it('should preserve journey configuration after reset', () => {
                mockUseJourneyData.mockReturnValue({
                    data: mockJourneyData,
                    isLoading: false,
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                act(() => {
                    result.current.setAIJourneySettings({
                        totalFollowUp: 5,
                    })
                })

                expect(result.current.aiJourneySettings.totalFollowUp).toBe(5)

                act(() => {
                    result.current.resetAIJourneySettings()
                })

                expect(result.current.aiJourneySettings.totalFollowUp).toBe(2)
            })
        })

        describe('saveAIJourneySettings', () => {
            it('should call mutateAsync with correct parameters', async () => {
                const mockMutateAsync = jest.fn().mockResolvedValue({})
                mockUseUpdateJourney.mockReturnValue({
                    mutateAsync: mockMutateAsync,
                    isLoading: false,
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                act(() => {
                    result.current.setAIJourneySettings({
                        journeyType: JourneyTypeEnum.CartAbandoned,
                        totalFollowUp: 3,
                        outboundMessageInstructions: 'Updated instructions',
                    })
                })

                await act(async () => {
                    await result.current.saveAIJourneySettings()
                })

                expect(mockMutateAsync).toHaveBeenCalledWith({
                    params: {
                        state: 'active',
                        message_instructions: 'Updated instructions',
                    },
                    journeyId: 'journey-1',
                    journeyConfigs: {
                        max_follow_up_messages: 3,
                        include_image: false,
                        offer_discount: true,
                        max_discount_percent: 15,
                        discount_code_message_threshold: 2,
                    },
                })
            })

            it('should not call mutateAsync when currentJourney is undefined', async () => {
                const mockMutateAsync = jest.fn().mockResolvedValue({})
                mockUseUpdateJourney.mockReturnValue({
                    mutateAsync: mockMutateAsync,
                    isLoading: false,
                })

                mockUseJourneys.mockReturnValue({
                    data: [],
                    isLoading: false,
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                await act(async () => {
                    await result.current.saveAIJourneySettings()
                })

                expect(mockMutateAsync).not.toHaveBeenCalled()
            })

            it('should handle save errors gracefully', async () => {
                const mockError = new Error('Save failed')
                const mockMutateAsync = jest.fn().mockRejectedValue(mockError)
                mockUseUpdateJourney.mockReturnValue({
                    mutateAsync: mockMutateAsync,
                    isLoading: false,
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                act(() => {
                    result.current.setAIJourneySettings({
                        journeyType: JourneyTypeEnum.CartAbandoned,
                    })
                })

                try {
                    await act(async () => {
                        await result.current.saveAIJourneySettings()
                    })
                    throw new Error('Test should have caught an error')
                } catch (error) {
                    expect((error as Error).message).toBe('Save failed')
                }
            })
        })

        describe('journey selection', () => {
            it('should automatically set journeyType to first journey when journeys load', () => {
                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                expect(result.current.aiJourneySettings.journeyType).toBe(
                    'cart_abandoned',
                )
                expect(result.current.currentJourney).toEqual(mockJourneys[0])
            })

            it('should select correct journey based on journey type', () => {
                let capturedJourneyId: any
                let capturedOptions: any
                mockUseJourneyData.mockImplementation((journeyId, options) => {
                    capturedJourneyId = journeyId
                    capturedOptions = options
                    return {
                        data: mockJourneyData,
                        isLoading: false,
                    }
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                act(() => {
                    result.current.setAIJourneySettings({
                        journeyType: JourneyTypeEnum.CartAbandoned,
                    })
                })

                expect(mockUseJourneyData).toHaveBeenCalled()
                expect(capturedJourneyId).toBe('journey-1')
                expect(capturedOptions.enabled).toBe(true)
            })

            it('should update journey selection when journey type changes', () => {
                const { result, rerender } = renderHook(
                    () => useAIJourneyContext(),
                    {
                        wrapper: createWrapper(),
                    },
                )

                act(() => {
                    result.current.setAIJourneySettings({
                        journeyType: JourneyTypeEnum.SessionAbandoned,
                    })
                })

                rerender()

                expect(mockUseJourneyData).toHaveBeenCalledWith(
                    'journey-2',
                    expect.objectContaining({
                        enabled: true,
                    }),
                )
            })

            it('should handle journey type with hyphens correctly', () => {
                const customJourneys = [
                    {
                        id: 'journey-3',
                        type: 'cart_abandoned',
                        state: 'active',
                    },
                ]

                mockUseJourneys.mockReturnValue({
                    data: customJourneys,
                    isLoading: false,
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                act(() => {
                    result.current.setAIJourneySettings({
                        journeyType: 'cart-abandoned' as JourneyTypeEnum,
                    })
                })

                expect(mockUseJourneyData).toHaveBeenCalledWith(
                    'journey-3',
                    expect.objectContaining({
                        enabled: true,
                    }),
                )
            })
        })

        describe('configuration parsing', () => {
            it('should handle journey data with configuration', () => {
                mockUseJourneyData.mockReturnValue({
                    data: mockJourneyData,
                    isLoading: false,
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                expect(result.current.aiJourneySettings).toMatchObject({
                    totalFollowUp: 2,
                    includeProductImage: false,
                    includeDiscountCode: true,
                    discountCodeValue: 15,
                    discountCodeMessageIdx: 2,
                    outboundMessageInstructions: 'Test instructions',
                })
            })

            it('should handle journey data without configuration', () => {
                mockUseJourneyData.mockReturnValue({
                    data: {},
                    isLoading: false,
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                expect(result.current.aiJourneySettings).toEqual(
                    AI_JOURNEY_DEFAULT_STATE,
                )
            })

            it('should handle journey data with partial configuration', () => {
                mockUseJourneyData.mockReturnValue({
                    data: {
                        configuration: {
                            max_follow_up_messages: 4,
                        },
                    },
                    isLoading: false,
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                expect(result.current.aiJourneySettings).toMatchObject({
                    totalFollowUp: 4,
                    journeyType: JourneyTypeEnum.CartAbandoned,
                    selectedProduct: null,
                    outboundMessageInstructions: '',
                })
            })

            it('should handle journey data without message_instructions', () => {
                mockUseJourneyData.mockReturnValue({
                    data: {
                        configuration: mockJourneyData.configuration,
                    },
                    isLoading: false,
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                expect(
                    result.current.aiJourneySettings
                        .outboundMessageInstructions,
                ).toBe('')
            })
        })

        describe('hook query options', () => {
            it('should disable useJourneys when shopifyIntegration is undefined', () => {
                mockUseAppSelector.mockReturnValue([])

                renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                expect(mockUseJourneys).toHaveBeenCalledWith(
                    undefined,
                    [
                        JourneyTypeEnum.CartAbandoned,
                        JourneyTypeEnum.SessionAbandoned,
                    ],
                    {
                        enabled: false,
                    },
                )
            })

            it('should enable useJourneys when shopifyIntegration exists', () => {
                renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                expect(mockUseJourneys).toHaveBeenCalledWith(
                    123,
                    [
                        JourneyTypeEnum.CartAbandoned,
                        JourneyTypeEnum.SessionAbandoned,
                    ],
                    {
                        enabled: true,
                    },
                )
            })

            it('should disable useJourneyData when currentJourney is undefined', () => {
                mockUseJourneys.mockReturnValue({
                    data: [],
                    isLoading: false,
                })

                mockUseJourneyData.mockReset()
                mockUseJourneyData.mockReturnValue({
                    data: undefined,
                    isLoading: false,
                })

                renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                expect(mockUseJourneyData).toHaveBeenCalled()
                const calls = mockUseJourneyData.mock.calls
                const firstCall = calls[0]
                expect(firstCall[0]).toBeUndefined()
                expect(firstCall[1].enabled).toBeFalsy()
            })
        })

        describe('local settings priority', () => {
            it('should prioritize local settings over journey configuration', () => {
                mockUseJourneyData.mockReturnValue({
                    data: mockJourneyData,
                    isLoading: false,
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                expect(result.current.aiJourneySettings.totalFollowUp).toBe(2)

                act(() => {
                    result.current.setAIJourneySettings({
                        totalFollowUp: 7,
                    })
                })

                expect(result.current.aiJourneySettings.totalFollowUp).toBe(7)
            })

            it('should apply local settings on top of configuration and defaults', () => {
                mockUseJourneyData.mockReturnValue({
                    data: {
                        configuration: {
                            max_follow_up_messages: 2,
                            include_image: false,
                        },
                    },
                    isLoading: false,
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                act(() => {
                    result.current.setAIJourneySettings({
                        discountCodeValue: 20,
                    })
                })

                expect(result.current.aiJourneySettings).toMatchObject({
                    totalFollowUp: 2,
                    includeProductImage: false,
                    discountCodeValue: 20,
                    journeyType: JourneyTypeEnum.CartAbandoned,
                    selectedProduct: null,
                    outboundMessageInstructions: '',
                })
            })
        })

        describe('followUpMessagesSent', () => {
            it('should initialize followUpMessagesSent to 0', () => {
                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                expect(result.current.followUpMessagesSent).toBe(0)
            })

            it('should allow updating followUpMessagesSent', () => {
                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                act(() => {
                    result.current.setFollowUpMessagesSent(3)
                })

                expect(result.current.followUpMessagesSent).toBe(3)
            })

            it('should reset followUpMessagesSent to 0 when RESET_CONVERSATION event is emitted', () => {
                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                act(() => {
                    result.current.setFollowUpMessagesSent(5)
                })

                expect(result.current.followUpMessagesSent).toBe(5)

                const subscribeCall = mockUseSubscribeToEvent.mock.calls.find(
                    (call) => call[0] === PlaygroundEvent.RESET_CONVERSATION,
                )

                expect(subscribeCall).toBeDefined()

                const resetCallback = subscribeCall?.[1]

                act(() => {
                    resetCallback()
                })

                expect(result.current.followUpMessagesSent).toBe(0)
            })
        })
    })
})
