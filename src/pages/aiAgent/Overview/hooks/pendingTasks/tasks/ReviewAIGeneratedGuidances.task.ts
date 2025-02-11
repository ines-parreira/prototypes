import {RuleEngineData, RuleEngineRoutes} from '../ruleEngine'
import {Task} from './Task'

export class ReviewAIGeneratedGuidancesTask extends Task {
    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Review AI Generated Guidances',
            'Review and edit the Guidances we generated for you',
            'RECOMMENDED',
            data,
            routes
        )
    }

    // Have at least 1 AI guidance generated in unlisted visibility
    protected shouldBeDisplayed(data: RuleEngineData): boolean {
        return (
            data.guidances.filter(
                (g) =>
                    g.templateKey?.startsWith('ai_guidance') &&
                    g.visibility === 'UNLISTED'
            ).length > 0
        )
    }

    protected getFeatureUrl(
        _data: RuleEngineData,
        routes: RuleEngineRoutes
    ): string {
        return routes.aiAgentRoutes.guidance
    }
}
