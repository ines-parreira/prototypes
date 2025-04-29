import { RuleEngineData, RuleEngineRoutes } from '../../ruleEngine'

export const buildRuleEngineData = (
    data: Partial<RuleEngineData>,
): RuleEngineData => ({
    aiAgentStoreConfiguration: {} as any,
    fileIngestion: [],
    faqHelpCenters: [],
    guidances: [],
    actions: [],
    aiAgentPlaygroundExecutions: {} as any,
    emailIntegrations: [],
    shopifyIntegration: {} as any,
    chatIntegrationsStatus: {} as any,
    ticketView: {} as any,
    pageInteractions: {} as any,
    isActivationEnabled: false,
    isConvertFloatingChatInputEnabled: false,
    ...data,
})

export const buildRuleEngineRoutes = (): RuleEngineRoutes => ({
    aiAgentRoutes: {} as any,
})
