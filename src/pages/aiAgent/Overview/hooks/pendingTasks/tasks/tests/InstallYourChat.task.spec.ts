import { ChatIntegrationsStatusDataFixture } from '../../tests/ChatIntegrationsStatusData.fixture'
import { InstallYourChatTask } from '../InstallYourChat.task'
import { buildRuleEngineData, buildRuleEngineRoutes } from './utils'

describe('InstallYourChat', () => {
    it('should display the task if 1 chat is not installed', () => {
        const chatIntegrationsStatus = ChatIntegrationsStatusDataFixture.start()
            .withChatIntegrationStatus({ isInstalled: false })
            .withChatIntegrationStatus({ isInstalled: true })
            .build()

        const task = new InstallYourChatTask(
            buildRuleEngineData({
                chatIntegrationsStatus,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(true)
    })

    it('should not display the task if no chat exists', () => {
        const chatIntegrationsStatus = ChatIntegrationsStatusDataFixture.start()
            .withoutChatIntegrationStatus()
            .build()

        const task = new InstallYourChatTask(
            buildRuleEngineData({
                chatIntegrationsStatus,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(false)
    })

    it('should not display the task if every chat are installed', () => {
        const chatIntegrationsStatus = ChatIntegrationsStatusDataFixture.start()
            .withChatIntegrationStatus({ isInstalled: true })
            .withChatIntegrationStatus({ isInstalled: true })
            .build()

        const task = new InstallYourChatTask(
            buildRuleEngineData({
                chatIntegrationsStatus,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(false)
    })
})
