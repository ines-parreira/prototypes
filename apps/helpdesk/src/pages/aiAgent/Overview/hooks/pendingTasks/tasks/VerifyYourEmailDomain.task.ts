import { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { Task } from './Task'

export class VerifyYourEmailDomainTask extends Task {
    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Verify your email domain',
            'Make sure your customer receive all your emails',
            'RECOMMENDED',
            data,
            routes,
        )
    }

    protected isAvailable(data: RuleEngineData): boolean {
        return !!data?.aiAgentStoreConfiguration
    }

    // Email channel should be activated
    // AND at least one email integration connected to the ai agent store configuration is not verified
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

        const firstUnverifiedEmailDomain =
            this.getFirstUnverifiedEmailIntegration(data)

        return !!firstUnverifiedEmailDomain
    }

    protected getFeatureUrl({
        data,
    }: {
        data: RuleEngineData
        routes: RuleEngineRoutes
    }): string {
        return `/app/settings/channels/email/${this.getFirstUnverifiedEmailIntegration(data)?.id}/verification`
    }

    private getFirstUnverifiedEmailIntegration(data: RuleEngineData) {
        const notVerifiedEmailIntegrationsIds = (data.emailIntegrations ?? [])
            .filter((emailIntegration) => !emailIntegration.isVerified)
            .map((ei) => ei.id)

        return data.aiAgentStoreConfiguration.monitoredEmailIntegrations.find(
            (ei) => notVerifiedEmailIntegrationsIds.includes(ei.id),
        )
    }
}
