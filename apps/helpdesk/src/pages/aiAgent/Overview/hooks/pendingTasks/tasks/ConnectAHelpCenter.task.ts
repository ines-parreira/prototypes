import type { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { Task } from './Task'

export class ConnectAHelpCenterTask extends Task {
    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Connect a Help-Center',
            'Help AI Agent give accurate answers by accessing your knowledge',
            'RECOMMENDED',
            data,
            routes,
        )
    }

    protected isAvailable(data: RuleEngineData): boolean {
        return !!data?.aiAgentStoreConfiguration && !!data?.faqHelpCenters
    }

    // Help center id should not be set in ai agent store configuration
    // and there should be at least one faq help center created
    // REMARK: I think the condition on the faq help centers is redundant, as the help center id should be null if there are no faq help centers
    protected shouldBeDisplayed(data: RuleEngineData): boolean {
        return (
            data.aiAgentStoreConfiguration.helpCenterId === null &&
            (data.faqHelpCenters?.length ?? 0) > 0
        )
    }

    protected getFeatureUrl({
        routes: { aiAgentRoutes },
    }: {
        data: RuleEngineData
        routes: RuleEngineRoutes
    }): string {
        return aiAgentRoutes.knowledge
    }
}
