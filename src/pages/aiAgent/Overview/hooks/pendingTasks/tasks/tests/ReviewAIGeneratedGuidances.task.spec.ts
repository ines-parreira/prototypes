import {GuidancesDataFixture} from '../../tests/GuidancesData.fixture'
import {ReviewAIGeneratedGuidancesTask} from '../ReviewAIGeneratedGuidances.task'
import {buildRuleEngineData, buildRuleEngineRoutes} from './utils'

describe('ReviewAIGeneratedGuidances', () => {
    it.each([
        {
            reason: '1 UNLISTED guidances',
            guidances: GuidancesDataFixture.start()
                .withUnlistedGuidance({aiGenerated: true})
                .build(),
        },
        {
            reason: '2 UNLISTED guidances',
            guidances: GuidancesDataFixture.start()
                .withUnlistedGuidance({aiGenerated: true})
                .build(),
        },
        {
            reason: 'mixed scenario',
            guidances: GuidancesDataFixture.start()
                .withUnlistedGuidance({aiGenerated: true})
                .withUnlistedGuidance()
                .withPublicGuidance()
                .withPublicGuidance({aiGenerated: true})
                .build(),
        },
    ])('should display the task if $reason is applied', ({guidances}) => {
        const task = new ReviewAIGeneratedGuidancesTask(
            buildRuleEngineData({
                guidances,
            }),
            buildRuleEngineRoutes()
        )
        expect(task.display).toBe(true)
    })

    it.each([
        {
            reason: 'no guidance exists',
            guidances: GuidancesDataFixture.start().withoutGuidance().build(),
        },
        {
            reason: '1 PUBLIC AI generated guidance exists',
            guidances: GuidancesDataFixture.start()
                .withPublicGuidance({aiGenerated: true})
                .build(),
        },
        {
            reason: 'multiple PUBLIC AI generated guidance exists',
            guidances: GuidancesDataFixture.start()
                .withPublicGuidance({aiGenerated: true})
                .withPublicGuidance({aiGenerated: true})
                .withPublicGuidance({aiGenerated: true})
                .build(),
        },
        {
            reason: '1 UNLISTED NOT AI generated guidance exists',
            guidances: GuidancesDataFixture.start()
                .withUnlistedGuidance()
                .build(),
        },
        {
            reason: 'multiple UNLISTED NOT AI generated guidance exists',
            guidances: GuidancesDataFixture.start()
                .withUnlistedGuidance()
                .withUnlistedGuidance()
                .withUnlistedGuidance()
                .build(),
        },
    ])('should not display the task if $reason', ({guidances}) => {
        const task = new ReviewAIGeneratedGuidancesTask(
            buildRuleEngineData({
                guidances,
            }),
            buildRuleEngineRoutes()
        )
        expect(task.display).toBe(false)
    })
})
