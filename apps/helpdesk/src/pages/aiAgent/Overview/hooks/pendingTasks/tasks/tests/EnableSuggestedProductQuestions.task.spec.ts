import { AiAgentScope } from 'models/aiAgent/types'

import { AiAgentStoreConfigurationFixture } from '../../tests/AiAgentStoreConfiguration.fixture'
import { EnableSuggestedProductQuestionsTask } from '../EnableSuggestedProductQuestions.task'
import { buildRuleEngineData, buildRuleEngineRoutes } from './utils'

describe('EnableSuggestedProductQuestionsTask', () => {
    it('should display the task when suggested product questions is not enabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutSuggestedProductQuestions()
                .withConnectedChatIntegrations([1])
                .withScopes([AiAgentScope.Support, AiAgentScope.Sales])
                .withConnectedHelpCenter(1)
                .withChatChannelEnabled()
                .build()

        const task = new EnableSuggestedProductQuestionsTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                isAiShoppingAssistantEnabled: true,
                storeKnowledgeStatus: {
                    has_public_resources: true,
                } as any,
                selfServiceChatChannels: [{ value: { id: 1 } }] as any,
                chatIntegrationsStatus: [{ chatId: 1, installed: true }] as any,
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.display).toBe(true)
    })

    it('should not display the task when suggested product questions is enabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withSuggestedProductQuestions()
                .withConnectedChatIntegrations([1])
                .withScopes([AiAgentScope.Support, AiAgentScope.Sales])
                .withConnectedHelpCenter(1)
                .withChatChannelEnabled()
                .build()

        const task = new EnableSuggestedProductQuestionsTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                isAiShoppingAssistantEnabled: true,
                storeKnowledgeStatus: {
                    has_public_resources: true,
                } as any,
                selfServiceChatChannels: [{ value: { id: 1 } }] as any,
                chatIntegrationsStatus: [{ chatId: 1, installed: true }] as any,
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.display).toBe(false)
    })

    it('should not display the task when sales scope is not enabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutSuggestedProductQuestions()
                .withConnectedChatIntegrations([1])
                .withScopes([AiAgentScope.Support])
                .withConnectedHelpCenter(1)
                .withChatChannelEnabled()
                .build()

        const task = new EnableSuggestedProductQuestionsTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                isAiShoppingAssistantEnabled: true,
                storeKnowledgeStatus: {
                    has_public_resources: true,
                } as any,
                selfServiceChatChannels: [{ value: { id: 1 } }] as any,
                chatIntegrationsStatus: [{ chatId: 1, installed: true }] as any,
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.display).toBe(false)
    })

    it('should not display the task when chat is not enabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutSuggestedProductQuestions()
                .withConnectedChatIntegrations([1])
                .withScopes([AiAgentScope.Support, AiAgentScope.Sales])
                .withConnectedHelpCenter(1)
                .build()

        const task = new EnableSuggestedProductQuestionsTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                isAiShoppingAssistantEnabled: true,
                storeKnowledgeStatus: {
                    has_public_resources: true,
                } as any,
                selfServiceChatChannels: [{ value: { id: 1 } }] as any,
                chatIntegrationsStatus: [{ chatId: 1, installed: true }] as any,
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.display).toBe(false)
    })

    it('should not display the task when user do not have the ai shopping assistant flag', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutSuggestedProductQuestions()
                .withConnectedChatIntegrations([1])
                .withScopes([AiAgentScope.Support, AiAgentScope.Sales])
                .withConnectedHelpCenter(1)
                .withChatChannelEnabled()
                .build()

        const task = new EnableSuggestedProductQuestionsTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                isAiShoppingAssistantEnabled: false,
                storeKnowledgeStatus: {
                    has_public_resources: true,
                } as any,
                selfServiceChatChannels: [{ value: { id: 1 } }] as any,
                chatIntegrationsStatus: [{ chatId: 1, installed: true }] as any,
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.display).toBe(false)
    })
})
