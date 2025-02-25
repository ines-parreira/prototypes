import { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { Task } from './Task'

export class CreateYourFirstGuidanceTask extends Task {
    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Create your first Guidance',
            'Tell AI Agent how to handle specific topics or inquiries',
            'RECOMMENDED',
            data,
            routes,
        )
    }

    // No guidances including draft ones
    protected shouldBeDisplayed(data: RuleEngineData): boolean {
        return data.guidances.length === 0
    }

    protected getFeatureUrl({
        routes: { aiAgentRoutes },
    }: {
        data: RuleEngineData
        routes: RuleEngineRoutes
    }): string {
        return aiAgentRoutes.guidance
    }
}
