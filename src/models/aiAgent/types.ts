import { AiAgentChannel, ToneOfVoice } from 'pages/aiAgent/constants'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import { AiAgentScopes } from 'pages/aiAgent/Onboarding/types'

export type AccountConfigurationResponse = {
    accountConfiguration: Omit<AccountConfiguration, 'helpdeskOAuth'>
}

export type AccountConfiguration = {
    accountId: number
    gorgiasDomain: string
    httpIntegration?: {
        id: number
    }
    views?: { [key: string]: { id: number } }
    helpdeskOAuth: { accessToken: string } | null
}

export type AccountConfigurationWithHttpIntegration = AccountConfiguration & {
    httpIntegration: { id: number }
}

export type GetStoreConfigurationParams = {
    accountDomain: string
    storeName: string
    withWizard?: boolean
}

export type GetStoreConfigurationForAccountParams = {
    accountDomain: string
    storesName: string[]
    withWizard?: boolean
}

export type GetStoreHandoverConfigurationParams = {
    accountDomain: string
    storeName: string
    channel?: AiAgentChannel
}

export type StoreConfigurationResponse = {
    storeConfiguration: StoreConfiguration
}

export type StoreConfiguration = {
    trialModeActivatedDatetime: string | null
    previewModeActivatedDatetime: string | null
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

    chatChannelDeactivatedDatetime: string | null
    emailChannelDeactivatedDatetime: string | null
    previewModeValidUntilDatetime: string | null
    isPreviewModeActive?: boolean

    scopes: AiAgentScope[]

    createdDatetime: string

    salesDiscountMax: number | null
    salesDiscountStrategyLevel: DiscountStrategy | null
    salesPersuasionLevel: PersuasionLevel | null

    isConversationStartersEnabled: boolean
}

export type CreateStoreConfigurationPayload = Pick<
    StoreConfiguration,
    | 'storeName'
    | 'helpCenterId'
    | 'monitoredEmailIntegrations'
    | 'trialModeActivatedDatetime'
    | 'previewModeActivatedDatetime'
    | 'previewModeValidUntilDatetime'
    | 'customToneOfVoiceGuidance'
    | 'signature'
    | 'monitoredChatIntegrations'
    | 'chatChannelDeactivatedDatetime'
    | 'emailChannelDeactivatedDatetime'
    | 'excludedTopics'
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
    Personalize = 'personalize',
    Knowledge = 'knowledge',
}

export enum AiAgentOnboardingWizardType {
    TwoSteps = '2-steps',
}

export enum AiAgentScope {
    Support = 'support',
    Sales = 'sales',
}

export type WizardStepData = {
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

export enum AiAgentOnboardingState {
    VisitedAiAgent = 'visited-ai-agent',
    StartedSetup = 'started-setup',
    FinishedSetup = 'finished-setup',
    Activated = 'activated',
    FullyOnboarded = 'fully-onboarded',
}

export type OnboardingNotificationState = {
    shopName: string
    welcomePageVisitedDatetimes: string[]
    testBeforeActivationDatetimes: string[]
    firstActivationDatetime: string | null
    startAiAgentSetupNotificationReceivedDatetime: string | null
    finishAiAgentSetupNotificationReceivedDatetime: string | null
    activateAiAgentNotificationReceivedDatetime: string | null
    meetAiAgentNotificationReceivedDatetime: string | null
    firstAiAgentTicketNotificationReceivedDatetime: string | null
    onboardingState: AiAgentOnboardingState | null
}

export type OnboardingNotificationStateResponse = {
    onboardingNotificationState: OnboardingNotificationState
}

export type CreateOnboardingNotificationStatePayload = Pick<
    OnboardingNotificationState,
    'shopName'
> &
    Partial<Omit<OnboardingNotificationState, 'shopName'>>

export type UpsertOnboardingNotificationStatePayload =
    OnboardingNotificationState

export type GetOnboardingNotificationStateParams = {
    accountDomain: string
    storeName: string | undefined
}

export type PlaygroundExecutions = {
    count: number
}

export type GetPlaygroundExecutionsParams = {
    accountDomain: string
    storeName: string
}

export type ToneOfVoiceResponse = {
    tone_of_voice: string
}

export type OnboardingData = {
    id: string
    currentStepName: string
    salesPersuasionLevel: PersuasionLevel | null
    salesDiscountStrategyLevel: DiscountStrategy | null
    salesDiscountMax: number | null
    scopes: AiAgentScopes[]
    shopName?: string
    shopType?: string
    emailChannelEnabled?: boolean
    emailIntegrationIds?: number[]
    chatChannelEnabled?: boolean
    chatIntegrationIds?: number[]
    helpCenterId?: string
    gorgiasDomain?: string
    completedDatetime?: string
    faqHelpCenterId?: number
    toneOfVoice?: string
    customToneOfVoiceGuidance?: string
}

export type SalesSettingsData = {
    salesPersuasionLevel: PersuasionLevel
    salesDiscountStrategyLevel: DiscountStrategy
    salesDiscountMax: number
}

export type HandoverConfigurationData = {
    accountId: number
    storeName: string
    shopType: string
    integrationId: number
    channel: AiAgentChannel
    onlineInstructions: string | null
    offlineInstructions: string | null
    shareBusinessHours: boolean
}

export type HandoverConfigurationResponse = {
    handoverConfigurations: HandoverConfigurationData[]
}

export type SalesVolumeData = {
    isConversationStartersEnabled: boolean
}
