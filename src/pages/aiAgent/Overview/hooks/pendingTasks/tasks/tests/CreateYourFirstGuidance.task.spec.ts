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

    it.each([
        {
            type: 'PUBLIC',
            guidances: GuidancesDataFixture.start()
                .withPublicGuidance()
                .build(),
        },
        {
            type: 'UNLISTED',
            guidances: GuidancesDataFixture.start()
                .withUnlistedGuidance()
                .build(),
        },
    ])(
        'should display the task if any $type guidance exists',
        ({guidances}) => {
            const task = new CreateYourFirstGuidanceTask(
                buildRuleEngineData({
                    guidances,
                }),
                buildRuleEngineRoutes()
            )
            expect(task.display).toBe(false)
        }
    )
})
