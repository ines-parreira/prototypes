import { TicketChannel } from 'business/types/ticket'
import { SelectYourChatTask } from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/SelectYourChat.task'
import { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'

import { AiAgentStoreConfigurationFixture } from '../../tests/AiAgentStoreConfiguration.fixture'
import { buildRuleEngineData, buildRuleEngineRoutes } from './utils'

describe('SelectYourChatTask', () => {
    it('should display the task if no chat is selected and there are available chats', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withConnectedChatIntegrations([])
                .build()
        const selfServiceChatChannels: SelfServiceChatChannel[] = [
            {
                type: TicketChannel.Chat,
                value: { id: 1 },
            } as any,
        ]

        const task = new SelectYourChatTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                selfServiceChatChannels,
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.display).toBe(true)
    })

    it('should not display the task if a chat is already selected', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withConnectedChatIntegrations([1])
                .build()

        const task = new SelectYourChatTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.display).toBe(false)
    })

    it('should not display the task if no chats are available', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withConnectedChatIntegrations([])
                .build()
        const selfServiceChatChannels: SelfServiceChatChannel[] = []

        const task = new SelectYourChatTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                selfServiceChatChannels,
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.display).toBe(false)
    })
})
