import {AiAgentOnboardingWizardStep} from 'models/aiAgent/types'
import {PlaygroundPromptType} from 'models/aiAgentPlayground/types'
import {FormValues, WizardFormValues} from './types'

export const SIGNATURE_MAX_LENGTH = 250
export const CUSTOM_TONE_OF_VOICE_MAX_LENGTH = 1500
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
    deactivatedDatetime: undefined,
    trialModeActivatedDatetime: null,
    ticketSampleRate: null,
    silentHandover: null,
    monitoredEmailIntegrations: null,
    monitoredChatIntegrations: null,
    tags: null,
    excludedTopics: null,
    signature: null,
    toneOfVoice: null,
    customToneOfVoiceGuidance: null,
    helpCenterId: null,
    wizard: undefined,
}

export const DEFAULT_WIZARD_FORM_VALUES: WizardFormValues = {
    completedDatetime: null,
    stepName: null,
    hasEducationStepEnabled: null,
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
export const CUSTOM_TONE_OF_VOICE_GUIDANCE_DEFAULT_VALUE = `Be concise. Use an empathetic, proactive, and reassuring tone. Acknowledge the customer's feelings with apologies and empathetic expressions. You can include emojis for a personal touch (e.g., 👍) and exclamation points.`

// Playground
export const CustomerHttpIntegrationDataMock = {
    address: 'oliver.smith@foobar.com',
    name: 'Oliver Smith',
    firstname: 'Oliver',
    lastname: 'Smith',
}

export const AI_AGENT_STEPS_LABELS: Record<
    AiAgentOnboardingWizardStep,
    string
> = {
    [AiAgentOnboardingWizardStep.Education]: 'How AI Agent works',
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
    [AiAgentOnboardingWizardStep.Personalize]:
        'Set up AI Agent on at least one channel you want it to respond to.',
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
    trialModeActivatedDatetime: null,
    deactivatedDatetime: new Date().toISOString(),
    silentHandover: false,
    monitoredEmailIntegrations: [],
    tags: [],
    excludedTopics: [],
    signature: 'This response was created by AI',
    toneOfVoice: ToneOfVoice.Friendly,
    customToneOfVoiceGuidance:
        "Be concise. Use an empathetic, proactive, and reassuring tone. Acknowledge the customer's feelings with apologies and empathetic expressions.",
    helpCenter: null,
    monitoredChatIntegrations: [],
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
    typeof ARTICLE_INGESTION_LOGS_STATUS[keyof typeof ARTICLE_INGESTION_LOGS_STATUS]
