import {
    FocusActivationModal,
    getAiSalesAgentEmailEnabledFlag,
} from 'pages/aiAgent/Activation/utils'

import { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { Task } from './Task'

export class EnableAIAgentOnEmailTask extends Task {
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

    // Email channel should be deactivated in ai agent store configuration
    protected shouldBeDisplayed(data: RuleEngineData): boolean {
        return (
            data.aiAgentStoreConfiguration.emailChannelDeactivatedDatetime !==
            null
        )
    }

    protected getFeatureUrl({
        routes: { aiAgentRoutes },
        data,
    }: {
        data: RuleEngineData
        routes: RuleEngineRoutes
    }): string {
        if (data.isActivationEnabled) {
            const { storeName } = data.aiAgentStoreConfiguration
            return `${aiAgentRoutes.overview}?${FocusActivationModal.buildSearchParam(storeName)}`
        }
        return aiAgentRoutes.settingsChannels
    }
}
