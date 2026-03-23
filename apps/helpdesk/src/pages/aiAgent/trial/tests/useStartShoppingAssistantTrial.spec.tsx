import { waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { useHistory } from 'react-router'

import * as accountFixtures from 'fixtures/account'
import useAppDispatch from 'hooks/useAppDispatch'
import { AiAgentScope } from 'models/aiAgent/types'
import type { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { ToneOfVoice } from 'pages/aiAgent/constants'
import { getAiAgentNavigationRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import { initialState } from 'state/currentAccount/reducers'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { renderHookWithStoreAndQueryClientProvider } from 'tests/renderHookWithStoreAndQueryClientProvider'

import { useSalesTrialRevampMilestone } from '../hooks/useSalesTrialRevampMilestone'
import { useStartShoppingAssistantTrial } from '../hooks/useStartShoppingAssistantTrial'

// Mock external dependencies
jest.mock('react-router', () => ({
    useHistory: jest.fn(),
}))

jest.mock('hooks/useAppDispatch', () => jest.fn())

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    getAiAgentNavigationRoutes: jest.fn(),
}))

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(),
}))

jest.mock('../hooks/useSalesTrialRevampMilestone', () => ({
    useSalesTrialRevampMilestone: jest.fn(),
}))

// Mock the API functions
jest.mock('models/aiAgent/resources/configuration', () => ({
    upsertStoreConfiguration: jest.fn(),
}))

jest.mock('models/aiAgent/queries', () => ({
    ...jest.requireActual('models/aiAgent/queries'),
    useStartSalesTrialMutation: jest.fn(),
    storeConfigurationKeys: {
        all: jest.fn(() => ['store-configurations']),
    },
}))

const useHistoryMock = jest.mocked(useHistory)
const useAppDispatchMock = jest.mocked(useAppDispatch)
const useSalesTrialRevampMilestoneMock = jest.mocked(
    useSalesTrialRevampMilestone,
)
const getAiAgentNavigationRoutesMock = jest.mocked(getAiAgentNavigationRoutes)
const notifyMock = jest.mocked(notify)

const { upsertStoreConfiguration } = jest.requireMock(
    'models/aiAgent/resources/configuration',
)
const { useStartSalesTrialMutation } = jest.requireMock(
    'models/aiAgent/queries',
)

const defaultState = {
    currentAccount: initialState.mergeDeep(
        fromJS({
            ...accountFixtures.account,
            domain: 'test-domain',
        }),
    ),
}

describe('useStartShoppingAssistantTrial', () => {
    const mockDispatch = jest.fn()
    const mockPush = jest.fn()
    const mockStartSalesTrialMutateAsync = jest.fn()

    const mockStoreActivation: StoreActivation = {
        name: 'store1',
        title: 'Store 1',
        alerts: [],
        configuration: {
            storeName: 'store1',
            shopType: 'shopify',
            helpCenterId: null,
            snippetHelpCenterId: 1,
            guidanceHelpCenterId: 1,
            useEmailIntegrationSignature: false,
            toneOfVoice: ToneOfVoice.Friendly,
            customToneOfVoiceGuidance: null,
            aiAgentLanguage: null,
            signature: '',
            excludedTopics: [],
            tags: [],
            conversationBot: {
                id: 1,
                name: 'AI Agent',
                email: 'bot@gorgias.com',
            },
            monitoredEmailIntegrations: [],
            monitoredChatIntegrations: [],
            silentHandover: false,
            ticketSampleRate: 100,
            dryRun: false,
            isDraft: false,
            wizardId: null,
            floatingChatInputConfigurationId: null,
            chatChannelDeactivatedDatetime: null,
            emailChannelDeactivatedDatetime: null,
            previewModeValidUntilDatetime: null,
            previewModeActivatedDatetime: null,
            scopes: [AiAgentScope.Support],
            createdDatetime: '2023-01-01T00:00:00Z',
            salesDeactivatedDatetime: null,
            salesPersuasionLevel: PersuasionLevel.Educational,
            salesDiscountStrategyLevel: DiscountStrategy.Balanced,
            salesDiscountMax: 20,
            isConversationStartersEnabled: false,
            isConversationStartersDesktopOnly: false,
            embeddedSpqEnabled: false,
            isSalesHelpOnSearchEnabled: null,
            customFieldIds: [],
            handoverMethod: null,
            handoverEmail: null,
            handoverEmailIntegrationId: null,
            handoverHttpIntegrationId: null,
            smsChannelDeactivatedDatetime: null,
            monitoredSmsIntegrations: [],
        },
        sales: {
            enabled: false,
            isDisabled: false,
        },
        support: {
            enabled: true,
            chat: {
                enabled: true,
                isIntegrationMissing: false,
                isInstallationMissing: false as any,
                availableChats: [1],
            },
            email: {
                enabled: true,
                isIntegrationMissing: false,
            },
        },
        isMissingKnowledge: false,
    }

    const mockParams = {
        accountDomain: 'test-domain',
        storeActivations: {
            store1: mockStoreActivation,
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()

        useAppDispatchMock.mockReturnValue(mockDispatch)
        useHistoryMock.mockReturnValue({ push: mockPush } as any)
        useSalesTrialRevampMilestoneMock.mockReturnValue('milestone-0')
        getAiAgentNavigationRoutesMock.mockReturnValue({
            deployChat: '/app/ai-agent/shopify/store1/deploy/chat',
            knowledge: '/app/ai-agent/shopify/store1/knowledge',
        } as any)

        useStartSalesTrialMutation.mockReturnValue({
            mutateAsync: mockStartSalesTrialMutateAsync,
            mutate: jest.fn(),
            data: undefined,
            error: null,
            isError: false,
            isIdle: true,
            isLoading: false,
            isSuccess: false,
            reset: jest.fn(),
            status: 'idle',
        })

        upsertStoreConfiguration.mockResolvedValue({
            data: { storeConfiguration: mockStoreActivation.configuration },
        })
    })

    describe('mutation execution', () => {
        it('should start trial for single store with valid chat integration (milestone-0)', async () => {
            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useStartShoppingAssistantTrial({ onError: jest.fn() }),
                defaultState,
            )

            await result.current.mutateAsync(mockParams)

            expect(upsertStoreConfiguration).toHaveBeenCalledWith(
                'test-domain',
                expect.objectContaining({
                    storeName: 'store1',
                    scopes: [AiAgentScope.Support, AiAgentScope.Sales],
                    salesDeactivatedDatetime: expect.any(String),
                    salesPersuasionLevel: PersuasionLevel.Educational,
                    salesDiscountStrategyLevel: DiscountStrategy.NoDiscount,
                    salesDiscountMax: null,
                    chatChannelDeactivatedDatetime: null,
                }),
            )
        })

        it('should set trial duration to 14 days', async () => {
            const mockDate = new Date('2023-01-01T00:00:00Z')
            jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useStartShoppingAssistantTrial({ onError: jest.fn() }),
                defaultState,
            )

            await result.current.mutateAsync(mockParams)

            const expectedTrialEnd = new Date(
                mockDate.getTime() + 14 * 24 * 60 * 60 * 1000,
            ).toISOString()

            expect(upsertStoreConfiguration).toHaveBeenCalledWith(
                'test-domain',
                expect.objectContaining({
                    salesDeactivatedDatetime: expectedTrialEnd,
                }),
            )
        })

        it('should use startSalesTrialMutation for milestone-1', async () => {
            useSalesTrialRevampMilestoneMock.mockReturnValue('milestone-1')
            mockStartSalesTrialMutateAsync.mockResolvedValue({ success: true })

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useStartShoppingAssistantTrial({ onError: jest.fn() }),
                defaultState,
            )

            await result.current.mutateAsync(mockParams)

            expect(mockStartSalesTrialMutateAsync).toHaveBeenCalledWith([
                'store1',
            ])
            expect(upsertStoreConfiguration).not.toHaveBeenCalled()
        })

        it('should throw error when multiple stores are provided', async () => {
            const mockStoreActivation2 = {
                ...mockStoreActivation,
                configuration: {
                    ...mockStoreActivation.configuration,
                    storeName: 'store2',
                },
            }

            const paramsWithMultipleStores = {
                accountDomain: 'test-domain',
                storeActivations: {
                    store1: mockStoreActivation,
                    store2: mockStoreActivation2,
                },
            }

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useStartShoppingAssistantTrial({ onError: jest.fn() }),
                defaultState,
            )

            await expect(
                result.current.mutateAsync(paramsWithMultipleStores),
            ).rejects.toThrow(
                'Unexpected case: Should be in the context of a specific store to start the trial on it.',
            )

            expect(upsertStoreConfiguration).not.toHaveBeenCalled()
        })

        it('should throw error and show notification when chat integration is invalid', async () => {
            const mockStoreActivationWithMissingChat = {
                ...mockStoreActivation,
                support: {
                    enabled: true,
                    chat: {
                        enabled: true,
                        isIntegrationMissing: true,
                        isInstallationMissing: false as any,
                        availableChats: [] as any,
                    },
                    email: {
                        enabled: true,
                        isIntegrationMissing: false,
                    },
                },
            }

            const paramsWithMissingChat = {
                accountDomain: 'test-domain',
                storeActivations: {
                    store1: mockStoreActivationWithMissingChat,
                },
            }

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useStartShoppingAssistantTrial({ onError: jest.fn() }),
                defaultState,
            )

            await expect(
                result.current.mutateAsync(paramsWithMissingChat),
            ).rejects.toThrow()

            expect(mockDispatch).toHaveBeenCalledWith(
                notifyMock({
                    message:
                        'You need at least 1 valid chat integration to be able to start the Shopping Assistant Trial.',
                    status: NotificationStatus.Warning,
                }),
            )
            expect(mockPush).toHaveBeenCalledWith(
                '/app/ai-agent/shopify/store1/deploy/chat',
            )
            expect(upsertStoreConfiguration).not.toHaveBeenCalled()
        })

        it('should validate chat integration requirements - no available chats', async () => {
            const storeWithNoAvailableChats = {
                ...mockStoreActivation,
                support: {
                    enabled: true,
                    chat: {
                        enabled: true,
                        isIntegrationMissing: false,
                        isInstallationMissing: false as any,
                        availableChats: [],
                    },
                    email: {
                        enabled: true,
                        isIntegrationMissing: false,
                    },
                },
            }

            const params = {
                accountDomain: 'test-domain',
                storeActivations: {
                    store1: storeWithNoAvailableChats,
                },
            }

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useStartShoppingAssistantTrial({ onError: jest.fn() }),
                defaultState,
            )

            await expect(result.current.mutateAsync(params)).rejects.toThrow()
        })

        it('should throw error and show notification when knowledge is missing', async () => {
            const mockStoreActivationWithMissingKnowledge = {
                ...mockStoreActivation,
                isMissingKnowledge: true,
            }

            const paramsWithMissingKnowledge = {
                accountDomain: 'test-domain',
                storeActivations: {
                    store1: mockStoreActivationWithMissingKnowledge,
                },
            }

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useStartShoppingAssistantTrial({ onError: jest.fn() }),
                defaultState,
            )

            await expect(
                result.current.mutateAsync(paramsWithMissingKnowledge),
            ).rejects.toThrow()

            expect(mockDispatch).toHaveBeenCalledWith(
                notifyMock({
                    message:
                        'You need at least 1 valid knowledge source to be able to start the Shopping Assistant Trial.',
                    status: NotificationStatus.Warning,
                }),
            )
            expect(mockPush).toHaveBeenCalledWith(
                '/app/ai-agent/shopify/store1/knowledge',
            )
            expect(upsertStoreConfiguration).not.toHaveBeenCalled()
        })

        it('should handle upsertStoreConfiguration errors', async () => {
            const error = new Error('API Error')
            upsertStoreConfiguration.mockRejectedValue(error)

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useStartShoppingAssistantTrial({ onError: jest.fn() }),
                defaultState,
            )

            await expect(
                result.current.mutateAsync(mockParams),
            ).rejects.toThrow('API Error')
        })
    })

    describe('onSuccess callback', () => {
        it('should invalidate queries for non-milestone-1', async () => {
            useSalesTrialRevampMilestoneMock.mockReturnValue('milestone-0')

            const { result, queryClient } =
                renderHookWithStoreAndQueryClientProvider(
                    () =>
                        useStartShoppingAssistantTrial({ onError: jest.fn() }),
                    defaultState,
                )
            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )

            await result.current.mutateAsync(mockParams)

            await waitFor(() => {
                expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                    queryKey: ['store-configurations'],
                })
            })
        })

        it('should not invalidate queries for milestone-1', async () => {
            useSalesTrialRevampMilestoneMock.mockReturnValue('milestone-1')
            mockStartSalesTrialMutateAsync.mockResolvedValue({ success: true })

            const { result, queryClient } =
                renderHookWithStoreAndQueryClientProvider(
                    () =>
                        useStartShoppingAssistantTrial({ onError: jest.fn() }),
                    defaultState,
                )
            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )

            await result.current.mutateAsync(mockParams)

            // Should not invalidate queries for milestone-1 since it's handled by useStartSalesTrialMutation
            expect(invalidateQueriesSpy).not.toHaveBeenCalled()
        })
    })

    describe('onError callback', () => {
        it('should show error notification when mutation fails', async () => {
            const error = new Error('Network error')
            upsertStoreConfiguration.mockRejectedValue(error)

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useStartShoppingAssistantTrial({ onError: jest.fn() }),
                defaultState,
            )

            try {
                await result.current.mutateAsync(mockParams)
            } catch {
                // Expected to throw
            }

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalledWith(
                    notifyMock({
                        message:
                            'Failed to start the shopping assistant trial. Please try again.',
                        status: NotificationStatus.Error,
                    }),
                )
            })
        })
    })
})
