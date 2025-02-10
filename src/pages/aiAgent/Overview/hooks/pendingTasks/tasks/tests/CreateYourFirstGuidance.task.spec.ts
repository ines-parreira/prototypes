import {GuidancesDataFixture} from '../../tests/GuidancesData.fixture'
import {CreateYourFirstGuidanceTask} from '../CreateYourFirstGuidance.task'
import {buildRuleEngineData, buildRuleEngineRoutes} from './utils'

describe('CreateYourFirstGuidance', () => {
    it('should display the task if no guidance exists', () => {
        const guidances = GuidancesDataFixture.start().withoutGuidance().build()

        const task = new CreateYourFirstGuidanceTask(
            buildRuleEngineData({
                guidances,
            }),
            buildRuleEngineRoutes()
        )
        expect(task.display).toBe(true)
    })

    it('should display the task if any guidance exists', () => {
        const guidances = GuidancesDataFixture.start().withGuidance().build()

        const task = new CreateYourFirstGuidanceTask(
            buildRuleEngineData({
                guidances,
            }),
            buildRuleEngineRoutes()
        )
        expect(task.display).toBe(false)
    })
})
