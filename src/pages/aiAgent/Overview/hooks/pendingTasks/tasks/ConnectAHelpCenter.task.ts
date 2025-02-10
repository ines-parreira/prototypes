import {RuleEngineDataContext, RuleEngineRoutesContext} from '../ruleEngine'
import {Task} from './Task'

export class ConnectAHelpCenterTask extends Task {
    constructor(data: RuleEngineDataContext, routes: RuleEngineRoutesContext) {
        super(
            'Connect a Help-Center',
            'Help AI Agent give accurate answers by accessing your knowledge.',
            'RECOMMENDED',
            data,
            routes
        )
    }

    // Help center id should not be set in ai agent store configuration
    // and there should be at least one help center created
    protected shouldBeDisplayed(data: RuleEngineDataContext): boolean {
        return (
            data.aiAgentStoreConfiguration.helpCenterId === null &&
            data.helpCenters.length > 0
        )
    }

    protected getFeatureUrl(): string {
        return '/app/settings/help-center'
    }
}
