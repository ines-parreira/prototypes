import type { StoreConfiguration } from 'models/aiAgent/types'
import { AiAgentScope } from 'models/aiAgent/types'
import { ToneOfVoice } from 'pages/aiAgent/constants'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/PersuasionLevel'

export const getStoreConfigurationFixture = (
    props?: Partial<StoreConfiguration>,
): StoreConfiguration => ({
    shopType: 'shopify',
    conversationBot: {
        name: 'AI Agent Name',
        id: 1,
        email: 'bot@gorgias.com',
    },
    emailChannelDeactivatedDatetime: null,
    chatChannelDeactivatedDatetime: null,
    smsChannelDeactivatedDatetime: null,
    previewModeActivatedDatetime: null,
    previewModeValidUntilDatetime: null,
    isPreviewModeActive: false,
    storeName: 'test-store',
    helpCenterId: 1,
    guidanceHelpCenterId: 102,
    snippetHelpCenterId: 103,
    toneOfVoice: ToneOfVoice.Friendly,
    customToneOfVoiceGuidance: null,
    useEmailIntegrationSignature: true,
    aiAgentLanguage: null,
    excludedTopics: [],
    signature: 'This response was created by AI',
    smsDisclaimer: 'Powered by AI',
    tags: [],
    monitoredEmailIntegrations: [
        {
            id: 11,
            email: '',
        },
    ],
    monitoredChatIntegrations: [1, 2, 3],
    monitoredSmsIntegrations: [],
    dryRun: false,
    isDraft: false,
    silentHandover: false,
    ticketSampleRate: 0.5,
    wizardId: null,
    floatingChatInputConfigurationId: null,
    scopes: [AiAgentScope.Support],
    createdDatetime: '1970-01-01T00:00:00.000Z',
    salesDiscountMax: null,
    salesDiscountStrategyLevel: null,
    salesPersuasionLevel: null,
    isConversationStartersEnabled: false,
    isConversationStartersDesktopOnly: false,
    embeddedSpqEnabled: false,
    customFieldIds: [],
    salesDeactivatedDatetime: null,
    isSalesHelpOnSearchEnabled: false,
    handoverEmail: null,
    handoverMethod: null,
    handoverEmailIntegrationId: null,
    handoverHttpIntegrationId: null,
    ...props,
})

export const getStoreWithSalesEnabled = (): StoreConfiguration =>
    getStoreConfigurationFixture({
        storeName: 'sales-store',
        scopes: [AiAgentScope.Support, AiAgentScope.Sales],
        salesDiscountMax: 20,
        salesDiscountStrategyLevel: DiscountStrategy.Balanced,
        salesPersuasionLevel: PersuasionLevel.Assertive,
    })

export const getStoreWithSupportEnabled = (): StoreConfiguration =>
    getStoreConfigurationFixture({
        storeName: 'support-store',
        scopes: [AiAgentScope.Support],
        monitoredEmailIntegrations: [
            {
                id: 11,
                email: 'support@store.com',
            },
        ],
        monitoredChatIntegrations: [1, 2, 3],
    })

export const getStoreWithPreviewMode = (): StoreConfiguration =>
    getStoreConfigurationFixture({
        storeName: 'preview-store',
        previewModeActivatedDatetime: '2024-01-01T00:00:00.000Z',
        previewModeValidUntilDatetime: '2024-02-01T00:00:00.000Z',
        isPreviewModeActive: true,
    })

export const getStoreWithDisabledChannels = (): StoreConfiguration =>
    getStoreConfigurationFixture({
        storeName: 'disabled-channels-store',
        emailChannelDeactivatedDatetime: '2024-01-01T00:00:00.000Z',
        chatChannelDeactivatedDatetime: '2024-01-01T00:00:00.000Z',
    })

export const getStoreWithCustomTone = (): StoreConfiguration =>
    getStoreConfigurationFixture({
        storeName: 'custom-tone-store',
        toneOfVoice: ToneOfVoice.Custom,
        customToneOfVoiceGuidance: 'Be professional and concise',
    })

export const getStoreWithExcludedTopics = (): StoreConfiguration =>
    getStoreConfigurationFixture({
        storeName: 'excluded-topics-store',
        excludedTopics: ['refund', 'return', 'cancellation'],
    })

export const getStoreWithHighSampleRate = (): StoreConfiguration =>
    getStoreConfigurationFixture({
        storeName: 'high-sample-rate-store',
        ticketSampleRate: 0.8,
    })

export const getStoreWithSilentHandover = (): StoreConfiguration =>
    getStoreConfigurationFixture({
        storeName: 'silent-handover-store',
        silentHandover: true,
    })

export const getStoreWithConversationStarters = (): StoreConfiguration =>
    getStoreConfigurationFixture({
        storeName: 'conversation-starters-store',
        isConversationStartersEnabled: true,
        isConversationStartersDesktopOnly: false,
    })
