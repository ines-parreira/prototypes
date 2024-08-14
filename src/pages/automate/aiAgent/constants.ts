import {FormValues} from './types'

export const SIGNATURE_MAX_LENGTH = 250
export const CUSTOM_TONE_OF_VOICE_MAX_LENGTH = 500
export const EXCLUDED_TOPIC_MAX_LENGTH = 100
export const MAX_EXCLUDED_TOPICS = 10

export enum ToneOfVoice {
    Friendly = 'Friendly',
    Professional = 'Professional',
    Sophisticated = 'Sophisticated',
    Custom = 'Custom',
}

export const DEFAULT_AI_AGENT_ENABLED_RATE = 50

export const DEFAULT_FORM_VALUES: FormValues = {
    // Since null is a valid value for that field, we need to explicitly set it to undefined
    deactivatedDatetime: undefined,
    trialModeActivatedDatetime: null,
    ticketSampleRate: null,
    silentHandover: null,
    monitoredEmailIntegrations: null,
    tags: null,
    excludedTopics: null,
    signature: null,
    toneOfVoice: null,
    customToneOfVoiceGuidance: null,
    helpCenterId: null,
}

export const GUIDANCE_ARTICLE_LIMIT = 40
export const GUIDANCE_ARTICLE_LIMIT_WARNING = 35
export const CUSTOM_TONE_OF_VOICE_GUIDANCE_DEFAULT_VALUE = `Be concise. Use an empathetic, proactive, and reassuring tone. Acknowledge the customer's feelings with apologies and empathetic expressions. You can include emojis for a personal touch (e.g., 👍) and exclamation points.`

// Playground
export const CustomerHttpIntegrationDataMock = {
    address: 'oliver.smith@foobar.com',
    name: 'Oliver Smith',
    firstname: 'Oliver',
    lastname: 'Smith',
}

export const DATA_TEST_ID = {
    Loader: 'loader',
    EmptyStateNoAIGuidances: 'empty-state-no-ai-guidances',
    EmptyStateAIGuidances: 'empty-state-with-ai-guidances',
    GuidancesOnly: 'guidances-only',
    GuidancesAndAIGuidances: 'guidances-and-ai-guidances',
}
