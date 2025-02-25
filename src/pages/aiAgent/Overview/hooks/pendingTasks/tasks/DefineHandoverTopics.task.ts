import { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { Task } from './Task'

export class DefineHandoverTopicsTask extends Task {
    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Define handover topics',
            'Define topics for AI Agent to always hand over to agents',
            'RECOMMENDED',
            data,
            routes,
        )
    }

    // excludedTopics is empty in ai agent store configuration
    protected shouldBeDisplayed(data: RuleEngineData): boolean {
        return data.aiAgentStoreConfiguration.excludedTopics?.length === 0
    }

    protected getFeatureUrl({
        routes: { aiAgentRoutes },
    }: {
        data: RuleEngineData
        routes: RuleEngineRoutes
    }): string {
        return aiAgentRoutes.settings
    }
}
