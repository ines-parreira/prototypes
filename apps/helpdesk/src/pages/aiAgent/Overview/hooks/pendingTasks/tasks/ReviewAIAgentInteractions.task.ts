import { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { Task } from './Task'

export class ReviewAIAgentInteractionsTask extends Task {
    public readonly taskType = 'ReviewAIAgentInteractionsTask'

    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Review AI Agent interactions',
            'Review tickets to validate quality and spot improvement',
            'RECOMMENDED',
            data,
            routes,
        )
    }

    protected isAvailable(data: RuleEngineData): boolean {
        return !!data?.aiAgentStoreConfiguration || !!data?.ticketView
    }

    protected shouldBeDisplayed(): boolean {
        return true
    }

    protected getFeatureUrl({
        data: { ticketToReviewViewData },
    }: {
        data: RuleEngineData
        routes: RuleEngineRoutes
    }): string {
        if (!ticketToReviewViewData?.viewId) {
            return '/app/views'
        }

        return `/app/views/${ticketToReviewViewData.viewId}`
    }

    protected getIsCheckedAutomatically(): boolean {
        return false
    }

    protected isAlwaysAvailable(): boolean {
        return true
    }
}
