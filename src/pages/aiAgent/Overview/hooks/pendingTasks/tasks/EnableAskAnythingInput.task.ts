import { AiAgentScope } from 'models/aiAgent/types'
import { getChatActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'

import { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { Task } from './Task'

export class EnableAskAnythingInputTask extends Task {
    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Enable Ask anything input for Chat',
            'Drive more sales by encouraging Shoppers to start a chat.',
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
            data.isAiShoppingAssistantEnabled &&
            data.aiAgentStoreConfiguration.scopes.includes(
                AiAgentScope.Sales,
            ) &&
            !data.aiAgentStoreConfiguration.floatingChatInputConfiguration
                ?.isEnabled
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
