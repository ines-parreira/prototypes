import {RuleEngineData, RuleEngineRoutes} from '../ruleEngine'
import {Task} from './Task'

export class UploadAnExternalDocTask extends Task {
    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Upload an external doc',
            'Help AI Agent give accurate answers by accessing your documents.',
            'RECOMMENDED',
            data,
            routes
        )
    }

    // Email channel should be deactivated in ai agent store configuration
    protected shouldBeDisplayed(data: RuleEngineData): boolean {
        return data.fileIngestion.length === 0
    }

    protected getFeatureUrl(
        _data: RuleEngineData,
        routes: RuleEngineRoutes
    ): string {
        return routes.aiAgentRoutes.knowledge
    }
}
