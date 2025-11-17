import { getAiSalesAgentEmailEnabledFlag } from 'pages/aiAgent/Activation/utils'

import type { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { Task } from './Task'

export class EnableAIAgentOnEmailTask extends Task {
    public readonly taskType = 'EnableAIAgentOnEmailTask'

    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Enable AI Agent on Email',
            getAiSalesAgentEmailEnabledFlag()
                ? 'Automates up to 60% of email support tickets'
                : 'Automates up to 60% of support tickets',
            'BASIC',
            data,
            routes,
        )
    }

    protected isAvailable(data: RuleEngineData): boolean {
        return !!data?.aiAgentStoreConfiguration
    }

    protected shouldBeDisplayed(data: RuleEngineData): boolean {
        const hasSelectedEmails =
            data.aiAgentStoreConfiguration.monitoredEmailIntegrations.length > 0
        const isEmailChannelDeactivated =
            data.aiAgentStoreConfiguration.emailChannelDeactivatedDatetime !==
            null

        return (
            !data.isStandaloneMerchant &&
            hasSelectedEmails &&
            isEmailChannelDeactivated
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

    protected getIsCheckedAutomatically(): boolean {
        return true
    }

    protected getIsCompleted(data: RuleEngineData): boolean {
        return !data.aiAgentStoreConfiguration.emailChannelDeactivatedDatetime
    }
}
