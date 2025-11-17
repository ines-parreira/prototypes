import type { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { Task } from './Task'

export class SetYourActionsLiveTask extends Task {
    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Set your Action live',
            'Allow AI Agent to execute support Actions',
            'RECOMMENDED',
            data,
            routes,
        )
    }

    protected isAvailable(data: RuleEngineData): boolean {
        return !!data?.actions
    }

    // Has at least 1 draft action
    protected shouldBeDisplayed(data: RuleEngineData): boolean {
        return (data.actions ?? []).some((action) => action.is_draft)
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
