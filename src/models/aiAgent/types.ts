export type AccountConfigurationResponse = {
    accountConfiguration: Omit<AccountConfiguration, 'helpdeskOAuth'>
}

export type AccountConfiguration = {
    accountId: number
    gorgiasDomain: string
    helpdeskOAuth: {accessToken: string} | null
}

export type GetStoreConfigurationParams = {
    accountDomain: string
    storeName: string
}

export type StoreConfigurationResponse = {
    storeConfiguration: StoreConfiguration
}

export type StoreConfiguration = {
    storeName: string

    helpCenterId: number
    helpCenterLocale: string
    helpCenterSubdomain: string

    toneOfVoice: string
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
