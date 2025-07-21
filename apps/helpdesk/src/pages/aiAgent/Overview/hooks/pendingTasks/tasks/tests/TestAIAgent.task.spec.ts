import { AiAgentPlaygroundExecutionsDataFixture } from '../../tests/AiAgentPlaygroundExecutionsData.fixture'
import { TestAIAgentTask } from '../TestAIAgent.task'
import { buildRuleEngineData, buildRuleEngineRoutes } from './utils'

describe('TestAIAgent', () => {
    it('should display the task if no playground executions', () => {
        const aiAgentPlaygroundExecutions =
            AiAgentPlaygroundExecutionsDataFixture.start()
                .withoutExecution()
                .build()

        const task = new TestAIAgentTask(
            buildRuleEngineData({
                aiAgentPlaygroundExecutions,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(true)
    })

    it('should not display the task if any playground executions', () => {
        const aiAgentPlaygroundExecutions =
            AiAgentPlaygroundExecutionsDataFixture.start()
                .withExecutionsCount(1)
                .build()

        const task = new TestAIAgentTask(
            buildRuleEngineData({
                aiAgentPlaygroundExecutions,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(false)
    })

    it('should not display if request failed', () => {
        const task = new TestAIAgentTask(
            buildRuleEngineData({
                aiAgentPlaygroundExecutions: undefined,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.available).toBe(false)
    })
})
