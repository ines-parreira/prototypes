import {StoreConfiguration} from 'models/aiAgent/types'

export const getStoreConfigurationFixture = (
    props?: Partial<StoreConfiguration>
): StoreConfiguration => ({
    conversationBot: {
        id: 1,
        email: 'bot@gorgias.com',
    },
    deactivatedDatetime: null,
    storeName: 'test-store',
    helpCenterId: 1,
    guidanceHelpCenterId: 102,
    snippetHelpCenterId: 103,
    toneOfVoice: 'Friendly',
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
    dryRun: false,
    isDraft: false,
    silentHandover: false,
    ticketSampleRate: 0.5,
    ...props,
})
