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
        return !!data?.aiAgentStoreConfiguration
    }

    protected shouldBeDisplayed(data: RuleEngineData): boolean {
        return (
            !data.isStandaloneMerchant &&
            !data.aiAgentStoreConfiguration.monitoredEmailIntegrations.length
        )
    }

    protected getFeatureUrl({
        data,
        routes,
    }: {
        data: RuleEngineData
        routes: RuleEngineRoutes
    }): string {
        const hasAvailableEmailIntegrations = !!data.emailIntegrations?.find(
            ({ id }) => {
                return !data.alreadyUsedEmailIntegrationsIds?.includes(id)
            },
        )

        return hasAvailableEmailIntegrations
            ? routes.aiAgentRoutes.deployEmail
            : '/app/settings/channels/email/new/onboarding'
    }
}
