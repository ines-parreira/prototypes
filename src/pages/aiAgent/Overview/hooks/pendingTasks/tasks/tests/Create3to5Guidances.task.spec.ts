import { GuidancesDataFixture } from '../../tests/GuidancesData.fixture'
import { Create3to5GuidancesTask } from '../Create3to5Guidances.task'
import { buildRuleEngineData, buildRuleEngineRoutes } from './utils'

describe.each([
    {
        type: 'PUBLIC',
        display: true,
        guidances: GuidancesDataFixture.start().withPublicGuidance().build(),
    },
    {
        type: 'UNLISTED',
        display: true,
        guidances: GuidancesDataFixture.start().withUnlistedGuidance().build(),
    },
    {
        type: 'PUBLIC and UNLISTED',
        display: true,
        guidances: GuidancesDataFixture.start()
            .withPublicGuidance()
            .withUnlistedGuidance()
            .build(),
    },
    {
        type: 'PUBLIC',
        display: true,
        guidances: GuidancesDataFixture.start()
            .withPublicGuidance()
            .withPublicGuidance()
            .build(),
    },
    {
        type: 'UNLISTED',
        display: true,
        guidances: GuidancesDataFixture.start()
            .withUnlistedGuidance()
            .withUnlistedGuidance()
            .build(),
    },
    {
        display: false,
        guidances: GuidancesDataFixture.start().withoutGuidance().build(),
    },
    {
        type: 'PUBLIC',
        display: false,
        guidances: GuidancesDataFixture.start()
            .withPublicGuidance()
            .withPublicGuidance()
            .withPublicGuidance()
            .build(),
    },
    {
        type: 'UNLISTED',
        display: false,
        guidances: GuidancesDataFixture.start()
            .withUnlistedGuidance()
            .withUnlistedGuidance()
            .withUnlistedGuidance()
            .build(),
    },
    {
        type: 'PUBLIC and UNLISTED',
        display: false,
        guidances: GuidancesDataFixture.start()
            .withPublicGuidance()
            .withPublicGuidance()
            .withUnlistedGuidance()
            .withUnlistedGuidance()
            .build(),
    },
])('Create3to5Guidances', ({ guidances, display, type }) => {
    it(`should ${display ? '' : 'not '}display the task if ${guidances.length} guidances ${type ? `of type ${type} ` : ''}exists`, () => {
        const task = new Create3to5GuidancesTask(
            buildRuleEngineData({
                guidances,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(display)
    })
})
