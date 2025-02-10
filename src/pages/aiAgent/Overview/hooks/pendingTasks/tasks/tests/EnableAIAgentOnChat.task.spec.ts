import {AiAgentStoreConfigurationFixture} from '../../tests/AiAgentStoreConfiguration.fixture'
import {EnableAIAgentOnChatTask} from '../EnableAIAgentOnChat.task'

describe('EnableAIAgentOnChat', () => {
    it('should display the task if ai agent store configuration chat disabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutConnectedHelpCenter()
                .build()

        const task = new EnableAIAgentOnChatTask(
            {
                faqHelpCenters: [],
                aiAgentStoreConfiguration,
                fileIngestion: [],
            },
            {
                aiAgentRoutes: {} as any,
            }
        )
        expect(task.display).toBe(true)
    })

    it('should not display the task if ai agent store configuration chat enabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutConnectedHelpCenter()
                .withChatChannelEnabled()
                .build()

        const task = new EnableAIAgentOnChatTask(
            {
                faqHelpCenters: [],
                aiAgentStoreConfiguration,
                fileIngestion: [],
            },
            {
                aiAgentRoutes: {} as any,
            }
        )
        expect(task.display).toBe(false)
    })
})
