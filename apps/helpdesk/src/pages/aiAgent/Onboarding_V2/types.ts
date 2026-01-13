import type { DiscountStrategy } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/DiscountStrategy'
import type { PersuasionLevel } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/PersuasionLevel'

export enum WizardStepEnum {
    EMAIL_INTEGRATION = 'email integration',
    SHOPIFY_INTEGRATION = 'shopify integration',
    CHANNELS = 'channels',
    PERSONALITY_PREVIEW = 'personality preview',
    SALES_PERSONALITY = 'sales personality',
    KNOWLEDGE = 'knowledge',
    ENGAGEMENT = 'engagement',
    HANDOVER = 'handover',
}

export enum AiAgentScopes {
    SALES = 'sales',
    SUPPORT = 'support',
}

export type OnboardingContextData = {
    lastStep: WizardStepEnum
    scope: AiAgentScopes[]
    shopName?: string
    emailChannelEnabled?: boolean
    emailIntegrationIds?: number[]
    chatChannelEnabled?: boolean
    chatIntegrationIds?: number[]
    persuasionLevel?: PersuasionLevel
    discountStrategy?: DiscountStrategy
    maxDiscountPercentage?: number
    helpCenterId?: string
}
