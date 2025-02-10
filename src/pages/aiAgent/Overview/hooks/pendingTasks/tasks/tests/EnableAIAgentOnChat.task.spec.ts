import {AiAgentStoreConfigurationFixture} from '../../tests/AiAgentStoreConfiguration.fixture'
import {EnableAIAgentOnChatTask} from '../EnableAIAgentOnChat.task'
import {buildRuleEngineData, buildRuleEngineRoutes} from './utils'

describe('EnableAIAgentOnChat', () => {
    it('should display the task if ai agent store configuration chat disabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutConnectedHelpCenter()
                .build()

        const task = new EnableAIAgentOnChatTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
            }),
            buildRuleEngineRoutes()
        )
        expect(task.display).toBe(true)
    })

    it('should not display the task if ai agent store configuration chat enabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutConnectedHelpCenter()
                .withChatChannelEnabled()
                .build()

        const task = new EnableAIAgentOnChatTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
            }),
            buildRuleEngineRoutes()
        )
        expect(task.display).toBe(false)
    })
})
