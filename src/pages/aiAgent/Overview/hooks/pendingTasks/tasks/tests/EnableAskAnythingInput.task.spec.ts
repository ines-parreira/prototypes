import { AiAgentScope } from 'models/aiAgent/types'

import { AiAgentStoreConfigurationFixture } from '../../tests/AiAgentStoreConfiguration.fixture'
import { EnableAskAnythingInputTask } from '../EnableAskAnythingInput.task'
import { buildRuleEngineData, buildRuleEngineRoutes } from './utils'

const baseEngineData = {
    storeKnowledgeStatus: {
        has_public_resources: true,
    },
    selfServiceChatChannels: [{ value: { id: 1 } }],
    chatIntegrationsStatus: [{ chatId: 1, installed: true }],
} as any

describe('EnableAskAnythingInputTask', () => {
    it('should display the task when floating input is not enabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutFloatingChatInputConfiguration([
                    AiAgentScope.Sales,
                    AiAgentScope.Support,
                ])
                .withConnectedChatIntegrations([1])
                .withConnectedHelpCenter(1)
                .withChatChannelEnabled()
                .build()

        const task = new EnableAskAnythingInputTask(
            buildRuleEngineData({
                ...baseEngineData,
                aiAgentStoreConfiguration,
                isConvertFloatingChatInputEnabled: true,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(true)
    })

    it('should not display the task when floating input is enabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutFloatingChatInputConfiguration([
                    AiAgentScope.Sales,
                    AiAgentScope.Support,
                ])
                .withConnectedChatIntegrations([1])
                .withConnectedHelpCenter(1)
                .withChatChannelEnabled()
                .build()

        const task = new EnableAskAnythingInputTask(
            buildRuleEngineData({
                ...baseEngineData,
                aiAgentStoreConfiguration,
                isConvertFloatingChatInputEnabled: false,
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.display).toBe(false)
    })

    it('should not display the task when sales scope is not enabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutFloatingChatInputConfiguration([AiAgentScope.Support])
                .withConnectedChatIntegrations([1])
                .withConnectedHelpCenter(1)
                .withChatChannelEnabled()
                .build()

        const task = new EnableAskAnythingInputTask(
            buildRuleEngineData({
                ...baseEngineData,
                aiAgentStoreConfiguration,
                isConvertFloatingChatInputEnabled: false,
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.display).toBe(false)
    })

    it('should not display the task when feature flag is not enabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutFloatingChatInputConfiguration([
                    AiAgentScope.Sales,
                    AiAgentScope.Support,
                ])
                .withConnectedChatIntegrations([1])
                .withConnectedHelpCenter(1)
                .withChatChannelEnabled()
                .build()

        const task = new EnableAskAnythingInputTask(
            buildRuleEngineData({
                ...baseEngineData,
                aiAgentStoreConfiguration,
                isConvertFloatingChatInputEnabled: false,
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.display).toBe(false)
    })

    it('should not display the task when chat is not enabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutFloatingChatInputConfiguration([
                    AiAgentScope.Sales,
                    AiAgentScope.Support,
                ])
                .withoutConnectedChatIntegrations()
                .withConnectedHelpCenter(1)
                .withChatChannelEnabled()
                .build()

        const task = new EnableAskAnythingInputTask(
            buildRuleEngineData({
                ...baseEngineData,
                aiAgentStoreConfiguration,
                isConvertFloatingChatInputEnabled: false,
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.display).toBe(false)
    })
})
