import { GuidancesDataFixture } from '../../tests/GuidancesData.fixture'
import { CreateYourFirstGuidanceTask } from '../CreateYourFirstGuidance.task'
import { buildRuleEngineData, buildRuleEngineRoutes } from './utils'

describe('CreateYourFirstGuidance', () => {
    it('should display the task if no guidance exists', () => {
        const guidances = GuidancesDataFixture.start().withoutGuidance().build()

        const task = new CreateYourFirstGuidanceTask(
            buildRuleEngineData({
                guidances,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(true)
    })

    it('should not display guidance as we did not fullfill request', () => {
        const task = new CreateYourFirstGuidanceTask(
            buildRuleEngineData({
                guidances: undefined,
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.available).toBe(false)
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
        'should not display the task if any $type guidance exists',
        ({ guidances }) => {
            const task = new CreateYourFirstGuidanceTask(
                buildRuleEngineData({
                    guidances,
                }),
                buildRuleEngineRoutes(),
            )
            expect(task.display).toBe(false)
        },
    )
})
