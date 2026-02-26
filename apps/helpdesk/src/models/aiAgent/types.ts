import type { JourneyTypeEnum } from '@gorgias/convert-client'

import type { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import type { AiAgentChannel, ToneOfVoice } from 'pages/aiAgent/constants'
import type { DiscountStrategy } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import type { PersuasionLevel } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import type { AiAgentScopes } from 'pages/aiAgent/Onboarding/types'
import type { PlaygroundChannelAvailability } from 'pages/aiAgent/PlaygroundV2/types'

export type Verbosity = 'concise' | 'balanced' | 'detailed'

export type AccountConfigurationResponse = {
    accountConfiguration: Omit<AccountConfiguration, 'helpdeskOAuth'>
}

export type AccountConfiguration = {
    accountId: number
    gorgiasDomain: string
    conversationBot?: ConversationBot
    httpIntegration?: {
        id: number
    }
    views?: { [key: string]: { id: number } }
    helpdeskOAuth: { accessToken: string } | null
    customFieldIds: number[]
}

export type AccountConfigurationWithHttpIntegration = AccountConfiguration & {
    httpIntegration: { id: number }
}

export type GetStoreConfigurationParams = {
    accountDomain: string
    storeName: string
    withWizard?: boolean
    withFloatingInput?: boolean
}

export type GetStoreConfigurationForAccountParams = {
    accountDomain: string
}

export type GetStoreHandoverConfigurationParams = {
    accountDomain: string
    storeName: string
    channel?: AiAgentChannel
}

export type StoreConfigurationResponse = {
    storeConfiguration: StoreConfiguration
}

export type StoreConfigurationsResponse = {
    storeConfigurations: StoreConfiguration[]
}

export type TrialConfiguration = {
    startDatetime: string | null
    endDatetime: string | null
    account: {
        optInDatetime: string | null
        optOutDatetime: string | null
        plannedUpgradeDatetime: string | null
        actualUpgradeDatetime: string | null
        actualTerminationDatetime: string | null
    }
}

type ResponseTrialType = 'ai-trial' | 'sales-assistant'

export type ResponseTrial = {
    shopType: string
    shopName: string
    type: ResponseTrialType
    trial: TrialConfiguration
}

export type Trial = {
    shopType: string
    shopName: string
    type: TrialType
    trial: TrialConfiguration
}

export type StoreConfiguration = {
    previewModeActivatedDatetime: string | null
    storeName: string
    shopType: string

    helpCenterId: number | null

    snippetHelpCenterId: number
    guidanceHelpCenterId: number

    useEmailIntegrationSignature: boolean
    toneOfVoice: ToneOfVoice
    customToneOfVoiceGuidance: string | null
    aiAgentLanguage: string | null
    signature: string
    smsDisclaimer?: string | null
    excludedTopics: string[]
    tags: Tag[]
    conversationBot: ConversationBot
    monitoredEmailIntegrations: EmailIntegration[]
    monitoredSmsIntegrations: number[]
    monitoredChatIntegrations: number[]

    silentHandover: boolean
    ticketSampleRate: number

    dryRun: boolean
    isDraft: boolean

    wizardId: number | null
    wizard?: Wizard

    floatingChatInputConfigurationId: number | null
    floatingChatInputConfiguration?: FloatingChatInputConfiguration

    chatChannelDeactivatedDatetime: string | null
    emailChannelDeactivatedDatetime: string | null
    smsChannelDeactivatedDatetime: string | null
    previewModeValidUntilDatetime: string | null
    isPreviewModeActive?: boolean

    scopes: AiAgentScope[]

    createdDatetime: string

    salesDiscountMax: number | null
    salesDiscountStrategyLevel: DiscountStrategy | null
    salesPersuasionLevel: PersuasionLevel | null
    salesDeactivatedDatetime: string | null

    isConversationStartersEnabled: boolean
    embeddedSpqEnabled: boolean
    isSalesHelpOnSearchEnabled: boolean | null
    customFieldIds: number[]

    sales?: {
        trial: TrialConfiguration
    }
    trial?: TrialConfiguration

    handoverMethod: string | null
    handoverEmail: string | null
    handoverEmailIntegrationId: number | null
    handoverHttpIntegrationId: number | null

    toneOfVoiceByChannel?: {
        email?: {
            customToneOfVoice: string
            verbosity?: Verbosity
        }
        chat?: {
            customToneOfVoice: string
            verbosity?: Verbosity
        }
        sms?: {
            customToneOfVoice: string
            verbosity?: Verbosity
        }
    }
    toneOfVoiceOptions?: {
        greetingGuidance: string
        signOffGuidance: string
        brandSpecificTerminology: string
        forbiddenPhrases: string
        emojisEnabled: boolean
        allowedEmojis: string
        forbiddenEmojis: string
    }
}

export type CreateStoreConfigurationPayload = Pick<
    StoreConfiguration,
    | 'storeName'
    | 'helpCenterId'
    | 'monitoredEmailIntegrations'
    | 'previewModeActivatedDatetime'
    | 'previewModeValidUntilDatetime'
    | 'customToneOfVoiceGuidance'
    | 'aiAgentLanguage'
    | 'signature'
    | 'smsDisclaimer'
    | 'useEmailIntegrationSignature'
    | 'monitoredChatIntegrations'
    | 'monitoredSmsIntegrations'
    | 'chatChannelDeactivatedDatetime'
    | 'emailChannelDeactivatedDatetime'
    | 'smsChannelDeactivatedDatetime'
    | 'excludedTopics'
    | 'customFieldIds'
    | 'handoverEmail'
    | 'handoverEmailIntegrationId'
    | 'handoverMethod'
    | 'handoverHttpIntegrationId'
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
    name: string
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

export type FloatingChatInputConfiguration = {
    id?: number
    isEnabled?: boolean
    isDesktopOnly?: boolean
    needHelpText?: string
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

export type TrialRequestNotification = {
    userId: number
    receivedDatetime: string
    trialType?: TrialType
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
    scrapingProcessingFinishedDatetime: string | null
    firstAiAgentTicketNotificationReceivedDatetime: string | null
    onboardingState: AiAgentOnboardingState | null
    trialRequestNotification: TrialRequestNotification[] | null
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

export type TransformToneOfVoiceMessage = {
    id: string
    message: string
    from_agent: boolean
}

export type TransformToneOfVoiceConversation = {
    id: string
    messages: TransformToneOfVoiceMessage[]
}

export type TransformToneOfVoiceResponse = {
    conversations: TransformToneOfVoiceConversation[]
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
    preview?: string
    isConversationStartersEnabled?: boolean
    isSalesHelpOnSearchEnabled?: boolean
    isAskAnythingInputEnabled?: boolean
    handoverMethod?: string
    handoverEmail?: string | null
    handoverEmailIntegrationId?: number | null
    handoverHttpIntegrationId?: number | null
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
    onlineInstructions: Maybe<string>
    offlineInstructions: Maybe<string>
    shareBusinessHours: boolean
}

export type HandoverConfigurationResponse = {
    handoverConfigurations: HandoverConfigurationData[]
}

export type TestModeSession = {
    id: string
    accountId: number
    creatorUserId: number
    createdDatetime: string
}

export type CreateTestSessionResponse = {
    testModeSession: TestModeSession
}

export type GetTestSessionLogsResponse = {
    logs: string[]
    id: string
    status: 'in-progress' | 'finished' | 'idle'
}

export type TriggerAIJourneyPayload = {
    accountId: number
    journeyId?: string | null
    journeyParticipationId?: string | null
    storeIntegrationId: number
    followUpAttempt: number
    storeName: string
    storeType: string
    journeyType: JourneyTypeEnum
    ticketId: string
    marketingId: string
    createdAt: string
    customer: {
        id: number
        phone: string
        timezone: string
        language: string
    }
    page?: {
        url: string | null
        productId: string | null
    }
    cart?: {
        cartToken: string
        lastCartUpdate: string
        currency: string
        abandonedCheckoutUrl: string
        lineItems: Array<{
            variantId: string
            productId: string
            quantity: number
            linePrice: number
        }>
    }
    settings: {
        maxFollowUpMessages: number | null
        smsSenderNumber: string | null
        smsSenderIntegrationId: number | null
        offerDiscount: boolean
        maxDiscountPercent?: number | null
        brandName?: string | null
        optOutMessage?: string | null
        discountCodeMessageThreshold?: number | null
    }
    executionMode: 'regular' | 'test' | 'dry-run' | 'trial'
    journeyMessageInstructions?: string | null
    testModeSessionId?: string
    order?: {
        id: string
        lineItems: Array<{
            productId: string
            variantId: string
            quantity: number
            price: string
            title: string
        }>
        totalPrice: number
        currency: string
        financialStatus: string
        fulfillmentStatus: string | null
        createdAt: string
    }
    returningCustomer?: boolean
}

export type TriggerAIJourneyResponse = {
    message: string
    data: {
        ticketId: string
        executionId: string
    }
}

export type KnowledgeOverrideRule = {
    name: string
    knowledge: {
        sourceId: number
        sourceSetId: number
    }[]
}

export type ChatConfig = {
    availability: PlaygroundChannelAvailability
    integrationId: number
}

export type AiAgentPlaygroundOptions = {
    areActionsAllowedToExecute: boolean
    offlineEvalSettings?: {
        app: {
            evaluatedUseCase?: string
            shopName: string
            shopType: string
            gorgiasDomain: string
        }
        user: {
            id: string
            name: string
        }
        session: {
            channel?: string
        }
        knowledgeOverrideRules?: KnowledgeOverrideRule[]
        chatConfig?: ChatConfig
    }
}

export type TestModeSessionUserMessageContent = {
    type: 'text'
    text: string
}

export type TestModeSessionUserMessage = {
    type: 'message'
    role: 'user'
    content: TestModeSessionUserMessageContent[]
}

export type TestModeSessionMessagePayload = {
    sessionId: string
    userMessage: TestModeSessionUserMessage
    isDirectModelCall: boolean
}

export type TestModeSessionMessageResponse = {
    sessionId: string
    workflow: {
        workflowId: string
        runId: string
    }
}
