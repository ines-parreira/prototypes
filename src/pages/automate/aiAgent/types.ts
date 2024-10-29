import {CreateArticleDto, LocaleCode} from 'models/helpCenter/types'
import {Components} from 'rest_api/help_center_api/client.generated'

import {AiAgentOnboardingWizardStep, Tag} from '../../../models/aiAgent/types'
import {AiAgentChannel, ToneOfVoice} from './constants'

export type NonNullProperties<T> = {
    [P in keyof T]: NonNullable<T[P]>
}

export type NonNullFields<T, K extends keyof T> = T &
    NonNullProperties<Pick<T, K>>

export type WizardFormValues = {
    completedDatetime: string | null
    stepName: AiAgentOnboardingWizardStep | null
    hasEducationStepEnabled: boolean | null
    enabledChannels: AiAgentChannel[] | null
    isAutoresponderTurnedOff: boolean | null
    onCompletePathway: string | null
}

export type FormValues = {
    deactivatedDatetime: string | null | undefined
    chatChannelDeactivatedDatetime: string | null | undefined
    emailChannelDeactivatedDatetime: string | null | undefined
    trialModeActivatedDatetime: string | null
    previewModeActivatedDatetime: string | null
    ticketSampleRate: number | null
    silentHandover: boolean | null
    monitoredEmailIntegrations: {id: number; email: string}[] | null
    tags: Tag[] | null
    excludedTopics: string[] | null
    signature: string | null
    toneOfVoice: ToneOfVoice | null
    customToneOfVoiceGuidance: string | null
    helpCenterId: number | null
    monitoredChatIntegrations: number[] | null
    wizard: WizardFormValues | null | undefined
}

export type UpdateValue<FormValues> = <Key extends keyof FormValues>(
    key: Key,
    value: FormValues[Key]
) => void

export type ValidFormValues = NonNullFields<
    FormValues,
    'monitoredEmailIntegrations' | 'signature' | 'monitoredChatIntegrations'
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
    templateKey: string | null
}

export type CreateGuidanceArticle = Omit<
    GuidanceArticle,
    'id' | 'lastUpdated' | 'review'
>
export type UpdateGuidanceArticle = Omit<
    Partial<GuidanceArticle>,
    'lastUpdated' | 'id'
>

export type GuidanceTemplate = {
    id: string
    name: string
    content: string
    tag: string
    style: {color: string; background: string}
}

export type GuidanceFormFields = {
    name: string
    content: string
    isVisible: boolean
}

export type PlaygroundTemplateMessage = {
    id: number
    title: string
    content: string
}

export type PlaygroundCustomer = {
    email: string
    name?: string
    id: number
}
