import { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { Task } from './Task'

export class SetupAiAgentTask extends Task {
    constructor(routes: RuleEngineRoutes) {
        super(
            'Start your onboarding flow',
            'Set-up AI Agent in just a couple steps',
            'BASIC',
            // this task does not need any data to be displayed
            {} as any,
            routes,
        )
    }

    protected isAvailable(__data: RuleEngineData): boolean {
        // This task is always available
        return true
    }

    // This task is a particular one, it should always be displayed because it's outside of the rule engine
    protected shouldBeDisplayed(__data: RuleEngineData): boolean {
        return true
    }

    protected getFeatureUrl({
        routes: { aiAgentRoutes },
    }: {
        data: RuleEngineData
        routes: RuleEngineRoutes
    }): string {
        return aiAgentRoutes.onboardingWizard
    }
}
