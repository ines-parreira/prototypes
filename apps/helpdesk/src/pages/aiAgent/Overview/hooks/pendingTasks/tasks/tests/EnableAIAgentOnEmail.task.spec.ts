import { AiAgentStoreConfigurationFixture } from '../../tests/AiAgentStoreConfiguration.fixture'
import { EnableAIAgentOnEmailTask } from '../EnableAIAgentOnEmail.task'
import { buildRuleEngineData, buildRuleEngineRoutes } from './utils'

describe('EnableAIAgentOnEmail', () => {
    it('should display the task if ai agent store configuration email disabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withConnectedEmailIntegrations({
                    email: 'test@test.com',
                    id: 1,
                })
                .build()

        const task = new EnableAIAgentOnEmailTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(true)
    })

    it('should not display the task if ai agent store configuration email enabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withConnectedEmailIntegrations({
                    email: 'test@test.com',
                    id: 1,
                })
                .withEmailChannelEnabled()
                .build()

        const task = new EnableAIAgentOnEmailTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(false)
    })

    it('should not display the task if no emails are selected', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withConnectedEmailIntegrations()
                .build()

        const task = new EnableAIAgentOnEmailTask(
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
                .withConnectedEmailIntegrations({
                    email: 'test@test.com',
                    id: 1,
                })
                .build()

        const task = new EnableAIAgentOnEmailTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                isStandaloneMerchant: true,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(false)
    })

    describe('feature URL generation', () => {
        const storeName = 'test-store'
        const routes = buildRuleEngineRoutes()

        beforeEach(() => {
            routes.aiAgentRoutes = {
                deployEmail:
                    '/app/ai-agent/shopify/bakehouse-store/deploy/email',
            } as any
        })

        it('should always generate deploy/email URL', () => {
            const aiAgentStoreConfiguration =
                AiAgentStoreConfigurationFixture.start()
                    .withConnectedEmailIntegrations({
                        email: 'test@test.com',
                        id: 1,
                    })
                    .build()

            const task = new EnableAIAgentOnEmailTask(
                buildRuleEngineData({
                    aiAgentStoreConfiguration: {
                        ...aiAgentStoreConfiguration,
                        storeName,
                    },
                    isActivationEnabled: true,
                }),
                routes,
            )

            expect(task.featureUrl).toBe(
                '/app/ai-agent/shopify/bakehouse-store/deploy/email',
            )
        })

        it('should generate deploy/email URL regardless of activation state', () => {
            const aiAgentStoreConfiguration =
                AiAgentStoreConfigurationFixture.start()
                    .withConnectedEmailIntegrations({
                        email: 'test@test.com',
                        id: 1,
                    })
                    .build()

            const task = new EnableAIAgentOnEmailTask(
                buildRuleEngineData({
                    aiAgentStoreConfiguration: {
                        ...aiAgentStoreConfiguration,
                        storeName,
                    },
                    isActivationEnabled: false,
                }),
                routes,
            )

            expect(task.featureUrl).toBe(
                '/app/ai-agent/shopify/bakehouse-store/deploy/email',
            )
        })
    })
})
