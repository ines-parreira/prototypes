import {RuleEngineDataContext, RuleEngineRoutesContext} from '../ruleEngine'
import {Task} from './Task'

export class EnableAIAgentOnChatTask extends Task {
    constructor(data: RuleEngineDataContext, routes: RuleEngineRoutesContext) {
        super(
            'Enable AI Agent on Chat',
            'Boost GMV through automated sales.',
            'BASIC',
            data,
            routes
        )
    }

    // Email channel should be deactivated in ai agent store configuration
    protected shouldBeDisplayed(data: RuleEngineDataContext): boolean {
        return (
            data.aiAgentStoreConfiguration.chatChannelDeactivatedDatetime !==
            null
        )
    }

    protected getFeatureUrl(
        _data: RuleEngineDataContext,
        routes: RuleEngineRoutesContext
    ): string {
        return routes.aiAgentRoutes.settingsChannels
    }
}
