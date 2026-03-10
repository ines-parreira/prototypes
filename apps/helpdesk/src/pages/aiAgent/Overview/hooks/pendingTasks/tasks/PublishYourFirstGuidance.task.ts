import { VisibilityStatusEnum } from 'models/helpCenter/types'

import type { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { Task } from './Task'

export class PublishYourFirstGuidanceTask extends Task {
    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Publish your first Guidance',
            'Make AI Agent follow your instructions on how to handle key topics',
            'RECOMMENDED',
            data,
            routes,
        )
    }
    protected isAvailable(data: RuleEngineData): boolean {
        return !!data?.guidances
    }

    // Only draft guidances
    protected shouldBeDisplayed(data: RuleEngineData): boolean {
        if (!data?.guidances) {
            return false
        }

        return (
            data.guidances.length > 0 &&
            data.guidances.filter(
                (g) => g.visibility === VisibilityStatusEnum.UNLISTED,
            ).length === data.guidances.length
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
