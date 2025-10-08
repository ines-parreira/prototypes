import { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { Task } from './Task'

export class SelectYourChatTask extends Task {
    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Select your chat',
            'Connecting your chat is mandatory to be able to turn on AI Agent on chat',
            'RECOMMENDED',
            data,
            routes,
        )
    }

    protected isAvailable(data: RuleEngineData): boolean {
        return !!data?.aiAgentStoreConfiguration
    }

    protected shouldBeDisplayed(data: RuleEngineData): boolean {
        const hasNoMonitoredChatIntegrations =
            !data.aiAgentStoreConfiguration.monitoredChatIntegrations.length
        const hasAvailableChatIntegrations =
            !!data.selfServiceChatChannels.length

        return hasNoMonitoredChatIntegrations && hasAvailableChatIntegrations
    }

    protected getFeatureUrl({
        routes: { aiAgentRoutes },
    }: {
        data: RuleEngineData
        routes: RuleEngineRoutes
    }): string {
        return aiAgentRoutes.deployChat
    }
}
