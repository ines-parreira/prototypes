import {AiAgentStoreConfigurationFixture} from '../../tests/AiAgentStoreConfiguration.fixture'
import {EmailIntegrationsDataFixture} from '../../tests/EmailIntegrationsData.fixture'
import {VerifyYourEmailDomainTask} from '../VerifyYourEmailDomain.task'
import {buildRuleEngineData, buildRuleEngineRoutes} from './utils'

describe('VerifyYourEmailDomain', () => {
    it('should display the task if email channel is enabled, and a not verified email integration is set in store configuration', () => {
        const emailIntegrations = EmailIntegrationsDataFixture.start()
            .withEmailIntegration({
                isVerified: false,
            })
            .build()

        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutConnectedHelpCenter()
                .withConnectedEmailIntegrations({
                    email: emailIntegrations[0].address,
                    id: emailIntegrations[0].id,
                })
                .withEmailChannelEnabled()
                .build()

        const task = new VerifyYourEmailDomainTask(
            buildRuleEngineData({
                emailIntegrations,
                aiAgentStoreConfiguration,
            }),
            buildRuleEngineRoutes()
        )
        expect(task.display).toBe(true)
    })

    it('should not display the task if the email channel is not enabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutConnectedHelpCenter()
                .build()

        const task = new VerifyYourEmailDomainTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
            }),
            buildRuleEngineRoutes()
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

        const task = new VerifyYourEmailDomainTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                emailIntegrations,
            }),
            buildRuleEngineRoutes()
        )
        expect(task.display).toBe(false)
    })

    it('should not display the task if the email channel is enabled, and a verified email integration exists', () => {
        const emailIntegrations = EmailIntegrationsDataFixture.start()
            .withEmailIntegration({
                isVerified: true,
            })
            .build()

        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withConnectedEmailIntegrations({
                    email: emailIntegrations[0].address,
                    id: emailIntegrations[0].id,
                })
                .build()

        const task = new VerifyYourEmailDomainTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                emailIntegrations,
            }),
            buildRuleEngineRoutes()
        )
        expect(task.display).toBe(false)
    })

    it('should not display the task if the email channel is enabled, and a not verified email integration exists, but not set in store configuration', () => {
        const emailIntegrations = EmailIntegrationsDataFixture.start()
            .withEmailIntegration({
                isVerified: false,
            })
            .withEmailIntegration({
                isVerified: true,
            })
            .build()

        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withConnectedEmailIntegrations({
                    email: emailIntegrations[1].address,
                    id: emailIntegrations[1].id,
                })
                .build()

        const task = new VerifyYourEmailDomainTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                emailIntegrations,
            }),
            buildRuleEngineRoutes()
        )
        expect(task.display).toBe(false)
    })
})
