import { AiAgentStoreConfigurationFixture } from '../../tests/AiAgentStoreConfiguration.fixture'
import { EmailIntegrationsDataFixture } from '../../tests/EmailIntegrationsData.fixture'
import { ConnectYourDefaultEmailTask } from '../ConnectYourDefaultEmail.task'
import { buildRuleEngineData, buildRuleEngineRoutes } from './utils'

describe('ConnectYourDefaultEmail', () => {
    it('should not display the task if email channel is enabled, and a default email integration is set in store configuration', () => {
        const emailIntegrations = EmailIntegrationsDataFixture.start()
            .withEmailIntegration({
                isDefault: true,
            })
            .withEmailIntegration({
                isDefault: false,
            })
            .withEmailIntegration({
                isDefault: false,
            })
            .build()

        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutConnectedHelpCenter()
                .withConnectedEmailIntegrations(
                    {
                        email: emailIntegrations[0].address,
                        id: emailIntegrations[0].id,
                    },
                    {
                        email: emailIntegrations[1].address,
                        id: emailIntegrations[1].id,
                    },
                )
                .withEmailChannelEnabled()
                .build()

        const task = new ConnectYourDefaultEmailTask(
            buildRuleEngineData({
                emailIntegrations,
                aiAgentStoreConfiguration,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(false)
    })

    it('should not display the task if the email channel is not enabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutConnectedHelpCenter()
                .build()

        const task = new ConnectYourDefaultEmailTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(false)
    })

    it('should not display the task if the email channel is enabled but no email integrations exists', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutConnectedEmailIntegrations()
                .build()

        const emailIntegrations = EmailIntegrationsDataFixture.start()
            .withoutEmailIntegrations()
            .build()

        const task = new ConnectYourDefaultEmailTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                emailIntegrations,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(false)
    })

    it('should not display the task if the email channel is enabled, an email integration exists but not default', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutConnectedEmailIntegrations()
                .build()

        const emailIntegrations = EmailIntegrationsDataFixture.start()
            .withEmailIntegration({
                isDefault: false,
            })
            .build()

        const task = new ConnectYourDefaultEmailTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                emailIntegrations,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(false)
    })

    it('should not display the task if the email channel is enabled, an email integration exists as default, but not set in store configuration', () => {
        const emailIntegrations = EmailIntegrationsDataFixture.start()
            .withEmailIntegration({
                isDefault: true,
            })
            .withEmailIntegration({
                isDefault: false,
            })
            .build()

        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withConnectedEmailIntegrations({
                    email: emailIntegrations[1].address,
                    id: emailIntegrations[1].id,
                })
                .build()

        const task = new ConnectYourDefaultEmailTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                emailIntegrations,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(false)
    })

    it('should not display the task if the request failed', () => {
        const emailIntegrations = EmailIntegrationsDataFixture.start()
            .withEmailIntegration({
                isDefault: true,
            })
            .build()

        const task = new ConnectYourDefaultEmailTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration:
                    AiAgentStoreConfigurationFixture.start()
                        .withConnectedEmailIntegrations({
                            email: emailIntegrations[0].address,
                            id: emailIntegrations[0].id,
                        })
                        .build(),
                emailIntegrations: undefined,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.available).toBe(false)
    })

    it('should not display the task for standalone merchants', () => {
        const emailIntegrations = EmailIntegrationsDataFixture.start()
            .withEmailIntegration({
                isDefault: true,
            })
            .build()

        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutConnectedEmailIntegrations()
                .withEmailChannelEnabled()
                .build()

        const task = new ConnectYourDefaultEmailTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                emailIntegrations,
                isStandaloneMerchant: true,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(false)
    })
})
