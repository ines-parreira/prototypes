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
    helpCenter: {id: number; locale: string; subdomain: string} | null
}

export type ValidFormValues = NonNullFields<
    FormValues,
    'monitoredEmailIntegrations' | 'helpCenter'
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
