import { useMutation } from '@tanstack/react-query'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { useHistory } from 'react-router'

import useAppDispatch from 'hooks/useAppDispatch'
import { upsertStoreConfiguration } from 'models/aiAgent/resources/configuration'
import { AiAgentScope } from 'models/aiAgent/types'
import { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { ToneOfVoice } from 'pages/aiAgent/constants'
import { getAiAgentNavigationRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useStartShoppingAssistantTrial } from '../hooks/useStartShoppingAssistantTrial'

jest.mock('@tanstack/react-query', () => ({
    __esModule: true,
    useMutation: jest.fn(),
}))

jest.mock('launchdarkly-react-client-sdk', () => ({
    useFlags: jest.fn(),
}))

jest.mock('react-router', () => ({
    useHistory: jest.fn(),
}))

jest.mock('hooks/useAppDispatch', () => jest.fn())

jest.mock('models/aiAgent/resources/configuration', () => ({
    upsertStoreConfiguration: jest.fn(),
}))

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(),
}))

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    getAiAgentNavigationRoutes: jest.fn(),
}))

const useMutationMock = assumeMock(useMutation)
const useFlagsMock = assumeMock(useFlags)
const useHistoryMock = assumeMock(useHistory)
const useAppDispatchMock = assumeMock(useAppDispatch)
const upsertStoreConfigurationMock = assumeMock(upsertStoreConfiguration)
const notifyMock = assumeMock(notify)
const getAiAgentNavigationRoutesMock = assumeMock(getAiAgentNavigationRoutes)

describe('useStartShoppingAssistantTrial', () => {
    const mockDispatch = jest.fn()
    const mockMutateAsync = jest.fn()
    const mockPush = jest.fn()
    const mockFlags = { someFlag: true }

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
            trialModeActivatedDatetime: null,
            previewModeActivatedDatetime: null,
            scopes: [AiAgentScope.Support],
            createdDatetime: '2023-01-01T00:00:00Z',
            salesDeactivatedDatetime: null,
            salesPersuasionLevel: PersuasionLevel.Educational,
            salesDiscountStrategyLevel: DiscountStrategy.Balanced,
            salesDiscountMax: 20,
            isConversationStartersEnabled: false,
            isSalesHelpOnSearchEnabled: null,
            customFieldIds: [],
            handoverMethod: null,
            handoverEmail: null,
            handoverEmailIntegrationId: null,
            handoverHttpIntegrationId: null,
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
    }

    const mockStoreActivationWithMissingChat: StoreActivation = {
        ...mockStoreActivation,
        support: {
            enabled: true,
            chat: {
                enabled: true,
                isIntegrationMissing: true,
            },
            email: {
                enabled: true,
                isIntegrationMissing: false,
            },
        },
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
        useFlagsMock.mockReturnValue(mockFlags)
        useHistoryMock.mockReturnValue({ push: mockPush } as any)
        getAiAgentNavigationRoutesMock.mockReturnValue({
            settingsChannels: '/ai-agent/store1/settings/channels',
        } as any)
        useMutationMock.mockReturnValue({
            mutateAsync: mockMutateAsync,
            mutate: jest.fn(),
            data: undefined,
            error: null,
            isError: false,
            isIdle: true,
            isLoading: false,
            isSuccess: false,
            reset: jest.fn(),
            status: 'idle',
        } as any)
        upsertStoreConfigurationMock.mockResolvedValue({
            data: { storeConfiguration: mockStoreActivation.configuration },
        } as any)
    })

    it('should initialize mutation with correct parameters', () => {
        renderHook(() => useStartShoppingAssistantTrial())

        expect(useMutationMock).toHaveBeenCalledWith(expect.any(Function), {
            onError: expect.any(Function),
        })
    })

    it('should start trial for single store with valid chat integration', async () => {
        renderHook(() => useStartShoppingAssistantTrial())

        const mutationFn = useMutationMock.mock.calls[0][0] as any
        await mutationFn(mockParams)

        expect(upsertStoreConfigurationMock).toHaveBeenCalledWith(
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

        renderHook(() => useStartShoppingAssistantTrial())

        const mutationFn = useMutationMock.mock.calls[0][0] as any
        await mutationFn(mockParams)

        const expectedTrialEnd = new Date(
            mockDate.getTime() + 14 * 24 * 60 * 60 * 1000,
        ).toISOString()

        expect(upsertStoreConfigurationMock).toHaveBeenCalledWith(
            'test-domain',
            expect.objectContaining({
                salesDeactivatedDatetime: expectedTrialEnd,
            }),
        )
    })

    it('should throw error and redirect when chat integration is invalid', async () => {
        const paramsWithMissingChat = {
            accountDomain: 'test-domain',
            storeActivations: {
                store1: mockStoreActivationWithMissingChat,
            },
        }

        renderHook(() => useStartShoppingAssistantTrial())

        const mutationFn = useMutationMock.mock.calls[0][0] as any

        await expect(mutationFn(paramsWithMissingChat)).rejects.toThrow(
            "Invalid Chat - can't start trial",
        )

        expect(mockDispatch).toHaveBeenCalledWith(
            notifyMock({
                message:
                    'You need at least 1 valid chat integration to be able to start the Shopping Assistant Trial.',
                status: NotificationStatus.Warning,
            }),
        )
        expect(mockPush).toHaveBeenCalledWith(
            '/ai-agent/store1/settings/channels',
        )
        expect(upsertStoreConfigurationMock).not.toHaveBeenCalled()
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

        renderHook(() => useStartShoppingAssistantTrial())

        const mutationFn = useMutationMock.mock.calls[0][0] as any

        await expect(mutationFn(paramsWithMultipleStores)).rejects.toThrow(
            'Unexpected case: Should be in the context of a specific store to start the trial on it.',
        )

        expect(upsertStoreConfigurationMock).not.toHaveBeenCalled()
    })

    it('should validate chat integration requirements', async () => {
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

        renderHook(() => useStartShoppingAssistantTrial())

        const mutationFn = useMutationMock.mock.calls[0][0] as any

        await expect(mutationFn(params)).rejects.toThrow(
            "Invalid Chat - can't start trial",
        )
    })

    it('should handle onError callback', () => {
        renderHook(() => useStartShoppingAssistantTrial())

        const mutationOptions = useMutationMock.mock.calls[0][1] as any
        mutationOptions.onError()

        expect(mockDispatch).toHaveBeenCalledWith(
            notifyMock({
                message:
                    'Failed to start the shopping assistant trial. Please try again.',
                status: NotificationStatus.Error,
            }),
        )
    })

    it('should handle upsertStoreConfiguration errors', async () => {
        const error = new Error('API Error')
        upsertStoreConfigurationMock.mockRejectedValue(error)

        renderHook(() => useStartShoppingAssistantTrial())

        const mutationFn = useMutationMock.mock.calls[0][0] as any

        await expect(mutationFn(mockParams)).rejects.toThrow('API Error')
    })
})
