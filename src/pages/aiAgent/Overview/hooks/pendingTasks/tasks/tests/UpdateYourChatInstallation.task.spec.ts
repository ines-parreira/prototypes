import { ChatIntegrationsStatusDataFixture } from '../../tests/ChatIntegrationsStatusData.fixture'
import { PageInteractionsDataFixture } from '../../tests/PageInteractionsData.fixture'
import { UpdateYourChatInstallationTask } from '../UpdateYourChatInstallation.task'
import { buildRuleEngineData, buildRuleEngineRoutes } from './utils'

describe('UpdateYourChatInstallation', () => {
    it('should display the task if we have page interactions and a chat is installed', () => {
        const pageInteractions = PageInteractionsDataFixture.start()
            .withPageInteractions()
            .withConvertChatInstallSnippetEnabled()
            .build()

        const chatIntegrationsStatus = ChatIntegrationsStatusDataFixture.start()
            .withChatIntegrationStatus({ isInstalled: false })
            .withChatIntegrationStatus({ isInstalled: true })
            .build()

        const task = new UpdateYourChatInstallationTask(
            buildRuleEngineData({
                pageInteractions,
                chatIntegrationsStatus,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(true)
        expect(task.featureUrl).toBe(
            '/app/settings/channels/gorgias_chat/2/installation',
        )
    })

    it('should not display the task if no chat installed', () => {
        const pageInteractions = PageInteractionsDataFixture.start()
            .withPageInteractions()
            .withConvertChatInstallSnippetEnabled()
            .build()

        const chatIntegrationsStatus = ChatIntegrationsStatusDataFixture.start()
            .withChatIntegrationStatus()
            .build()

        const task = new UpdateYourChatInstallationTask(
            buildRuleEngineData({
                pageInteractions,
                chatIntegrationsStatus,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(false)
    })

    it('should not display the task if no page interactions', () => {
        const pageInteractions = PageInteractionsDataFixture.start()
            .withoutPageInteraction()
            .withConvertChatInstallSnippetEnabled()
            .build()

        const chatIntegrationsStatus = ChatIntegrationsStatusDataFixture.start()
            .withChatIntegrationStatus({ isInstalled: false })
            .withChatIntegrationStatus({ isInstalled: true })
            .build()

        const task = new UpdateYourChatInstallationTask(
            buildRuleEngineData({
                pageInteractions,
                chatIntegrationsStatus,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(false)
    })

    it('should not display the task if the feature flag is not enabled', () => {
        const pageInteractions = PageInteractionsDataFixture.start()
            .withPageInteractions()
            .withConvertChatInstallSnippetDisabled()
            .build()

        const chatIntegrationsStatus = ChatIntegrationsStatusDataFixture.start()
            .withChatIntegrationStatus({ isInstalled: false })
            .withChatIntegrationStatus({ isInstalled: true })
            .build()

        const task = new UpdateYourChatInstallationTask(
            buildRuleEngineData({
                pageInteractions,
                chatIntegrationsStatus,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(false)
    })
})
