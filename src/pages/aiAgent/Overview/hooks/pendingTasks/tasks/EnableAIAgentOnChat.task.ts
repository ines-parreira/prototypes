import {
    FocusActivationModal,
    getAiSalesAgentEmailEnabledFlag,
} from 'pages/aiAgent/Activation/utils'

import { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { Task } from './Task'

export class EnableAIAgentOnChatTask extends Task {
    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Enable AI Agent on Chat',
            getAiSalesAgentEmailEnabledFlag()
                ? 'Automates up to 60% of chat support tickets'
                : 'Boost GMV through automated sales',
            'BASIC',
            data,
            routes,
        )
    }

    protected isAvailable(data: RuleEngineData): boolean {
        return !!data?.aiAgentStoreConfiguration
    }

    protected shouldBeDisplayed(data: RuleEngineData): boolean {
        const uninstalledChats = new Set(
            data.chatIntegrationsStatus
                ?.filter(({ installed }) => !installed)
                .map(({ chatId }) => chatId),
        )
        const hasUninstalledSelectedChats =
            data.aiAgentStoreConfiguration.monitoredChatIntegrations.some(
                (chatId) => uninstalledChats.has(chatId),
            )

        const hasSelectedChats =
            data.aiAgentStoreConfiguration.monitoredChatIntegrations.length > 0

        const isChatChannelDeactivated =
            data.aiAgentStoreConfiguration.chatChannelDeactivatedDatetime !==
            null

        return (
            hasSelectedChats &&
            !hasUninstalledSelectedChats &&
            isChatChannelDeactivated
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
