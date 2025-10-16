import { AiAgentScope } from 'models/aiAgent/types'

import { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { Task } from './Task'

export class PrepareSuggestedProductQuestionsTask extends Task {
    public readonly taskType = 'PrepareSuggestedProductQuestionsTask'

    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Enable Suggested Product Questions',
            'Show dynamic AI-generated questions on product pages',
            'RECOMMENDED',
            data,
            routes,
        )
    }

    protected isAvailable(data: RuleEngineData): boolean {
        return !!data?.aiAgentStoreConfiguration
    }

    protected shouldBeDisplayed(data: RuleEngineData): boolean {
        return (
            data.aiAgentStoreConfiguration.scopes.includes(
                AiAgentScope.Sales,
            ) && !data.aiAgentStoreConfiguration.isConversationStartersEnabled
        )
    }

    protected getFeatureUrl({
        routes: { aiAgentRoutes },
    }: {
        data: RuleEngineData
        routes: RuleEngineRoutes
    }): string {
        return aiAgentRoutes.customerEngagement
    }

    protected getIsCheckedAutomatically(): boolean {
        return true
    }
}
