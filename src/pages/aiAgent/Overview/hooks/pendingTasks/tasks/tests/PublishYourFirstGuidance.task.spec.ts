import {GuidancesDataFixture} from '../../tests/GuidancesData.fixture'
import {PublishYourFirstGuidanceTask} from '../PublishYourFirstGuidance.task'
import {buildRuleEngineData, buildRuleEngineRoutes} from './utils'

describe('PublishYourFirstGuidance', () => {
    it('should display the task only if draft guidances exists', () => {
        const guidances = GuidancesDataFixture.start()
            .withUnlistedGuidance()
            .build()

        const task = new PublishYourFirstGuidanceTask(
            buildRuleEngineData({
                guidances,
            }),
            buildRuleEngineRoutes()
        )
        expect(task.display).toBe(true)
    })

    it.each([
        {
            type: 'no',
            guidances: GuidancesDataFixture.start().withoutGuidance().build(),
        },
        {
            type: '1 public',
            guidances: GuidancesDataFixture.start()
                .withPublicGuidance()
                .build(),
        },
        {
            type: 'multiple public',
            guidances: GuidancesDataFixture.start()
                .withPublicGuidance()
                .withPublicGuidance()
                .build(),
        },
        {
            type: '1 public and 1 unlisted',
            guidances: GuidancesDataFixture.start()
                .withPublicGuidance()
                .withUnlistedGuidance()
                .build(),
        },
        {
            type: 'multiple public and multiple unlisted',
            guidances: GuidancesDataFixture.start()
                .withPublicGuidance()
                .withUnlistedGuidance()
                .withPublicGuidance()
                .withUnlistedGuidance()
                .build(),
        },
    ])('should not display the task if $type guidances', ({guidances}) => {
        const task = new PublishYourFirstGuidanceTask(
            buildRuleEngineData({
                guidances,
            }),
            buildRuleEngineRoutes()
        )
        expect(task.display).toBe(false)
    })
})
