import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'

export const createMockTrialAccess = (overrides = {}) => ({
    canNotifyAdmin: false,
    canBookDemo: false,
    canSeeSystemBanner: false,
    canSeeTrialCTA: false,
    hasCurrentStoreTrialStarted: false,
    hasAnyTrialStarted: false,
    hasCurrentStoreTrialOptedOut: false,
    hasAnyTrialOptedOut: false,
    hasCurrentStoreTrialExpired: false,
    hasAnyTrialExpired: false,
    hasAnyTrialOptedIn: false,
    hasAnyTrialActive: false,
    hasAiAgentEnabledInCurrentStore: undefined,
    isAdminUser: false,
    isLoading: false,
    trialType: TrialType.ShoppingAssistant,
    currentAutomatePlan: undefined,
    ...overrides,
})
