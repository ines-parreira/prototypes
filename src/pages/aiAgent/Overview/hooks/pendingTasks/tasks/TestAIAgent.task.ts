import {RuleEngineData, RuleEngineRoutes} from '../ruleEngine'
import {Task} from './Task'

export class TestAIAgentTask extends Task {
    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Test AI Agent',
            'See how AI Agent would responds based on your set-up',
            'RECOMMENDED',
            data,
            routes
        )
    }

    // No playground executions
    protected shouldBeDisplayed(data: RuleEngineData): boolean {
        return data.aiAgentPlaygroundExecutions.count === 0
    }

    protected getFeatureUrl({
        routes: {aiAgentRoutes},
    }: {
        data: RuleEngineData
        routes: RuleEngineRoutes
    }): string {
        return aiAgentRoutes.test
    }
}
