import type { DiscountStrategy } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/DiscountStrategy'
import type { PersuasionLevel } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/PersuasionLevel'

export enum WizardStepEnum {
    SHOPIFY_INTEGRATION = 'shopify integration',
    TONE_OF_VOICE = 'tone of voice',
    SALES_PERSONALITY = 'sales personality',
    KNOWLEDGE = 'knowledge',
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
    persuasionLevel?: PersuasionLevel
    discountStrategy?: DiscountStrategy
    maxDiscountPercentage?: number
    helpCenterId?: string
}
