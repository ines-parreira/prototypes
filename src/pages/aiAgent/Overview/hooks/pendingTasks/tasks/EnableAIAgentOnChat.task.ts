import { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { Task } from './Task'

export class EnableAIAgentOnChatTask extends Task {
    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Enable AI Agent on Chat',
            'Boost GMV through automated sales',
            'BASIC',
            data,
            routes,
        )
    }

    // Email channel should be deactivated in ai agent store configuration
    protected shouldBeDisplayed(data: RuleEngineData): boolean {
        return (
            data.aiAgentStoreConfiguration.chatChannelDeactivatedDatetime !==
            null
        )
    }

    protected getFeatureUrl({
        routes: { aiAgentRoutes },
    }: {
        data: RuleEngineData
        routes: RuleEngineRoutes
    }): string {
        return aiAgentRoutes.settingsChannels
    }
}
