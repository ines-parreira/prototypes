import {StoreConfiguration} from '../../../models/aiAgent/types'

export const SIGNATURE_MAX_LENGTH = 50
export const EXCLUDED_TOPIC_MAX_LENGTH = 100
export const MAX_EXCLUDED_TOPICS = 10
export const TONE_OF_VOICE_LABELS = [
    'Friendly',
    'Professional',
    'Sophisticated',
]
export const TONE_OF_VOICE_LABEL_TO_VALUE: Record<string, string> = {
    Friendly:
        'Be concise and empathetic. Call the shopper by their first name. Keep it casual.',
    Professional:
        'Maintain a formal and respectful tone throughout interactions. Stick to professional language. Be concise.',
    Sophisticated:
        'Use a refined and articulate tone. Ensure the language is sophisticated. Be concise.',
}
export const TONE_OF_VOICE_VALUE_TO_LABEL: Record<string, string> = {
    'Be concise and empathetic. Call the shopper by their first name. Keep it casual.':
        'Friendly',
    'Maintain a formal and respectful tone throughout interactions. Stick to professional language. Be concise.':
        'Professional',
    'Use a refined and articulate tone. Ensure the language is sophisticated. Be concise.':
        'Sophisticated',
}

// FIXME: Let the backend handle the default store configuration
export const DEFAULT_STORE_CONFIGURATION: StoreConfiguration = {
    storeName: '',

    helpCenterId: 0,
    helpCenterLocale: '',
    helpCenterSubdomain: '',

    toneOfVoice: TONE_OF_VOICE_LABEL_TO_VALUE['Friendly'],
    signature: '',
    excludedTopics: [],
    tags: [],
    conversationBot: {
        id: 0,
        email: '',
    },
    monitoredEmailIntegrations: [{id: 0, email: ''}],

    dryRun: false,
    isDraft: false,
    silentHandover: false,
    ticketSampleRate: 0,
}
