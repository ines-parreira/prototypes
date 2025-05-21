import { AiAgentScope } from 'models/aiAgent/types'

import { AiAgentStoreConfigurationFixture } from '../../tests/AiAgentStoreConfiguration.fixture'
import { EnableAskAnythingInputTask } from '../EnableAskAnythingInput.task'
import { buildRuleEngineData, buildRuleEngineRoutes } from './utils'

describe('EnableAskAnythingInputTask', () => {
    it('should display the task when floating input is not enabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutFloatingChatInputConfiguration([AiAgentScope.Sales])
                .build()

        const task = new EnableAskAnythingInputTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                isConvertFloatingChatInputEnabled: true,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(true)
    })

    it('should not display the task when floating input is enabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withFloatingChatInputConfiguration([AiAgentScope.Sales])
                .build()

        const task = new EnableAskAnythingInputTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                isConvertFloatingChatInputEnabled: false,
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.display).toBe(false)
    })

    it('should not display the task when sales scope is not enabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutFloatingChatInputConfiguration([])
                .build()

        const task = new EnableAskAnythingInputTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                isConvertFloatingChatInputEnabled: false,
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.display).toBe(false)
    })
})
