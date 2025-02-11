import {ActionsDataFixture} from '../../tests/ActionsData.fixture'
import {SetYourActionsLiveTask} from '../SetYourActionsLive.task'
import {buildRuleEngineData, buildRuleEngineRoutes} from './utils'

describe('SetYourActionsLive', () => {
    it('should display the task if at least 1 draft action exists', () => {
        const actions = ActionsDataFixture.start().withDraftAction().build()

        const task = new SetYourActionsLiveTask(
            buildRuleEngineData({
                actions,
            }),
            buildRuleEngineRoutes()
        )
        expect(task.display).toBe(true)
    })

    it('should not display the task if no draft action exists', () => {
        const actions = ActionsDataFixture.start().withPublishedAction().build()

        const task = new SetYourActionsLiveTask(
            buildRuleEngineData({
                actions,
            }),
            buildRuleEngineRoutes()
        )
        expect(task.display).toBe(false)
    })
})
