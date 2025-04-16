import { AiAgentStoreConfigurationFixture } from '../../tests/AiAgentStoreConfiguration.fixture'
import { UpdateYourDiscountStrategyTask } from '../UpdateYourDiscountStrategy.task'
import { buildRuleEngineData, buildRuleEngineRoutes } from './utils'

describe('UpdateYourDiscountStrategy', () => {
    it('should display the task if the discount strategy is not set to none', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withDiscountLevelStrategy()
                .build()

        const task = new UpdateYourDiscountStrategyTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(false)
    })

    it('should not display the task if the discount strategy is set to none', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutDiscountLevelStrategy()
                .build()

        const task = new UpdateYourDiscountStrategyTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(true)
    })
})
