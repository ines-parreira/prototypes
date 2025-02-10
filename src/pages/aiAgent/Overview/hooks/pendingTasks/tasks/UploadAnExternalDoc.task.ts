import {RuleEngineDataContext, RuleEngineRoutesContext} from '../ruleEngine'
import {Task} from './Task'

export class UploadAnExternalDoc extends Task {
    constructor(data: RuleEngineDataContext, routes: RuleEngineRoutesContext) {
        super(
            'Upload an external doc',
            'Help AI Agent give accurate answers by accessing your documents.',
            'RECOMMENDED',
            data,
            routes
        )
    }

    // Email channel should be deactivated in ai agent store configuration
    protected shouldBeDisplayed(data: RuleEngineDataContext): boolean {
        return data.fileIngestion.length === 0
    }

    protected getFeatureUrl(
        _data: RuleEngineDataContext,
        routes: RuleEngineRoutesContext
    ): string {
        return routes.aiAgentRoutes.knowledge
    }
}
