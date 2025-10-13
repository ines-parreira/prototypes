import { AiAgentScope } from 'models/aiAgent/types'

import { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { Task } from './Task'

export class PrepareAskAnythingInputTask extends Task {
    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Enable Ask anything input for Chat',
            'Drive more sales by encouraging Shoppers to start a chat.',
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
            ) &&
            !data.aiAgentStoreConfiguration.floatingChatInputConfiguration
                ?.isEnabled
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
