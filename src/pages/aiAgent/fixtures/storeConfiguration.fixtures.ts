import { AiAgentScope, StoreConfiguration } from 'models/aiAgent/types'

import { ToneOfVoice } from '../constants'

export const getStoreConfigurationFixture = (
    props?: Partial<StoreConfiguration>,
): StoreConfiguration => ({
    conversationBot: {
        id: 1,
        email: 'bot@gorgias.com',
    },
    deactivatedDatetime: null,
    emailChannelDeactivatedDatetime: null,
    chatChannelDeactivatedDatetime: null,
    trialModeActivatedDatetime: null,
    previewModeActivatedDatetime: null,
    previewModeValidUntilDatetime: null,
    isPreviewModeActive: false,
    storeName: 'test-store',
    helpCenterId: 1,
    guidanceHelpCenterId: 102,
    snippetHelpCenterId: 103,
    toneOfVoice: ToneOfVoice.Friendly,
    customToneOfVoiceGuidance: null,
    excludedTopics: [],
    signature: 'This response was created by AI',
    tags: [],
    monitoredEmailIntegrations: [
        {
            id: 11,
            email: '',
        },
    ],
    monitoredChatIntegrations: [1, 2, 3],
    dryRun: false,
    isDraft: false,
    silentHandover: false,
    ticketSampleRate: 0.5,
    wizardId: null,
    scopes: [AiAgentScope.Support],
    createdDatetime: '1970-01-01T00:00:00.000Z',
    salesDiscountMax: null,
    salesDiscountStrategyLevel: null,
    salesPersuasionLevel: null,
    ...props,
})
