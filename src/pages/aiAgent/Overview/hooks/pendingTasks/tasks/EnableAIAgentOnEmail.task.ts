import {RuleEngineData, RuleEngineRoutes} from '../ruleEngine'
import {Task} from './Task'

export class EnableAIAgentOnEmailTask extends Task {
    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Enable AI Agent on Email',
            'Automates up to 60% of support tickets',
            'BASIC',
            data,
            routes
        )
    }

    // Email channel should be deactivated in ai agent store configuration
    protected shouldBeDisplayed(data: RuleEngineData): boolean {
        return (
            data.aiAgentStoreConfiguration.emailChannelDeactivatedDatetime !==
            null
        )
    }

    protected getFeatureUrl(
        _data: RuleEngineData,
        routes: RuleEngineRoutes
    ): string {
        return routes.aiAgentRoutes.settingsChannels
    }
}
