import {RuleEngineDataContext, RuleEngineRoutesContext} from '../ruleEngine'
import {Task} from './Task'

export class EnableAIAgentOnEmailTask extends Task {
    constructor(data: RuleEngineDataContext, routes: RuleEngineRoutesContext) {
        super(
            'Enable AI Agent on Email',
            'Automates up to 60% of support tickets',
            'BASIC',
            data,
            routes
        )
    }

    // Email channel should be deactivated in ai agent store configuration
    protected shouldBeDisplayed(data: RuleEngineDataContext): boolean {
        return (
            data.aiAgentStoreConfiguration.emailChannelDeactivatedDatetime !==
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
