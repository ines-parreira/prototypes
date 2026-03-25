import { DiscountStrategy } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/DiscountStrategy'

import type { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
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

    protected isAvailable(data: RuleEngineData): boolean {
        return !!data?.aiAgentStoreConfiguration
    }

    // Has no discount strategy level activated
    protected shouldBeDisplayed(data: RuleEngineData): boolean {
        return (
            data.aiAgentStoreConfiguration.salesDiscountStrategyLevel ===
                DiscountStrategy.NoDiscount ||
            data.aiAgentStoreConfiguration.salesDiscountStrategyLevel ===
                undefined
        )
    }

    protected getFeatureUrl({
        routes: { aiAgentRoutes },
    }: {
        data: RuleEngineData
        routes: RuleEngineRoutes
    }): string {
        return aiAgentRoutes.salesStrategy
    }
}
