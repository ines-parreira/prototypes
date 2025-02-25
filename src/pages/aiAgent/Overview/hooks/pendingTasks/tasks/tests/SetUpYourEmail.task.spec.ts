import { SetUpYourEmailTask } from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/SetUpYourEmail.task'

import { EmailIntegrationsDataFixture } from '../../tests/EmailIntegrationsData.fixture'
import { buildRuleEngineData, buildRuleEngineRoutes } from './utils'

describe('SetUpYourEmailTask', () => {
    it('should display the task if only email integration is default', () => {
        const emailIntegrations = EmailIntegrationsDataFixture.start()
            .withEmailIntegration({
                isDefault: true,
            })
            .build()

        const task = new SetUpYourEmailTask(
            buildRuleEngineData({
                emailIntegrations,
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.display).toBe(true)
    })

    it('should not display the task if email integration is not default', () => {
        const emailIntegrations = EmailIntegrationsDataFixture.start()
            .withEmailIntegration({
                isDefault: false,
            })
            .build()

        const task = new SetUpYourEmailTask(
            buildRuleEngineData({
                emailIntegrations,
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.display).toBe(false)
    })
})
