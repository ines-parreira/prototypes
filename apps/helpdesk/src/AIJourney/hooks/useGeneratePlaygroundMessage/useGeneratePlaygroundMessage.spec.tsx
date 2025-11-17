import { assumeMock } from '@repo/testing'
import { act, renderHook } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { JourneyStatusEnum, JourneyTypeEnum } from '@gorgias/convert-client'
import { IntegrationType } from '@gorgias/helpdesk-types'

import type { Product } from 'constants/integrations/types/shopify'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    useCreateTestSessionMutation,
    useTriggerAIJourney,
} from 'models/aiAgent/queries'
import type { GetTestSessionLogsResponse } from 'models/aiAgentPlayground/types'
import { TestSessionLogType } from 'models/aiAgentPlayground/types'
import { usePlaygroundPolling } from 'pages/aiAgent/Playground/hooks/usePlaygroundPolling'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useGeneratePlaygroundMessage } from './useGeneratePlaygroundMessage'

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(),
}))

jest.mock('hooks/useAppDispatch', () => jest.fn())
const mockUseAppDispatch = assumeMock(useAppDispatch)

jest.mock('models/aiAgent/queries', () => ({
    useCreateTestSessionMutation: jest.fn(),
    useTriggerAIJourney: jest.fn(),
}))

const mockedUseCreateTestSessionMutation = jest.mocked(
    useCreateTestSessionMutation,
)
const mockeduUseTriggerAIJourney = jest.mocked(useTriggerAIJourney)

jest.mock('pages/aiAgent/Playground/hooks/usePlaygroundPolling', () => ({
    usePlaygroundPolling: jest.fn(),
}))
const mockedUsePlaygroundPolling = jest.mocked(usePlaygroundPolling)

const hookParameters = {
    journey: {
        id: '01JZJYRGEYYSE0ABKN756HW2CP',
        type: JourneyTypeEnum.CartAbandoned,
        account_id: 69822,
        store_integration_id: 122834,
        store_name: 'arthur-gorgias',
        store_type: 'shopify',
        state: JourneyStatusEnum.Active,
        message_instructions: '- Don\'t say "hey", instead say "blu-blu-blu"',
        created_datetime: '2025-07-07T17:25:55.295764',
        meta: {
            ticket_view_id: 4373385,
        },
    },
    currentIntegration: {
        id: 122834,
        name: 'arthur-gorgias',
        type: IntegrationType.Shopify,
        meta: { ticket_view_id: 123, shop_domain: 'shop-domain' },
    },
    journeyParams: {
        max_follow_up_messages: 3,
        sms_sender_number: '+18559423482',
        sms_sender_integration_id: 131327,
        offer_discount: true,
        max_discount_percent: 97,
        discount_code_message_threshold: 1,
        include_image: false,
    },
    journeyType: 'cart_abandoned' as JourneyTypeEnum,
    selectedProduct: {
        id: 8531448332426,
        title: 'ADIDAS | CLASSIC BACKPACK | LEGEND INK MULTICOLOUR',
        handle: 'product-handle',
        variants: [
            {
                id: 46190204387466,
                sku: 'AD-04\r\n-OS-blue',
                price: '50.00',
                title: 'OS / blue',
            },
        ],
    } as unknown as Product,
    totalMessagesToBeGenerated: 2,
    journeyMessageInstructions: '- Don\'t say "hey", instead say "blu-blu-blu"',
}

describe('useGeneratePlaygroundMessage', () => {
    const mockDispatch = jest.fn()
    const mockCreateTestSession = jest.fn()
    const mockTriggerAIJourney = jest.fn()
    const mockStartPolling = jest.fn()
    const mockStopPolling = jest.fn()

    const testSessionLogs = {
        id: '123',
        status: 'finished' as const,
        logs: [
            {
                id: 'b5991571-86f8-403d-8414-f4e6b8fd57da',
                data: {
                    message: 'AI Journey triggered',
                },
                type: 'shopper-message' as TestSessionLogType,
            },
            {
                id: '566c50b5-f4f3-4467-83f0-a54275681aae',
                data: {
                    message: 'message-1',
                    isSalesOpportunity: false,
                    isSalesDiscount: true,
                    isSalesOpportunityFieldId: 33778,
                    isSalesDiscountFieldId: 33779,
                },
                type: TestSessionLogType.AI_AGENT_REPLY,
            },
            {
                id: 'e8e79cc1-45cf-4d2f-9904-f660ec1b2e4f',
                data: {
                    message: 'message-2',
                    isSalesOpportunity: false,
                    isSalesDiscount: true,
                    isSalesOpportunityFieldId: 33778,
                    isSalesDiscountFieldId: 33779,
                },
                type: TestSessionLogType.AI_AGENT_REPLY,
            },
        ],
    } as GetTestSessionLogsResponse

    const mockStore = configureMockStore([thunk])({
        currentAccount: fromJS({
            id: hookParameters.journey.account_id,
        }),
    })

    beforeEach(() => {
        jest.clearAllMocks()

        mockedUseCreateTestSessionMutation.mockReturnValue({
            mutateAsync: mockCreateTestSession,
            isLoading: false,
            data: {
                testModeSession: {
                    id: 'de363362-ae41-4c81-ad3d-82d9186c073e',
                    accountId: 69822,
                    creatorUserId: 402720563,
                    createdDatetime: '2025-09-25T13:53:33.393Z',
                },
            },
            error: null,
        } as unknown as ReturnType<typeof useCreateTestSessionMutation>)

        mockeduUseTriggerAIJourney.mockReturnValue({
            mutateAsync: mockTriggerAIJourney,
            isLoading: false,
            data: undefined,
            error: null,
        } as unknown as ReturnType<typeof useTriggerAIJourney>)

        jest.mocked(usePlaygroundPolling).mockReturnValue({
            testSessionLogs: { logs: [], status: 'idle', id: '1' },
            startPolling: mockStartPolling,
            stopPolling: mockStopPolling,
            isPolling: false,
        })

        mockUseAppDispatch.mockReturnValue(mockDispatch)
    })

    describe('error handling', () => {
        it('should notify if no product is selected', async () => {
            const { result } = renderHook(
                () =>
                    useGeneratePlaygroundMessage({
                        ...hookParameters,
                        selectedProduct: null,
                    }),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore}>{children}</Provider>
                    ),
                },
            )

            await act(async () => {
                await result.current.handleGenerateMessages()
            })

            expect(mockDispatch).toHaveBeenCalledWith(
                notify({
                    message: 'Please select a product',
                    status: NotificationStatus.Error,
                }),
            )
        })

        it('should notify if current integration is missing', async () => {
            const { result } = renderHook(
                () =>
                    useGeneratePlaygroundMessage({
                        ...hookParameters,
                        currentIntegration: undefined,
                    }),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore}>{children}</Provider>
                    ),
                },
            )

            await act(async () => {
                await result.current.handleGenerateMessages()
            })

            expect(mockDispatch).toHaveBeenCalledWith(
                notify({
                    message: 'Missing journey configuration',
                    status: NotificationStatus.Error,
                }),
            )
        })

        it('should notify if journey params is missing', async () => {
            const { result } = renderHook(
                () =>
                    useGeneratePlaygroundMessage({
                        ...hookParameters,
                        journeyParams: undefined,
                    }),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore}>{children}</Provider>
                    ),
                },
            )

            await act(async () => {
                await result.current.handleGenerateMessages()
            })

            expect(mockDispatch).toHaveBeenCalledWith(
                notify({
                    message: 'Missing journey configuration',
                    status: NotificationStatus.Error,
                }),
            )
        })

        it('should notify if abandoned Cart Journey ID is missing', async () => {
            const { result } = renderHook(
                () =>
                    useGeneratePlaygroundMessage({
                        ...hookParameters,
                        journey: {
                            ...hookParameters.journey,
                            id: undefined,
                        } as unknown as typeof hookParameters.journey,
                    }),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore}>{children}</Provider>
                    ),
                },
            )

            await act(async () => {
                await result.current.handleGenerateMessages()
            })

            expect(mockDispatch).toHaveBeenCalledWith(
                notify({
                    message: 'Missing journey configuration',
                    status: NotificationStatus.Error,
                }),
            )
        })

        it('should notify if abandoned Cart Journey is missing', async () => {
            const { result } = renderHook(
                () =>
                    useGeneratePlaygroundMessage({
                        ...hookParameters,
                        journey: undefined,
                    }),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore}>{children}</Provider>
                    ),
                },
            )

            await act(async () => {
                await result.current.handleGenerateMessages()
            })

            expect(mockDispatch).toHaveBeenCalledWith(
                notify({
                    message: 'Missing journey configuration',
                    status: NotificationStatus.Error,
                }),
            )
        })

        it('should handle errors gracefully', async () => {
            mockCreateTestSession.mockRejectedValue(new Error('Test error'))

            const { result } = renderHook(
                () => useGeneratePlaygroundMessage(hookParameters),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore}>{children}</Provider>
                    ),
                },
            )

            await act(async () => {
                await result.current.handleGenerateMessages()
            })

            expect(mockDispatch).toHaveBeenCalledWith(
                notify({
                    message:
                        'Error triggering AI Journey test: Error: Test error',
                    status: NotificationStatus.Error,
                }),
            )
        })
    })

    describe('successful flow', () => {
        beforeEach(() => {
            jest.clearAllMocks()
            jest.resetAllMocks()

            mockedUsePlaygroundPolling.mockReturnValue({
                testSessionLogs: { logs: [], status: 'idle', id: '1' },
                startPolling: mockStartPolling,
                stopPolling: mockStopPolling,
                isPolling: false,
            })

            mockedUseCreateTestSessionMutation.mockReturnValue({
                mutateAsync: mockCreateTestSession,
                isLoading: false,
                data: undefined,
                error: null,
            } as unknown as ReturnType<typeof useCreateTestSessionMutation>)

            mockeduUseTriggerAIJourney.mockReturnValue({
                mutateAsync: mockTriggerAIJourney,
                isLoading: false,
                data: undefined,
                error: null,
            } as unknown as ReturnType<typeof useTriggerAIJourney>)
        })

        it('should return correct generated messages', async () => {
            mockCreateTestSession.mockResolvedValue({
                testModeSession: { id: 'test-session-id' },
            })

            mockedUsePlaygroundPolling.mockReturnValue({
                isPolling: true,
                startPolling: jest.fn(),
                stopPolling: jest.fn(),
                testSessionLogs: undefined,
            })

            const { result, rerender } = renderHook(
                () => useGeneratePlaygroundMessage(hookParameters),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore}>{children}</Provider>
                    ),
                },
            )

            expect(result.current.playgroundMessages?.length).toBe(undefined)

            mockedUsePlaygroundPolling.mockReturnValue({
                isPolling: false,
                startPolling: jest.fn(),
                stopPolling: jest.fn(),
                testSessionLogs,
            })

            rerender()

            expect(result.current.playgroundMessages?.length).toBe(2)
            expect(result.current.playgroundMessages).toEqual([
                'message-1',
                'message-2',
            ])
        })
    })

    it('should stop polling when test session logs status is finished', async () => {
        const mockStopPolling = jest.fn()
        const mockStartPolling = jest.fn()

        mockedUsePlaygroundPolling.mockReturnValue({
            testSessionLogs: { logs: [], status: 'in-progress', id: '1' },
            startPolling: mockStartPolling,
            stopPolling: mockStopPolling,
            isPolling: true,
        })

        const { rerender } = renderHook(
            () => useGeneratePlaygroundMessage(hookParameters),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore}>{children}</Provider>
                ),
            },
        )
        // Simulate polling with status 'finished'
        mockedUsePlaygroundPolling.mockReturnValue({
            testSessionLogs,
            startPolling: mockStartPolling,
            stopPolling: mockStopPolling,
            isPolling: false,
        })

        rerender()

        expect(mockStopPolling).toHaveBeenCalled()
    })

    it('should trigger AI Journey and create test session', async () => {
        jest.useFakeTimers()

        const mockStopPolling = jest.fn()
        const mockStartPolling = jest.fn()

        mockCreateTestSession.mockResolvedValue({
            testModeSession: { id: 'test-session-id' },
        })

        mockTriggerAIJourney.mockResolvedValue(undefined)

        const testSessionLogsWithOneMessage = {
            id: '123',
            status: 'finished' as const,
            logs: [
                {
                    id: '566c50b5-f4f3-4467-83f0-a54275681aae',
                    data: {
                        message: 'message-1',
                        isSalesOpportunity: false,
                        isSalesDiscount: true,
                        isSalesOpportunityFieldId: 33778,
                        isSalesDiscountFieldId: 33779,
                    },
                    type: TestSessionLogType.AI_AGENT_REPLY,
                },
            ],
        } as GetTestSessionLogsResponse

        let currentTestSessionLogs:
            | GetTestSessionLogsResponse
            | { logs: []; status: 'idle'; id: string } = {
            logs: [],
            status: 'idle' as const,
            id: '1',
        }
        let currentIsPolling = false

        mockedUsePlaygroundPolling.mockImplementation(() => ({
            testSessionLogs: currentTestSessionLogs,
            startPolling: mockStartPolling,
            stopPolling: mockStopPolling,
            isPolling: currentIsPolling,
        }))

        const { result, rerender } = renderHook(
            () =>
                useGeneratePlaygroundMessage({
                    ...hookParameters,
                    totalMessagesToBeGenerated: 1,
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore}>{children}</Provider>
                ),
            },
        )

        const generatePromise = result.current.handleGenerateMessages()

        await act(async () => {
            await Promise.resolve()
            await Promise.resolve()
        })

        currentIsPolling = true
        rerender()

        await act(async () => {
            jest.advanceTimersByTime(5000)
        })

        currentIsPolling = false
        currentTestSessionLogs = testSessionLogsWithOneMessage
        rerender()

        await act(async () => {
            jest.advanceTimersByTime(5000)
        })

        await act(async () => {
            await generatePromise
        })

        expect(mockCreateTestSession).toHaveBeenCalled()
        expect(mockTriggerAIJourney).toHaveBeenCalledWith([
            expect.objectContaining({
                accountId: hookParameters.journey.account_id,
                journeyId: hookParameters.journey.id,
                followUpAttempt: 0,
                testModeSessionId: 'test-session-id',
                page: expect.objectContaining({
                    url: 'https://shop-domain/products/product-handle',
                    productId: String(hookParameters.selectedProduct.id),
                }),
            }),
        ])
        expect(mockStartPolling).toHaveBeenCalled()

        jest.useRealTimers()
    })
})
