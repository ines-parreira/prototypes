import { AiAgentScope } from 'models/aiAgent/types'
import { getChatActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'

import { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { Task } from './Task'

export class EnableSuggestedProductQuestionsTask extends Task {
    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Enable Suggested Product Questions',
            'Show dynamic AI-generated questions on product pages',
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
            !data.aiAgentStoreConfiguration.isConversationStartersEnabled
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
