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
    // and there should be at least one faq help center created
    // REMARK: I think the condition on the faq help centers is redundant, as the help center id should be null if there are no faq help centers
    protected shouldBeDisplayed(data: RuleEngineDataContext): boolean {
        return (
            data.aiAgentStoreConfiguration.helpCenterId === null &&
            data.faqHelpCenters.length > 0
        )
    }

    protected getFeatureUrl(): string {
        return '/app/settings/help-center'
    }
}
