import { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { Task } from './Task'

export class SetUpYourEmailTask extends Task {
    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Set up your email',
            'Connecting your email is mandatory to be able to turn on AI Agent',
            'BASIC',
            data,
            routes,
        )
    }

    protected isAvailable(data: RuleEngineData): boolean {
        return !!data?.emailIntegrations
    }

    // No email integration has been set up yet (excluding default)
    protected shouldBeDisplayed(data: RuleEngineData): boolean {
        // TODO: add condition "Email selected in onboarding settings is other provider" when settings API is connected
        return !(data.emailIntegrations ?? []).filter(
            (emailIntegration) => !emailIntegration.isDefault,
        ).length
    }

    protected getFeatureUrl(): string {
        return '/app/settings/channels/email/new/onboarding'
    }
}
