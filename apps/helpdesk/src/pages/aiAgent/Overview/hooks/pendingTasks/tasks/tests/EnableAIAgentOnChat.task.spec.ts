import { AiAgentStoreConfigurationFixture } from '../../tests/AiAgentStoreConfiguration.fixture'
import { ChatIntegrationsStatusDataFixture } from '../../tests/ChatIntegrationsStatusData.fixture'
import { EnableAIAgentOnChatTask } from '../EnableAIAgentOnChat.task'
import { buildRuleEngineData, buildRuleEngineRoutes } from './utils'

describe('EnableAIAgentOnChat', () => {
    it('should display the task if ai agent store configuration chat disabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withConnectedChatIntegrations([1])
                .build()
        const chatIntegrationsStatus = ChatIntegrationsStatusDataFixture.start()
            .withChatIntegrationStatus({ isInstalled: true })
            .build()

        const task = new EnableAIAgentOnChatTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                chatIntegrationsStatus,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(true)
    })

    it('should not display the task if ai agent store configuration chat enabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withConnectedChatIntegrations([1])
                .withChatChannelEnabled()
                .build()
        const chatIntegrationsStatus = ChatIntegrationsStatusDataFixture.start()
            .withChatIntegrationStatus({ isInstalled: true })
            .build()

        const task = new EnableAIAgentOnChatTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                chatIntegrationsStatus,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(false)
    })

    it('should not display the task if no chat is selected', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withConnectedChatIntegrations([])
                .build()
        const chatIntegrationsStatus = ChatIntegrationsStatusDataFixture.start()
            .withChatIntegrationStatus({ isInstalled: true })
            .build()

        const task = new EnableAIAgentOnChatTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                chatIntegrationsStatus,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(false)
    })

    it('should not display the task if a selected chat is not installed', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withConnectedChatIntegrations([1, 2])
                .build()
        const chatIntegrationsStatus = ChatIntegrationsStatusDataFixture.start()
            .withChatIntegrationStatus({ isInstalled: true })
            .withChatIntegrationStatus({ isInstalled: false })
            .build()

        const task = new EnableAIAgentOnChatTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                chatIntegrationsStatus,
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
                deployChat: '/app/ai-agent/shopify/bakehouse-store/deploy/chat',
            } as any
        })

        it('should always generate deploy/chat URL', () => {
            const aiAgentStoreConfiguration =
                AiAgentStoreConfigurationFixture.start()
                    .withConnectedChatIntegrations([1])
                    .build()
            const chatIntegrationsStatus =
                ChatIntegrationsStatusDataFixture.start()
                    .withChatIntegrationStatus({ isInstalled: true })
                    .build()

            const task = new EnableAIAgentOnChatTask(
                buildRuleEngineData({
                    aiAgentStoreConfiguration: {
                        ...aiAgentStoreConfiguration,
                        storeName,
                    },
                    chatIntegrationsStatus,
                    isActivationEnabled: true,
                }),
                routes,
            )

            expect(task.featureUrl).toBe(
                '/app/ai-agent/shopify/bakehouse-store/deploy/chat',
            )
        })

        it('should generate deploy/chat URL regardless of activation state', () => {
            const aiAgentStoreConfiguration =
                AiAgentStoreConfigurationFixture.start()
                    .withConnectedChatIntegrations([1])
                    .build()
            const chatIntegrationsStatus =
                ChatIntegrationsStatusDataFixture.start()
                    .withChatIntegrationStatus({ isInstalled: true })
                    .build()

            const task = new EnableAIAgentOnChatTask(
                buildRuleEngineData({
                    aiAgentStoreConfiguration: {
                        ...aiAgentStoreConfiguration,
                        storeName,
                    },
                    chatIntegrationsStatus,
                    isActivationEnabled: false,
                }),
                routes,
            )

            expect(task.featureUrl).toBe(
                '/app/ai-agent/shopify/bakehouse-store/deploy/chat',
            )
        })
    })
})
