import {FormValues} from './types'

export const SIGNATURE_MAX_LENGTH = 50
export const EXCLUDED_TOPIC_MAX_LENGTH = 100
export const MAX_EXCLUDED_TOPICS = 10

export enum ToneOfVoice {
    Friendly = 'Friendly',
    Professional = 'Professional',
    Sophisticated = 'Sophisticated',
}

export const DEFAULT_AI_AGENT_DISABLED_RATE = 0
export const DEFAULT_AI_AGENT_ENABLED_RATE = 30

export const DEFAULT_FORM_VALUES: FormValues = {
    ticketSampleRate: null,
    silentHandover: null,
    monitoredEmailIntegrations: null,
    tags: null,
    excludedTopics: null,
    signature: null,
    toneOfVoice: null,
    helpCenter: null,
}
