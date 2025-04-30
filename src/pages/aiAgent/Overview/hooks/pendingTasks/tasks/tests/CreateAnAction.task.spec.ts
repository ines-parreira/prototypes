import { ActionsDataFixture } from '../../tests/ActionsData.fixture'
import { CreateAnActionTask } from '../CreateAnAction.task'
import { buildRuleEngineData, buildRuleEngineRoutes } from './utils'

describe('CreateAnAction', () => {
    it('should display the task if no action exists', () => {
        const actions = ActionsDataFixture.start().withoutAction().build()

        const task = new CreateAnActionTask(
            buildRuleEngineData({
                actions,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(true)
    })

    it.each([
        {
            type: 'PUBLISHED',
            actions: ActionsDataFixture.start().withPublishedAction().build(),
        },
        {
            type: 'DRAFT',
            actions: ActionsDataFixture.start().withDraftAction().build(),
        },
    ])(
        'should not display the task if any $type action exists',
        ({ actions }) => {
            const task = new CreateAnActionTask(
                buildRuleEngineData({
                    actions,
                }),
                buildRuleEngineRoutes(),
            )
            expect(task.display).toBe(false)
        },
    )

    it('should display if there is no action defined', () => {
        const task = new CreateAnActionTask(
            buildRuleEngineData({
                actions: ActionsDataFixture.start().withoutAction().build(),
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.available).toBe(true)
        expect(task.display).toBe(true)
    })

    it('should not display if request failed', () => {
        const task = new CreateAnActionTask(
            buildRuleEngineData({
                actions: undefined,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.available).toBe(false)
    })
})
