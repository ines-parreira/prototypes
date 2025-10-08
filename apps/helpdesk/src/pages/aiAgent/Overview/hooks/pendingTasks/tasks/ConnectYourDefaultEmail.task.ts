import { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { Task } from './Task'

export class ConnectYourDefaultEmailTask extends Task {
    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Connect your default email',
            'Increase your AI Agent’s coverage by connect your default email',
            'RECOMMENDED',
            data,
            routes,
        )
    }

    protected isAvailable(data: RuleEngineData): boolean {
        return !!data?.aiAgentStoreConfiguration && !!data?.emailIntegrations
    }

    // Email channel should be activated
    // AND there should be at least one email integration
    // AND the default email must be connected to the ai agent store configuration
    protected shouldBeDisplayed(data: RuleEngineData): boolean {
        if (data.isStandaloneMerchant) {
            return false
        }

        if (
            data.aiAgentStoreConfiguration.emailChannelDeactivatedDatetime !==
            null
        ) {
            return false
        }

        const defaultEmailIntegration = (data?.emailIntegrations ?? []).find(
            (emailIntegration) => emailIntegration.isDefault,
        )

        if (!defaultEmailIntegration) {
            return false
        }

        return data.aiAgentStoreConfiguration.monitoredEmailIntegrations.every(
            (ei) => ei.id !== defaultEmailIntegration.id,
        )
    }

    protected getFeatureUrl({
        routes: { aiAgentRoutes },
    }: {
        data: RuleEngineData
        routes: RuleEngineRoutes
    }): string {
        return aiAgentRoutes.deployEmail
    }
}
