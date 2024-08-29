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
    trialModeActivatedDatetime: string | null
    storeName: string

    helpCenterId: number | null

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
    | 'monitoredEmailIntegrations'
    | 'deactivatedDatetime'
    | 'trialModeActivatedDatetime'
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

export enum AiAgentOnboardingWizardStep {
    Education = 'education',
    Personalize = 'personalize',
    Knowledge = 'knowledge',
}
