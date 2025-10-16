import { AiAgentScope } from 'models/aiAgent/types'

import { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { Task } from './Task'

export class PrepareTriggerOnSearchTask extends Task {
    public readonly taskType = 'PrepareTriggerOnSearchTask'

    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Enable Trigger on Search',
            'Proactively reach out to shoppers after a search.',
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
            !data.aiAgentStoreConfiguration.isSalesHelpOnSearchEnabled &&
            !data.isTriggerOnSearchDisabled &&
            data.aiAgentStoreConfiguration.scopes.includes(AiAgentScope.Sales)
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
