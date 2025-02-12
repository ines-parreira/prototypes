import {RuleEngineData, RuleEngineRoutes} from '../../ruleEngine'

export const buildRuleEngineData = (
    data: Partial<RuleEngineData>
): RuleEngineData => ({
    aiAgentStoreConfiguration: {} as any,
    fileIngestion: [],
    faqHelpCenters: [],
    guidances: [],
    actions: [],
    aiAgentPlaygroundExecutions: {} as any,
    ...data,
})

export const buildRuleEngineRoutes = (): RuleEngineRoutes => ({
    aiAgentRoutes: {} as any,
})
