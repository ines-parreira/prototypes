import { VisibilityStatusEnum } from 'models/helpCenter/types'

import type { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { Task } from './Task'

export class ReviewAIGeneratedGuidancesTask extends Task {
    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Review AI Generated Guidances',
            'Review and edit the Guidances we generated for you',
            'RECOMMENDED',
            data,
            routes,
        )
    }

    protected isAvailable(data: RuleEngineData): boolean {
        return !!data?.guidances
    }
    // Have at least 1 AI guidance generated in unlisted visibility
    protected shouldBeDisplayed(data: RuleEngineData): boolean {
        return (
            (data.guidances ?? []).filter(
                (g) =>
                    g.templateKey?.startsWith('ai_guidance') &&
                    g.visibility === VisibilityStatusEnum.UNLISTED,
            ).length > 0
        )
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
