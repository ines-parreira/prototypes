import { AiAgentOnboardingWizardStep } from 'models/aiAgent/types'
import { PlaygroundPromptType } from 'models/aiAgentPlayground/types'

import type { PlaygroundCustomer } from './PlaygroundV2/types'
import type { TicketCustomer } from './PlaygroundV2/utils/playground-ticket.util'
import type { FormValues, WizardFormValues } from './types'

// NAVBAR CONSTANTS
export const AI_AGENT = 'AI Agent'
export const OPTIMIZE = 'Optimize'
export const INTENTS = 'Intents'
export const OPPORTUNITIES = 'Opportunities'
export const SKILLS = 'Skills'
export const SETTINGS = 'Settings'
export const CHANNELS = 'Channels'
export const KNOWLEDGE = 'Knowledge'
export const PRODUCTS = 'Products'
export const GUIDANCE = 'Guidance'
export const SUPPORT_ACTIONS = 'Support Actions'
export const GENERAL = 'General'
export const SOURCES = 'Sources'
export const TEST = 'Test'
export const PREVIEW = 'Preview'
export const SALES = 'Shopping Assistant'
export const STRATEGY = 'Strategy'
export const CUSTOMER_ENGAGEMENT = 'Customer Engagement'
export const PRODUCT_RECOMMENDATIONS = 'Product Recommendations'
export const ANALYTICS = 'Analytics'
export const ANALYZE = 'Analyze'
export const TRAIN = 'Train'
export const DEPLOY = 'Deploy'
export const OVERVIEW = 'Overview'
export const AI_FEEDBACK = 'AI Feedback'
export const CHAT = 'Chat'
export const EMAIL = 'Email'
export const TONE_OF_VOICE = 'Tone of Voice'

export const SIGNATURE_MAX_LENGTH = 250
export const SMS_DISCLAIMER_MAX_LENGTH = 250
export const CUSTOM_TONE_OF_VOICE_MAX_LENGTH = 1500
export const CUSTOM_TONE_OF_VOICE_EXTENDED_MAX_LENGTH = 5000
export const EXCLUDED_TOPIC_MAX_LENGTH = 100
export const MAX_EXCLUDED_TOPICS = 10

export enum ToneOfVoice {
    Friendly = 'Friendly',
    Professional = 'Professional',
    Sophisticated = 'Sophisticated',
    Custom = 'Custom',
}

export enum AiAgentChannel {
    Chat = 'chat',
    Email = 'email',
}

export const DEFAULT_AI_AGENT_ENABLED_RATE = 50

export const DEFAULT_FORM_VALUES: FormValues = {
    // Since null is a valid value for that field, we need to explicitly set it to undefined
    emailChannelDeactivatedDatetime: undefined,
    chatChannelDeactivatedDatetime: undefined,
    smsChannelDeactivatedDatetime: undefined,
    previewModeActivatedDatetime: null,
    previewModeValidUntilDatetime: null,
    ticketSampleRate: null,
    silentHandover: null,
    monitoredEmailIntegrations: null,
    monitoredChatIntegrations: null,
    monitoredSmsIntegrations: null,
    tags: null,
    excludedTopics: null,
    conversationBot: {
        name: 'AI Agent Name',
        id: 0,
        email: 'bot@gorgias.com',
    },
    useEmailIntegrationSignature: true,
    signature: null,
    smsDisclaimer: null,
    toneOfVoice: null,
    aiAgentLanguage: null,
    customToneOfVoiceGuidance: null,
    helpCenterId: null,
    wizard: undefined,
    customFieldIds: null,
    handoverEmail: null,
    handoverMethod: null,
    handoverEmailIntegrationId: null,
    handoverHttpIntegrationId: null,
}

export const DEFAULT_WIZARD_FORM_VALUES: WizardFormValues = {
    completedDatetime: null,
    stepName: null,
    enabledChannels: null,
    isAutoresponderTurnedOff: null,
    onCompletePathway: null,
}

export const DEFAULT_FORM_VALUES_WITH_WIZARD: FormValues = {
    ...DEFAULT_FORM_VALUES,
    wizard: DEFAULT_WIZARD_FORM_VALUES,
}

export const GUIDANCE_ARTICLE_LIMIT = 40
export const GUIDANCE_ARTICLE_LIMIT_WARNING = 35

export const NEW_GUIDANCE_ARTICLE_LIMIT = 100
export const NEW_GUIDANCE_ARTICLE_LIMIT_WARNING = 90

export const CUSTOM_TONE_OF_VOICE_GUIDANCE_DEFAULT_VALUE = `Be concise. Use an empathetic, proactive, and reassuring tone. Acknowledge the customer's feelings with apologies and empathetic expressions. You can include emojis for a personal touch (e.g., 👍) and exclamation points.`

// Playground
export const CustomerHttpIntegrationDataMock = {
    address: 'oliver.smith@foobar.com',
    name: 'Oliver Smith',
    id: 0,
    firstname: 'Oliver',
    lastname: 'Smith',
}

export const DEFAULT_PLAYGROUND_CUSTOMER: PlaygroundCustomer = {
    email: CustomerHttpIntegrationDataMock.address,
    name: CustomerHttpIntegrationDataMock.name,
    id: 0,
}

export const PLAYGROUND_CUSTOMER_MOCK: TicketCustomer = {
    email: CustomerHttpIntegrationDataMock.address,
    firstname: CustomerHttpIntegrationDataMock.firstname,
    id: '601409',
    integrations: '{"shopify":{"customer":{},"last_order":null,"orders":[]}}',
    lastname: CustomerHttpIntegrationDataMock.lastname,
    name: CustomerHttpIntegrationDataMock.name,
}

export const AI_AGENT_STEPS_LABELS: Record<
    AiAgentOnboardingWizardStep,
    string
> = {
    [AiAgentOnboardingWizardStep.Personalize]: 'Personalize AI Agent',
    [AiAgentOnboardingWizardStep.Knowledge]: 'Add knowledge',
}

export const AI_AGENT_STEPS_TITLES: Partial<
    Record<AiAgentOnboardingWizardStep, string>
> = {
    [AiAgentOnboardingWizardStep.Personalize]: 'Personalize AI Agent',
    [AiAgentOnboardingWizardStep.Knowledge]: 'Add knowledge to AI Agent',
}

export const AI_AGENT_STEPS_DESCRIPTIONS: Partial<
    Record<AiAgentOnboardingWizardStep, string>
> = {
    [AiAgentOnboardingWizardStep.Knowledge]:
        'At least one knowledge source is required for AI Agent to reference when replying to customers. You can always add more later.',
}

export enum WIZARD_BUTTON_ACTIONS {
    NEXT_STEP = 'next_step',
    PREVIOUS_STEP = 'previous_step',
    CANCEL = 'cancel',
    SAVE_AND_CUSTOMIZE_LATER = 'save_and_customize_later',
    FINISH_TO_KNOWLEDGE = 'finish_to_knowledge',
    FINISH_TO_TEST = 'finish_to_test',
    FINISH_TO_GUIDANCE = 'finish_to_guidance',
}

export const INITIAL_FORM_VALUES = {
    previewModeActivatedDatetime: null,
    previewModeValidUntilDatetime: null,
    emailChannelDeactivatedDatetime: new Date().toISOString(),
    chatChannelDeactivatedDatetime: new Date().toISOString(),
    smsChannelDeactivatedDatetime: new Date().toISOString(),
    silentHandover: false,
    monitoredEmailIntegrations: [],
    tags: [],
    excludedTopics: [],
    signature: 'This response was created by AI',
    smsDisclaimer: 'Powered by AI',
    toneOfVoice: ToneOfVoice.Friendly,
    aiAgentLanguage: null,
    customToneOfVoiceGuidance: CUSTOM_TONE_OF_VOICE_GUIDANCE_DEFAULT_VALUE,
    helpCenter: null,
    monitoredChatIntegrations: [],
    monitoredSmsIntegrations: [],
    customFieldIds: [],
    scopes: [],
    conversationBot: {
        name: 'AI Agent Name',
        id: 0,
        email: 'bot@gorgias.com',
    },
    useEmailIntegrationSignature: true,
    handoverEmail: null,
    handoverMethod: null,
    handoverEmailIntegrationId: null,
    handoverHttpIntegrationId: null,
}

export const PLAYGROUND_PROMPT_CONTENT: Record<PlaygroundPromptType, string> = {
    [PlaygroundPromptType.RELEVANT_RESPONSE]: 'Yes, thanks',
    [PlaygroundPromptType.NOT_RELEVANT_RESPONSE]: 'No, I need more help',
}

export const WIZARD_POST_COMPLETION_QUERY_KEY = 'with_wizard_completed'
export enum WIZARD_POST_COMPLETION_STATE {
    configuration = 'configuration',
    test = 'test',
    guidance = 'guidance',
    knowledge = 'knowledge',
    test_subject = 'test_subject',
}

export const WIZARD_UPDATE_QUERY_KEY = 'update_setup'

export enum WizardPostCompletionPathway {
    knowledge = 'knowledge',
    guidance = 'guidance',
    test = 'test',
}

export const ARTICLE_INGESTION_LOGS_STATUS = {
    DISABLED: 'DISABLED',
    PENDING: 'PENDING',
    SUCCESSFUL: 'SUCCESSFUL',
    FAILED: 'FAILED',
} as const

export type ArticleIngestionLogsStatus =
    (typeof ARTICLE_INGESTION_LOGS_STATUS)[keyof typeof ARTICLE_INGESTION_LOGS_STATUS]

export const DEFAULT_PREVIEW_MODE_DURATION_IN_DAYS = 7

export const AI_AGENT_CUSTOM_TONE_OF_VOICE_TICKET = {
    subject: 'Return policy',
    bodyText: 'What is your return policy?',
}

// Note: this needs to be kept in sync with https://github.com/gorgias/ai-agent/blob/main/src/shared/types/enums/ticket-tags.enum.ts
export const AI_AGENT_TAGS = {
    AI_PROCESSING: 'ai_processing',
    AI_CLOSE: 'ai_close',
    AI_HANDOVER: 'ai_handover',
    AI_SNOOZE: 'ai_snooze',
    AI_EXECUTED_ACTION: 'ai_executed_action',
    AI_FAILED_ACTION: 'ai_failed_action',
    AI_ANSWERED: 'ai_answered',
    AI_IGNORE: 'ai_ignore',
    AI_PREVIEW: 'ai_preview',
}

export const AI_AGENT_TAGS_SET = new Set(Object.values(AI_AGENT_TAGS))

export const AI_AGENT_NAVBAR_COLLAPSED_SECTIONS_KEY =
    'ai-agent:navbar:collapsed-sections'
export const AI_AGENT_NAVBAR_EXPANDED_SECTIONS_KEY =
    'ai-agent:navbar:expanded-sections'
export const AI_AGENT_MAX_EXPANDED_SECTIONS_BY_DEFAULT = 3

export const CHANGES_SAVED_SUCCESS = 'Changes saved successfully'

export enum StoreConfigFormSection {
    generalSettings = 'generalSettings',
    channelSettings = 'channelSettings',
    handoverCustomizationOfflineSettings = 'handoverCustomizationOfflineSettings',
    handoverCustomizationOnlineSettings = 'handoverCustomizationOnlineSettings',
    handoverCustomizationFallbackSettings = 'handoverCustomizationFallbackSettings',
}

export const REFRESH_AI_AGENT_PLAYGROUND_EVENT = 'refresh-ai-agent-playground'
export const MESSAGE_SENT_AI_AGENT_PLAYGROUND_EVENT =
    'message-sent-ai-agent-playground'
