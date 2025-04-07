import { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { Task } from './Task'

export class UpdateYourDiscountStrategyTask extends Task {
    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Update your discount strategy',
            'Increase by 50% your conversion rate',
            'RECOMMENDED',
            data,
            routes,
        )
    }

    // Has a discount strategy level activated
    protected shouldBeDisplayed(data: RuleEngineData): boolean {
        return (
            data.aiAgentStoreConfiguration.salesDiscountStrategyLevel !== 'none'
        )
    }

    protected getFeatureUrl({
        routes: { aiAgentRoutes },
    }: {
        data: RuleEngineData
        routes: RuleEngineRoutes
    }): string {
        return aiAgentRoutes.sales
    }
}
