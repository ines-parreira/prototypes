import {RuleEngineData, RuleEngineRoutes} from '../ruleEngine'
import {Task} from './Task'

export class Create3to5GuidancesTask extends Task {
    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Create 3 to 5 Guidances',
            'Expand AI Agent’s expertise on key topics or inquiries',
            'RECOMMENDED',
            data,
            routes
        )
    }

    // Less than 3 guidances created, but at least one guidance created
    protected shouldBeDisplayed(data: RuleEngineData): boolean {
        return data.guidances.length > 0 && data.guidances.length < 3
    }

    protected getFeatureUrl({
        routes: {aiAgentRoutes},
    }: {
        data: RuleEngineData
        routes: RuleEngineRoutes
    }): string {
        return aiAgentRoutes.guidance
    }
}
