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
    included_audience_list_ids: [],
    excluded_audience_list_ids: [],
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

            expect(result.current.flows).toEqual(mockJourneys)
        })

        it('should provide empty array when journeys is undefined', () => {
            mockUseJourneys.mockReturnValue({
                data: undefined,
                isLoading: false,
            })

            const { result } = renderHook(() => useAIJourneyContext(), {
                wrapper: createWrapper(),
            })

            expect(result.current.flows).toEqual([])
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
                journeyId: 'journey-1',
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
                journeyId: 'journey-1',
                totalFollowUp: 2,
                includeProductImage: false,
                includeDiscountCode: true,
                discountCodeValue: 15,
                discountCodeMessageIdx: 2,
                outboundMessageInstructions: 'Test instructions',
                inactiveDays: undefined,
                cooldownPeriod: undefined,
                postPurchaseWaitInMinutes: undefined,
                targetOrderStatus: undefined,
                waitTimeMinutes: undefined,
            })
        })

        it('should send inactiveDays and cooldownPeriod for win-back flows', () => {
            mockUseJourneyData.mockReturnValue({
                data: {
                    ...mockJourneyData,
                    type: 'win_back',
                    configuration: {
                        ...mockJourneyData.configuration,
                        inactive_days: 30,
                        cooldown_days: 90,
                    },
                },
                isLoading: false,
            })

            const { result } = renderHook(() => useAIJourneyContext(), {
                wrapper: createWrapper(),
            })

            expect(result.current.aiJourneySettings).toEqual({
                ...AI_JOURNEY_DEFAULT_STATE,
                journeyId: 'journey-1',
                totalFollowUp: 2,
                includeProductImage: false,
                includeDiscountCode: true,
                discountCodeValue: 15,
                discountCodeMessageIdx: 2,
                outboundMessageInstructions: 'Test instructions',
                inactiveDays: 30,
                cooldownPeriod: 90,
                postPurchaseWaitInMinutes: undefined,
                targetOrderStatus: undefined,
                waitTimeMinutes: undefined,
            })
        })

        it('should send trigger event and wait time for post-purchase flow', () => {
            mockUseJourneyData.mockReturnValue({
                data: {
                    ...mockJourneyData,
                    type: JourneyTypeEnum.PostPurchase,
                    configuration: {
                        ...mockJourneyData.configuration,
                        target_order_status: 'order_placed',
                        post_purchase_wait_minutes: 10,
                    },
                },
                isLoading: false,
            })

            const { result } = renderHook(() => useAIJourneyContext(), {
                wrapper: createWrapper(),
            })

            expect(result.current.aiJourneySettings).toEqual({
                ...AI_JOURNEY_DEFAULT_STATE,
                journeyId: 'journey-1',
                totalFollowUp: 2,
                includeProductImage: false,
                includeDiscountCode: true,
                discountCodeValue: 15,
                discountCodeMessageIdx: 2,
                outboundMessageInstructions: 'Test instructions',
                inactiveDays: undefined,
                cooldownPeriod: undefined,
                targetOrderStatus: 'order_placed',
                postPurchaseWaitInMinutes: 10,
                waitTimeMinutes: undefined,
            })
        })

        it('should parse wait time for welcome flow', () => {
            mockUseJourneyData.mockReturnValue({
                data: {
                    ...mockJourneyData,
                    type: JourneyTypeEnum.Welcome,
                    configuration: {
                        ...mockJourneyData.configuration,
                        wait_time_minutes: 15,
                    },
                },
                isLoading: false,
            })

            const { result } = renderHook(() => useAIJourneyContext(), {
                wrapper: createWrapper(),
            })

            expect(result.current.aiJourneySettings).toEqual({
                ...AI_JOURNEY_DEFAULT_STATE,
                journeyId: 'journey-1',
                totalFollowUp: 2,
                includeProductImage: false,
                includeDiscountCode: true,
                discountCodeValue: 15,
                discountCodeMessageIdx: 2,
                outboundMessageInstructions: 'Test instructions',
                inactiveDays: undefined,
                cooldownPeriod: undefined,
                targetOrderStatus: undefined,
                postPurchaseWaitInMinutes: undefined,
                waitTimeMinutes: 15,
            })
        })

        it('should handle welcome flow without wait_time_minutes', () => {
            mockUseJourneyData.mockReturnValue({
                data: {
                    ...mockJourneyData,
                    type: JourneyTypeEnum.Welcome,
                    configuration: {
                        ...mockJourneyData.configuration,
                    },
                },
                isLoading: false,
            })

            const { result } = renderHook(() => useAIJourneyContext(), {
                wrapper: createWrapper(),
            })

            expect(
                result.current.aiJourneySettings.waitTimeMinutes,
            ).toBeUndefined()
            expect(result.current.aiJourneySettings.totalFollowUp).toBe(2)
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
                    journeyId: 'journey-1',
                    totalFollowUp: 3,
                    includeProductImage: false,
                    discountCodeValue: 25,
                })
            })

            it('should update journeyId and trigger journey data fetch', () => {
                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                act(() => {
                    result.current.setAIJourneySettings({
                        journeyId: 'some-id',
                    })
                })

                expect(result.current.aiJourneySettings.journeyId).toBe(
                    'some-id',
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
                    journeyId: 'journey-1',
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
                        journeyId: 'journey-1',
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
                        excluded_audience_list_ids: [],
                        included_audience_list_ids: [],
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
                        journeyId: 'journey-1',
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
            it('should automatically set journeyId to first journey when journeys load', () => {
                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                expect(result.current.aiJourneySettings.journeyId).toBe(
                    'journey-1',
                )
                expect(result.current.currentJourney).toEqual(mockJourneys[0])
            })

            it('should automatically set journeyId to first campaign when no flows exist', () => {
                const mockCampaigns = [
                    {
                        id: 'campaign-1',
                        type: 'campaign',
                        state: 'active',
                    },
                    {
                        id: 'campaign-2',
                        type: 'campaign',
                        state: 'active',
                    },
                ]

                mockUseJourneys.mockReturnValue({
                    data: mockCampaigns,
                    isLoading: false,
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                expect(result.current.aiJourneySettings.journeyId).toBe(
                    'campaign-1',
                )
            })

            it('should select correct journey based on journey ID', () => {
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
                        journeyId: 'journey-1',
                    })
                })

                expect(mockUseJourneyData).toHaveBeenCalled()
                expect(capturedJourneyId).toBe('journey-1')
                expect(capturedOptions.enabled).toBe(true)
            })

            it('should update journey selection when journey ID changes', () => {
                const { result, rerender } = renderHook(
                    () => useAIJourneyContext(),
                    {
                        wrapper: createWrapper(),
                    },
                )

                act(() => {
                    result.current.setAIJourneySettings({
                        journeyId: 'journey-2',
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

                expect(result.current.aiJourneySettings).toEqual({
                    ...AI_JOURNEY_DEFAULT_STATE,
                    journeyId: mockJourneys[0].id,
                })
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

            it('should parse media_urls from campaign configuration', () => {
                const mockMediaUrls = [
                    {
                        url: 'https://example.com/image.jpg',
                        name: 'Campaign Image',
                    },
                ]
                mockUseJourneyData.mockReturnValue({
                    data: {
                        ...mockJourneyData,
                        type: JourneyTypeEnum.Campaign,
                        configuration: {
                            ...mockJourneyData.configuration,
                            media_urls: mockMediaUrls,
                        },
                    },
                    isLoading: false,
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                expect(result.current.aiJourneySettings.mediaUrls).toEqual(
                    mockMediaUrls,
                )
            })

            it('should set mediaUrls to undefined for non-campaign journeys', () => {
                mockUseJourneyData.mockReturnValue({
                    data: {
                        ...mockJourneyData,
                        type: JourneyTypeEnum.CartAbandoned,
                        configuration: {
                            ...mockJourneyData.configuration,
                        },
                    },
                    isLoading: false,
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                expect(
                    result.current.aiJourneySettings.mediaUrls,
                ).toBeUndefined()
            })
        })

        describe('hook query options', () => {
            it('should disable useJourneys when shopifyIntegration is undefined', () => {
                mockUseAppSelector.mockReturnValue([])

                renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                expect(mockUseJourneys).toHaveBeenCalledWith(undefined, [], {
                    enabled: false,
                })
            })

            it('should enable useJourneys when shopifyIntegration exists', () => {
                renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                expect(mockUseJourneys).toHaveBeenCalledWith(123, [], {
                    enabled: true,
                })
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

        describe('hasInvalidFields', () => {
            it('should return false when journey is not post-purchase', () => {
                mockUseJourneyData.mockReturnValue({
                    data: {
                        ...mockJourneyData,
                        type: JourneyTypeEnum.CartAbandoned,
                    },
                    isLoading: false,
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                expect(result.current.hasInvalidFields).toBe(false)
            })

            it('should return false when post-purchase wait time is undefined', () => {
                mockUseJourneyData.mockReturnValue({
                    data: {
                        ...mockJourneyData,
                        type: JourneyTypeEnum.PostPurchase,
                        configuration: {
                            ...mockJourneyData.configuration,
                            post_purchase_wait_minutes: undefined,
                        },
                    },
                    isLoading: false,
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                expect(result.current.hasInvalidFields).toBe(false)
            })

            it('should return false when post-purchase wait time is within valid range', () => {
                mockUseJourneyData.mockReturnValue({
                    data: {
                        ...mockJourneyData,
                        type: JourneyTypeEnum.PostPurchase,
                        configuration: {
                            ...mockJourneyData.configuration,
                            post_purchase_wait_minutes: 5000,
                        },
                    },
                    isLoading: false,
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                expect(result.current.hasInvalidFields).toBe(false)
            })

            it('should return false when post-purchase wait time equals MAX_WAIT_TIME', () => {
                const MAX_WAIT_TIME = 10080
                mockUseJourneyData.mockReturnValue({
                    data: {
                        ...mockJourneyData,
                        type: JourneyTypeEnum.PostPurchase,
                        configuration: {
                            ...mockJourneyData.configuration,
                            post_purchase_wait_minutes: MAX_WAIT_TIME,
                        },
                    },
                    isLoading: false,
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                expect(result.current.hasInvalidFields).toBe(false)
            })

            it('should return true when post-purchase wait time exceeds MAX_WAIT_TIME', () => {
                const mockPostPurchaseJourneys = [
                    {
                        id: 'journey-1',
                        type: JourneyTypeEnum.PostPurchase,
                        state: 'active',
                    },
                ]

                mockUseJourneys.mockReturnValue({
                    data: mockPostPurchaseJourneys,
                    isLoading: false,
                })

                mockUseJourneyData.mockReturnValue({
                    data: {
                        ...mockJourneyData,
                        type: JourneyTypeEnum.PostPurchase,
                        configuration: {
                            ...mockJourneyData.configuration,
                            post_purchase_wait_minutes: 10081,
                        },
                    },
                    isLoading: false,
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                expect(result.current.hasInvalidFields).toBe(true)
            })

            it('should update hasInvalidFields when postPurchaseWaitInMinutes is changed', () => {
                const mockPostPurchaseJourneys = [
                    {
                        id: 'journey-1',
                        type: JourneyTypeEnum.PostPurchase,
                        state: 'active',
                    },
                ]

                mockUseJourneys.mockReturnValue({
                    data: mockPostPurchaseJourneys,
                    isLoading: false,
                })

                mockUseJourneyData.mockReturnValue({
                    data: {
                        ...mockJourneyData,
                        type: JourneyTypeEnum.PostPurchase,
                        configuration: {
                            ...mockJourneyData.configuration,
                            post_purchase_wait_minutes: 100,
                        },
                    },
                    isLoading: false,
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                expect(result.current.hasInvalidFields).toBe(false)

                act(() => {
                    result.current.setAIJourneySettings({
                        postPurchaseWaitInMinutes: 20000,
                    })
                })

                expect(result.current.hasInvalidFields).toBe(true)
            })

            it('should become valid when invalid field is corrected', () => {
                const mockPostPurchaseJourneys = [
                    {
                        id: 'journey-1',
                        type: JourneyTypeEnum.PostPurchase,
                        state: 'active',
                    },
                ]

                mockUseJourneys.mockReturnValue({
                    data: mockPostPurchaseJourneys,
                    isLoading: false,
                })

                mockUseJourneyData.mockReturnValue({
                    data: {
                        ...mockJourneyData,
                        type: JourneyTypeEnum.PostPurchase,
                        configuration: {
                            ...mockJourneyData.configuration,
                            post_purchase_wait_minutes: 15000,
                        },
                    },
                    isLoading: false,
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                expect(result.current.hasInvalidFields).toBe(true)

                act(() => {
                    result.current.setAIJourneySettings({
                        postPurchaseWaitInMinutes: 5000,
                    })
                })

                expect(result.current.hasInvalidFields).toBe(false)
            })

            it('should return false when journey type changes from post-purchase to other type', () => {
                const mockPostPurchaseJourneys = [
                    {
                        id: 'journey-1',
                        type: JourneyTypeEnum.PostPurchase,
                        state: 'active',
                    },
                    {
                        id: 'journey-2',
                        type: JourneyTypeEnum.CartAbandoned,
                        state: 'active',
                    },
                ]

                mockUseJourneys.mockReturnValue({
                    data: mockPostPurchaseJourneys,
                    isLoading: false,
                })

                mockUseJourneyData.mockImplementation((journeyId) => {
                    if (journeyId === 'journey-1') {
                        return {
                            data: {
                                ...mockJourneyData,
                                type: JourneyTypeEnum.PostPurchase,
                                configuration: {
                                    ...mockJourneyData.configuration,
                                    post_purchase_wait_minutes: 15000,
                                },
                            },
                            isLoading: false,
                        }
                    }
                    return {
                        data: {
                            ...mockJourneyData,
                            type: JourneyTypeEnum.CartAbandoned,
                        },
                        isLoading: false,
                    }
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                expect(result.current.hasInvalidFields).toBe(true)

                act(() => {
                    result.current.setAIJourneySettings({
                        journeyId: 'journey-2',
                    })
                })

                expect(result.current.hasInvalidFields).toBe(false)
            })

            it('should return true when postPurchaseWaitInMinutes is explicitly set to undefined', () => {
                const mockPostPurchaseJourneys = [
                    {
                        id: 'journey-1',
                        type: JourneyTypeEnum.PostPurchase,
                        state: 'active',
                    },
                ]

                mockUseJourneys.mockReturnValue({
                    data: mockPostPurchaseJourneys,
                    isLoading: false,
                })

                mockUseJourneyData.mockReturnValue({
                    data: {
                        ...mockJourneyData,
                        type: JourneyTypeEnum.PostPurchase,
                        configuration: {
                            ...mockJourneyData.configuration,
                        },
                    },
                    isLoading: false,
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                act(() => {
                    result.current.setAIJourneySettings({
                        postPurchaseWaitInMinutes: undefined,
                    })
                })

                expect(result.current.hasInvalidFields).toBe(true)
            })

            it('should return true when postPurchaseWaitInMinutes is NaN', () => {
                const mockPostPurchaseJourneys = [
                    {
                        id: 'journey-1',
                        type: JourneyTypeEnum.PostPurchase,
                        state: 'active',
                    },
                ]

                mockUseJourneys.mockReturnValue({
                    data: mockPostPurchaseJourneys,
                    isLoading: false,
                })

                mockUseJourneyData.mockReturnValue({
                    data: {
                        ...mockJourneyData,
                        type: JourneyTypeEnum.PostPurchase,
                        configuration: {
                            ...mockJourneyData.configuration,
                        },
                    },
                    isLoading: false,
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                act(() => {
                    result.current.setAIJourneySettings({
                        postPurchaseWaitInMinutes: NaN,
                    })
                })

                expect(result.current.hasInvalidFields).toBe(true)
            })

            it('should return false when welcome journey has valid wait time', () => {
                const mockWelcomeJourneys = [
                    {
                        id: 'journey-1',
                        type: JourneyTypeEnum.Welcome,
                        state: 'active',
                    },
                ]

                mockUseJourneys.mockReturnValue({
                    data: mockWelcomeJourneys,
                    isLoading: false,
                })

                mockUseJourneyData.mockReturnValue({
                    data: {
                        ...mockJourneyData,
                        type: JourneyTypeEnum.Welcome,
                        configuration: {
                            ...mockJourneyData.configuration,
                            wait_time_minutes: 5000,
                        },
                    },
                    isLoading: false,
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                act(() => {
                    result.current.setAIJourneySettings({
                        journeyId: 'journey-1',
                    })
                })

                expect(result.current.hasInvalidFields).toBe(false)
            })

            it('should return true when welcome journey wait time exceeds MAX_WAIT_TIME', () => {
                const mockWelcomeJourneys = [
                    {
                        id: 'journey-1',
                        type: JourneyTypeEnum.Welcome,
                        state: 'active',
                    },
                ]

                mockUseJourneys.mockReturnValue({
                    data: mockWelcomeJourneys,
                    isLoading: false,
                })

                mockUseJourneyData.mockReturnValue({
                    data: {
                        ...mockJourneyData,
                        type: JourneyTypeEnum.Welcome,
                        configuration: {
                            ...mockJourneyData.configuration,
                            wait_time_minutes: 15000,
                        },
                    },
                    isLoading: false,
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                act(() => {
                    result.current.setAIJourneySettings({
                        journeyId: 'journey-1',
                    })
                })

                expect(result.current.hasInvalidFields).toBe(true)
            })

            it('should return true when waitTimeMinutes is explicitly set to undefined for welcome journey', () => {
                const mockWelcomeJourneys = [
                    {
                        id: 'journey-1',
                        type: JourneyTypeEnum.Welcome,
                        state: 'active',
                    },
                ]

                mockUseJourneys.mockReturnValue({
                    data: mockWelcomeJourneys,
                    isLoading: false,
                })

                mockUseJourneyData.mockReturnValue({
                    data: {
                        ...mockJourneyData,
                        type: JourneyTypeEnum.Welcome,
                        configuration: {
                            ...mockJourneyData.configuration,
                        },
                    },
                    isLoading: false,
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                act(() => {
                    result.current.setAIJourneySettings({
                        journeyId: 'journey-1',
                        waitTimeMinutes: undefined,
                    })
                })

                expect(result.current.hasInvalidFields).toBe(true)
            })

            it('should return true when waitTimeMinutes is NaN for welcome journey', () => {
                const mockWelcomeJourneys = [
                    {
                        id: 'journey-1',
                        type: JourneyTypeEnum.Welcome,
                        state: 'active',
                    },
                ]

                mockUseJourneys.mockReturnValue({
                    data: mockWelcomeJourneys,
                    isLoading: false,
                })

                mockUseJourneyData.mockReturnValue({
                    data: {
                        ...mockJourneyData,
                        type: JourneyTypeEnum.Welcome,
                        configuration: {
                            ...mockJourneyData.configuration,
                        },
                    },
                    isLoading: false,
                })

                const { result } = renderHook(() => useAIJourneyContext(), {
                    wrapper: createWrapper(),
                })

                act(() => {
                    result.current.setAIJourneySettings({
                        journeyId: 'journey-1',
                        waitTimeMinutes: NaN,
                    })
                })

                expect(result.current.hasInvalidFields).toBe(true)
            })
        })
    })
})
