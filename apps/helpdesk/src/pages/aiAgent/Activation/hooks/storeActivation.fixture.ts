import { AiAgentScope } from 'models/aiAgent/types'
import type {
    Settings,
    StoreActivation,
} from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { ToneOfVoice } from 'pages/aiAgent/constants'

type StoreActivationOverride = {
    storeName: string
    settings?: Settings
    alerts?: StoreActivation['alerts']
    configuration?: Partial<StoreActivation['configuration']>
}
export const storeActivationFixture = (
    overrides?: StoreActivationOverride,
): StoreActivation => {
    const name = overrides?.storeName ?? 'test-store'
    const settings = overrides?.settings ?? {
        support: {
            enabled: true,
            chat: {
                enabled: true,
            },
            email: {
                enabled: true,
            },
        },
        sales: {
            isDisabled: false,
            enabled: true,
        },
    }

    return {
        name,
        title: name,
        alerts: overrides?.alerts ?? [],
        isMissingKnowledge: false,
        ...settings,
        configuration: {
            shopType: 'shopify',
            scopes: [AiAgentScope.Sales, AiAgentScope.Support],
            conversationBot: {
                id: 1,
                email: 'bot@gorgias.com',
                name: 'Gorgias Bot',
            },
            useEmailIntegrationSignature: true,
            emailChannelDeactivatedDatetime: null,
            chatChannelDeactivatedDatetime: null,
            smsChannelDeactivatedDatetime: null,
            previewModeActivatedDatetime: null,
            previewModeValidUntilDatetime: null,
            isPreviewModeActive: false,
            helpCenterId: 1,
            guidanceHelpCenterId: 102,
            snippetHelpCenterId: 103,
            toneOfVoice: ToneOfVoice.Friendly,
            aiAgentLanguage: null,
            customToneOfVoiceGuidance: null,
            excludedTopics: [],
            signature: 'This response was created by AI',
            smsDisclaimer: 'Powered by AI',
            tags: [],
            monitoredEmailIntegrations: [
                {
                    id: 11,
                    email: 'foo@bar.com',
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
            ...overrides?.configuration,
            storeName: name,
            handoverEmail: null,
            handoverMethod: null,
            handoverEmailIntegrationId: null,
            handoverHttpIntegrationId: null,
        },
    }
}
