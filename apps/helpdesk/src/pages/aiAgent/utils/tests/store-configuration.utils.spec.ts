import type { StoreConfiguration } from 'models/aiAgent/types'
import { AiAgentScope } from 'models/aiAgent/types'
import { ToneOfVoice } from 'pages/aiAgent/constants'

import { isAiAgentEnabledForStore } from '../store-configuration.utils'

describe('isAiAgentEnabledForStore', () => {
    const createStoreConfig = (
        chatDeactivated: string | null,
        emailDeactivated: string | null,
    ): StoreConfiguration => ({
        chatChannelDeactivatedDatetime: chatDeactivated,
        emailChannelDeactivatedDatetime: emailDeactivated,
        smsChannelDeactivatedDatetime: null,
        storeName: 'test-store',
        shopType: 'shopify',
        previewModeActivatedDatetime: null,
        helpCenterId: null,
        snippetHelpCenterId: 1,
        guidanceHelpCenterId: 1,
        useEmailIntegrationSignature: false,
        toneOfVoice: ToneOfVoice.Professional,
        customToneOfVoiceGuidance: null,
        aiAgentLanguage: null,
        signature: '',
        excludedTopics: [],
        tags: [],
        conversationBot: {
            id: 1,
            email: 'test@example.com',
            name: 'Test Bot',
        },
        monitoredEmailIntegrations: [],
        monitoredSmsIntegrations: [],
        monitoredChatIntegrations: [],
        silentHandover: false,
        ticketSampleRate: 1,
        dryRun: false,
        isDraft: false,
        wizardId: null,
        floatingChatInputConfigurationId: null,
        previewModeValidUntilDatetime: null,
        scopes: [AiAgentScope.Support],
        createdDatetime: '2024-01-01T00:00:00Z',
        salesDiscountMax: null,
        salesDiscountStrategyLevel: null,
        salesPersuasionLevel: null,
        salesDeactivatedDatetime: null,
        isConversationStartersEnabled: false,
        isConversationStartersDesktopOnly: false,
        embeddedSpqEnabled: false,
        isSalesHelpOnSearchEnabled: null,
        customFieldIds: [],
        handoverMethod: null,
        handoverEmail: null,
        handoverEmailIntegrationId: null,
        handoverHttpIntegrationId: null,
    })

    it('should return true when both chat and email channels are active', () => {
        const config = createStoreConfig(null, null)

        expect(isAiAgentEnabledForStore(config)).toBe(true)
    })

    it('should return true when only chat channel is active', () => {
        const config = createStoreConfig(null, '2024-01-01T00:00:00Z')

        expect(isAiAgentEnabledForStore(config)).toBe(true)
    })

    it('should return true when only email channel is active', () => {
        const config = createStoreConfig('2024-01-01T00:00:00Z', null)

        expect(isAiAgentEnabledForStore(config)).toBe(true)
    })

    it('should return false when both channels are inactive', () => {
        const config = createStoreConfig(
            '2024-01-01T00:00:00Z',
            '2024-01-01T00:00:00Z',
        )

        expect(isAiAgentEnabledForStore(config)).toBe(false)
    })
})
