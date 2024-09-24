import {AiAgentChannel, ToneOfVoice} from 'pages/automate/aiAgent/constants'

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
    withWizard?: boolean
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

    toneOfVoice: ToneOfVoice
    customToneOfVoiceGuidance: string | null
    signature: string
    excludedTopics: string[]
    tags: Tag[]
    conversationBot: ConversationBot
    monitoredEmailIntegrations: EmailIntegration[]
    monitoredChatIntegrations: number[]

    silentHandover: boolean
    ticketSampleRate: number

    dryRun: boolean
    isDraft: boolean

    wizardId: number | null
    wizard?: Wizard
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
    | 'monitoredChatIntegrations'
> &
    WizardProps

export type UpsertStoreConfigurationPayload = StoreConfiguration

export type Tag = {
    name: string
    description: string
}

export type WelcomePageAcknowledgedResponse = {
    acknowledged: boolean
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

export type WizardStepData = {
    hasEducationStepEnabled: boolean | null
    enabledChannels: AiAgentChannel[] | null
    isAutoresponderTurnedOff: boolean | null
    onCompletePathway: string | null
}

export type Wizard = {
    id?: number
    stepName: AiAgentOnboardingWizardStep | null
    stepData: WizardStepData
    completedDatetime?: string | null
}

export type CreateWizardPayload = Pick<Wizard, 'stepName' | 'stepData'>

type WizardProps = {
    wizard?: CreateWizardPayload
}
