import { SetUpYourEmailTask } from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/SetUpYourEmail.task'

import { AiAgentStoreConfigurationFixture } from '../../tests/AiAgentStoreConfiguration.fixture'
import { EmailIntegrationsDataFixture } from '../../tests/EmailIntegrationsData.fixture'
import { buildRuleEngineData, buildRuleEngineRoutes } from './utils'

describe('SetUpYourEmailTask', () => {
    it('should display the task if no email integrations are selected', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutConnectedEmailIntegrations()
                .build()

        const task = new SetUpYourEmailTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.display).toBe(true)
    })

    it('should not display the task if email integrations are selected', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withConnectedEmailIntegrations({
                    id: 1,
                    email: 'test@test.com',
                })
                .build()

        const task = new SetUpYourEmailTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.display).toBe(false)
    })

    it('should not display the task for standalone merchants', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutConnectedEmailIntegrations()
                .build()

        const task = new SetUpYourEmailTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                isStandaloneMerchant: true,
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.display).toBe(false)
    })

    it('should redirect to ai agent channel settings if there are available integrations', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutConnectedEmailIntegrations()
                .build()

        const emailIntegrations = EmailIntegrationsDataFixture.start()
            .withEmailIntegration({
                isVerified: true,
            })
            .build()

        const task = new SetUpYourEmailTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                emailIntegrations,
                alreadyUsedEmailIntegrationsIds: [],
            }),
            {
                aiAgentRoutes: {
                    settingsChannels: '/app/ai-agent/settings/channels',
                },
            } as any,
        )

        expect(task.featureUrl).toBe('/app/ai-agent/settings/channels')
    })

    it('should redirect to email settings if there are no available integrations', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutConnectedEmailIntegrations()
                .build()

        const emailIntegrations = EmailIntegrationsDataFixture.start()
            .withEmailIntegration({
                isVerified: true,
            })
            .build()

        const task = new SetUpYourEmailTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                emailIntegrations,
                alreadyUsedEmailIntegrationsIds: [1],
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.featureUrl).toBe(
            '/app/settings/channels/email/new/onboarding',
        )
    })

    it('should redirect to email settings if there are no email integrations', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutConnectedEmailIntegrations()
                .build()

        const emailIntegrations = EmailIntegrationsDataFixture.start()
            .withoutEmailIntegrations()
            .build()

        const task = new SetUpYourEmailTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                emailIntegrations,
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.featureUrl).toBe(
            '/app/settings/channels/email/new/onboarding',
        )
    })

    it('should redirect to email settings if email integration are undefined', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutConnectedEmailIntegrations()
                .build()

        const task = new SetUpYourEmailTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                emailIntegrations: undefined,
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.featureUrl).toBe(
            '/app/settings/channels/email/new/onboarding',
        )
    })

    it('should redirect to ai agent settings when email integrations are available and used email integrations are undefined', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutConnectedEmailIntegrations()
                .build()

        const emailIntegrations = EmailIntegrationsDataFixture.start()
            .withEmailIntegration({
                isVerified: true,
            })
            .build()

        const task = new SetUpYourEmailTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                emailIntegrations,
                alreadyUsedEmailIntegrationsIds: undefined,
            }),
            {
                aiAgentRoutes: {
                    settingsChannels: '/app/ai-agent/settings/channels',
                },
            } as any,
        )

        expect(task.featureUrl).toBe('/app/ai-agent/settings/channels')
    })
})
