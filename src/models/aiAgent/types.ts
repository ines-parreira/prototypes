export type AccountConfigurationResponse = {
    accountConfiguration: Omit<AccountConfiguration, 'helpdeskOAuth'>
}

export type AccountConfiguration = {
    accountId: number
    gorgiasDomain: string
    httpIntegration?: {
        id: number
    }
    helpdeskOAuth: {accessToken: string} | null
}

export type AccountConfigurationWithHttpIntegration = AccountConfiguration & {
    httpIntegration: {id: number}
}

export type GetStoreConfigurationParams = {
    accountDomain: string
    storeName: string
}

export type StoreConfigurationResponse = {
    storeConfiguration: StoreConfiguration
}

export type StoreConfiguration = {
    deactivatedDatetime: string | null
    storeName: string

    helpCenterId: number
    helpCenterLocale: string
    helpCenterSubdomain: string

    snippetHelpCenterId: number
    guidanceHelpCenterId: number

    toneOfVoice: string
    customToneOfVoiceGuidance: string | null
    signature: string
    excludedTopics: string[]
    tags: Tag[]
    conversationBot: ConversationBot
    monitoredEmailIntegrations: EmailIntegration[]

    silentHandover: boolean
    ticketSampleRate: number

    dryRun: boolean
    isDraft: boolean
}

export type CreateStoreConfigurationPayload = Pick<
    StoreConfiguration,
    | 'storeName'
    | 'helpCenterId'
    | 'helpCenterSubdomain'
    | 'helpCenterLocale'
    | 'monitoredEmailIntegrations'
    | 'deactivatedDatetime'
    | 'customToneOfVoiceGuidance'
    | 'signature'
>

export type UpsertStoreConfigurationPayload = StoreConfiguration

export type Tag = {
    name: string
    description: string
}

type ConversationBot = {
    id: number
    email: string
}

type EmailIntegration = {
    id: number
    email: string
}

export type FormValues = {
    ticketSampleRate: number
    silentHandover: boolean
    monitoredEmailIntegrations: {id: number; email: string}[]
    tags: Tag[]
    excludedTopics: string[]
    signature: string
    toneOfVoice: string
    helpCenter: {id: number; locale: string; subdomain: string} | null
}
