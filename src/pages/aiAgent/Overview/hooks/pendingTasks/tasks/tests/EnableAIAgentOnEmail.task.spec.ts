import { AiAgentStoreConfigurationFixture } from '../../tests/AiAgentStoreConfiguration.fixture'
import { EnableAIAgentOnEmailTask } from '../EnableAIAgentOnEmail.task'
import { buildRuleEngineData, buildRuleEngineRoutes } from './utils'

describe('EnableAIAgentOnEmail', () => {
    it('should display the task if ai agent store configuration email disabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutConnectedHelpCenter()
                .build()

        const task = new EnableAIAgentOnEmailTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(true)
    })

    it('should not display the task if ai agent store configuration email enabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutConnectedHelpCenter()
                .withEmailChannelEnabled()
                .build()

        const task = new EnableAIAgentOnEmailTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(false)
    })
})
