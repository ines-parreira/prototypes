import { AiAgentScope } from 'models/aiAgent/types'
import { getChatActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'

import { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { Task } from './Task'

export class EnableTriggerOnSearchTask extends Task {
    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Enable Trigger on Search',
            'Proactively reach out to shoppers after a search.',
            'RECOMMENDED',
            data,
            routes,
        )
    }

    protected isAvailable(data: RuleEngineData): boolean {
        return !!data?.aiAgentStoreConfiguration
    }

    protected shouldBeDisplayed(data: RuleEngineData): boolean {
        const { enabled: isChatEnabled } = getChatActivation({
            storeConfiguration: data.aiAgentStoreConfiguration,
            chatIntegrationStatus: data.chatIntegrationsStatus,
            selfServiceChatChannels: data.selfServiceChatChannels,
            helpCentersFaq: data.faqHelpCenters,
            storeKnowledgeStatus: data.storeKnowledgeStatus,
        })

        return (
            isChatEnabled &&
            !data.aiAgentStoreConfiguration.isSalesHelpOnSearchEnabled &&
            data.aiAgentStoreConfiguration.scopes.includes(AiAgentScope.Sales)
        )
    }

    protected getFeatureUrl({
        routes: { aiAgentRoutes },
    }: {
        data: RuleEngineData
        routes: RuleEngineRoutes
    }): string {
        return aiAgentRoutes.customerEngagement
    }
}
