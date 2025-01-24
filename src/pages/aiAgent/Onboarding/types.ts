export enum WizardStepEnum {
    SKILLSET = 'skillset',
    EMAIL_INTEGRATION = 'email integration',
    SHOPIFY_INTEGRATION = 'shopify integration',
    CHANNELS = 'channels',
    TONE_OF_VOICE = 'tone of voice',
    // This is skipped if it does not have sales skillset.
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
    emailChannelEnabled?: boolean
    emailIntegrationIds?: number[]
    chatChannelEnabled?: boolean
    chatIntegrationIds?: number[]
}
