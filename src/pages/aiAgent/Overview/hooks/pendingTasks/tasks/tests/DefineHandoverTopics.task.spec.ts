import {AiAgentStoreConfigurationFixture} from '../../tests/AiAgentStoreConfiguration.fixture'
import {DefineHandoverTopicsTask} from '../DefineHandoverTopics.task'
import {buildRuleEngineData, buildRuleEngineRoutes} from './utils'

describe('DefineHandoverTopics', () => {
    it('should display the task if ai agent store configuration does not have excludedTopics', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutConnectedHelpCenter()
                .withoutHandoverTopic()
                .build()

        const task = new DefineHandoverTopicsTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
            }),
            buildRuleEngineRoutes()
        )
        expect(task.display).toBe(true)
    })

    it('should not display the task if ai agent store configuration has any excludedTopics', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutConnectedHelpCenter()
                .withHandoverTopics('any topic')
                .build()

        const task = new DefineHandoverTopicsTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
            }),
            buildRuleEngineRoutes()
        )
        expect(task.display).toBe(false)
    })
})
