import { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { Task } from './Task'

export class CreateAnActionTask extends Task {
    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Create an Action',
            'Allow AI Agent to perform support Actions',
            'RECOMMENDED',
            data,
            routes,
        )
    }

    // No action available
    protected shouldBeDisplayed(data: RuleEngineData): boolean {
        return data.actions.length === 0
    }

    protected getFeatureUrl({
        routes: { aiAgentRoutes },
    }: {
        data: RuleEngineData
        routes: RuleEngineRoutes
    }): string {
        return aiAgentRoutes.actions
    }
}
