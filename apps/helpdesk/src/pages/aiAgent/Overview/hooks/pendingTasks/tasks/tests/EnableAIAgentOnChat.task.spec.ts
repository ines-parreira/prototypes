import { FocusActivationModal } from 'pages/aiAgent/Activation/utils'

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
                overview: '/ai-agent/overview',
                settingsChannels: '/ai-agent/settings/channels',
            } as any
        })

        it('should generate URL with activation modal when activation is enabled', () => {
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

            const expectedUrl = `/ai-agent/overview?${FocusActivationModal.buildSearchParam(storeName)}`
            expect(task.featureUrl).toBe(expectedUrl)
        })

        it('should generate settings channels URL when activation is disabled', () => {
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

            expect(task.featureUrl).toBe('/ai-agent/settings/channels')
        })
    })
})
