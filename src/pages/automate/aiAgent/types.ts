import {CreateArticleDto, LocaleCode} from 'models/helpCenter/types'
import {Tag} from '../../../models/aiAgent/types'

export type NonNullProperties<T> = {
    [P in keyof T]: NonNullable<T[P]>
}

export type NonNullFields<T, K extends keyof T> = T &
    NonNullProperties<Pick<T, K>>

export type FormValues = {
    deactivatedDatetime: string | null | undefined
    ticketSampleRate: number | null
    silentHandover: boolean | null
    monitoredEmailIntegrations: {id: number; email: string}[] | null
    tags: Tag[] | null
    excludedTopics: string[] | null
    signature: string | null
    toneOfVoice: string | null
    customToneOfVoiceGuidance: string | null
    helpCenterId: number | null
    publicURLs: string[] | null
}

export type ValidFormValues = NonNullFields<
    FormValues,
    'monitoredEmailIntegrations'
>

export type GuidanceArticle = {
    id: number
    title: string
    content: string
    locale: LocaleCode
    visibility: CreateArticleDto['translation']['visibility_status']
    lastUpdated: string
}

export type CreateGuidanceArticle = Omit<GuidanceArticle, 'id' | 'lastUpdated'>
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
