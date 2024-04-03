import {Tag} from '../../../models/aiAgent/types'

export type NonNullProperties<T> = {
    [P in keyof T]: NonNullable<T[P]>
}

export type NonNullFields<T, K extends keyof T> = T &
    NonNullProperties<Pick<T, K>>

export type FormValues = {
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
