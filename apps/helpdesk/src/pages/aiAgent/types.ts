import type { AiAgentOnboardingWizardStep, Tag } from 'models/aiAgent/types'
import type { CreateArticleDto, LocaleCode } from 'models/helpCenter/types'
import type {
    GorgiasChatAutoResponderReply,
    GorgiasChatEmailCaptureType,
} from 'models/integration/types'
import type { Components } from 'rest_api/help_center_api/client.generated'

import type { AiAgentChannel, ToneOfVoice } from './constants'

export type NonNullProperties<T> = {
    [P in keyof T]: NonNullable<T[P]>
}

export type NonNullFields<T, K extends keyof T> = T &
    NonNullProperties<Pick<T, K>>

export type WizardFormValues = {
    completedDatetime: string | null
    stepName: AiAgentOnboardingWizardStep | null
    enabledChannels: AiAgentChannel[] | null
    isAutoresponderTurnedOff: boolean | null
    onCompletePathway: string | null
}

export type FormValues = {
    conversationBot:
        | {
              name: string
              id: number
              email: string
          }
        | null
        | undefined
    useEmailIntegrationSignature: boolean | null
    emailChannelDeactivatedDatetime: string | null | undefined
    chatChannelDeactivatedDatetime: string | null | undefined
    smsChannelDeactivatedDatetime: string | null | undefined
    previewModeActivatedDatetime: string | null
    previewModeValidUntilDatetime: string | null
    ticketSampleRate: number | null
    silentHandover: boolean | null
    monitoredEmailIntegrations: { id: number; email: string }[] | null
    monitoredChatIntegrations: number[] | null
    monitoredSmsIntegrations: number[] | null
    tags: Tag[] | null
    excludedTopics: string[] | null
    signature: string | null
    smsDisclaimer: string | null
    toneOfVoice: ToneOfVoice | null
    aiAgentLanguage: string | null
    customToneOfVoiceGuidance: string | null
    helpCenterId: number | null
    wizard: WizardFormValues | undefined
    customFieldIds: number[] | null
    handoverMethod: string | null
    handoverEmail: string | null
    handoverEmailIntegrationId: number | null
    handoverHttpIntegrationId: number | null
}

export type UpdateValue<FormValues> = <Key extends keyof FormValues>(
    key: Key,
    value: FormValues[Key],
) => void

export type ValidFormValues = NonNullFields<
    FormValues,
    | 'monitoredEmailIntegrations'
    | 'signature'
    | 'monitoredChatIntegrations'
    | 'monitoredSmsIntegrations'
>

export type AIGuidance = Omit<
    Components.Schemas.AIGuidanceDto,
    'batch_datetime'
>

export type GuidanceArticle = {
    id: number
    title: string
    content: string
    locale: LocaleCode
    visibility: CreateArticleDto['translation']['visibility_status']
    lastUpdated: string
    createdDatetime: string
    templateKey: string | null
    isCurrent?: boolean
    draftVersionId: number | null
    publishedVersionId: number | null
    intents?: Components.Schemas.ArticleTranslationResponseDto['intents']
}

export type CreateGuidanceArticle = Omit<
    GuidanceArticle,
    | 'id'
    | 'lastUpdated'
    | 'review'
    | 'createdDatetime'
    | 'draftVersionId'
    | 'publishedVersionId'
>
export type UpdateGuidanceArticle = Omit<
    Partial<GuidanceArticle>,
    'lastUpdated' | 'id'
> & {
    commitMessage?: string
}

export type GuidanceTemplate = {
    id: string
    name: string
    content: string
    tag: string
    style: { color: string; background: string }
}

export type GuidanceFormFields = {
    name: string
    content: string
    isVisible: boolean
}

export type HandoverCustomizationChatFallbackSettingsFormMultiLanguageValues = {
    [key: string]: HandoverCustomizationChatFallbackSettingsFormValues
}

export type HandoverCustomizationChatFallbackSettingsFormValues = {
    fallbackMessage?: string
}

export type HandoverCustomizationChatOfflineSettingsFormValues = {
    offlineInstructions: string
    shareBusinessHours: boolean
}

export enum AIAgentPaywallFeatures {
    Automate = 'Automate', // We should deprecate this and replace Automate paywalls with AiAgent paywalls (TrialSetup)
    SalesWaitlist = 'SalesWaitlist',
    TrialSetup = 'TrialSetup',
    ShoppingAssistantTrialSetup = 'ShoppingAssistantTrialSetup',
    Upgrade = 'Upgrade',
}

export type HandoverCustomizationChatOnlineSettingsFormValues = {
    onlineInstructions: string
    emailCaptureEnabled: boolean
    emailCaptureEnforcement: GorgiasChatEmailCaptureType
    autoResponderEnabled: boolean
    autoResponderReply: GorgiasChatAutoResponderReply
}
