export type GetAccountConfigurationParams = {
    accountDomain: string
}

export type PutAccountConfigurationParams = {
    accountDomain: string
    accountConfiguration: AccountConfiguration
}

export type GetAccountConfigurationResponse = {
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

export type GetStoreConfigurationParams = {
    accountDomain: string
    storeName: string
}

export type PutStoreConfigurationParams = {
    accountDomain: string
    storeName: string
    storeConfiguration: StoreConfiguration
}

export type GetStoreConfigurationResponse = {
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

    dryRun: boolean
    isDraft: boolean
    silentHandover: boolean
    ticketSampleRate: number
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

// Playground
export type AiAgentResponse = {
    generate: {
        output: {
            generated_message: string
            outcome: string
        }
    }
}
