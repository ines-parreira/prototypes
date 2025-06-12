import { AiAgentScope } from 'models/aiAgent/types'

import { AiAgentStoreConfigurationFixture } from '../../tests/AiAgentStoreConfiguration.fixture'
import { EnableTriggerOnSearchTask } from '../EnableTriggerOnSearch.task'
import { buildRuleEngineData, buildRuleEngineRoutes } from './utils'

describe('EnableTriggerOnSearchTask', () => {
    it('should display the task when trigger on search is not enabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutTriggerOnSearch()
                .withConnectedChatIntegrations([1])
                .withScopes([AiAgentScope.Support, AiAgentScope.Sales])
                .withConnectedHelpCenter(1)
                .withChatChannelEnabled()
                .build()

        const task = new EnableTriggerOnSearchTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                storeKnowledgeStatus: {
                    has_public_resources: true,
                } as any,
                selfServiceChatChannels: [{ value: { id: 1 } }] as any,
                chatIntegrationsStatus: [{ chatId: 1, installed: true }] as any,
                isAiSalesAgentHelpOnSearchTemplateQueryEnabled: true,
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.display).toBe(true)
    })

    it('should not display the task when trigger on search is not enabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withTriggerOnSearch()
                .withConnectedChatIntegrations([1])
                .withScopes([AiAgentScope.Support, AiAgentScope.Sales])
                .withConnectedHelpCenter(1)
                .withChatChannelEnabled()
                .build()

        const task = new EnableTriggerOnSearchTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                storeKnowledgeStatus: {
                    has_public_resources: true,
                } as any,
                selfServiceChatChannels: [{ value: { id: 1 } }] as any,
                chatIntegrationsStatus: [{ chatId: 1, installed: true }] as any,
                isAiSalesAgentHelpOnSearchTemplateQueryEnabled: true,
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.display).toBe(false)
    })

    it('should not display the task when sales scope is not enabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutTriggerOnSearch()
                .withConnectedChatIntegrations([1])
                .withScopes([AiAgentScope.Support])
                .withConnectedHelpCenter(1)
                .withChatChannelEnabled()
                .build()

        const task = new EnableTriggerOnSearchTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                storeKnowledgeStatus: {
                    has_public_resources: true,
                } as any,
                selfServiceChatChannels: [{ value: { id: 1 } }] as any,
                chatIntegrationsStatus: [{ chatId: 1, installed: true }] as any,
                isAiSalesAgentHelpOnSearchTemplateQueryEnabled: true,
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.display).toBe(false)
    })

    it('should not display the task when chat is not enabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutTriggerOnSearch()
                .withConnectedChatIntegrations([1])
                .withScopes([AiAgentScope.Support, AiAgentScope.Sales])
                .withConnectedHelpCenter(1)
                .build()

        const task = new EnableTriggerOnSearchTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                storeKnowledgeStatus: {
                    has_public_resources: true,
                } as any,
                selfServiceChatChannels: [{ value: { id: 1 } }] as any,
                chatIntegrationsStatus: [{ chatId: 1, installed: true }] as any,
                isAiSalesAgentHelpOnSearchTemplateQueryEnabled: true,
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.display).toBe(false)
    })

    it('should not display the task when user do not have the trigger on search flag', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutTriggerOnSearch()
                .withConnectedChatIntegrations([1])
                .withScopes([AiAgentScope.Support, AiAgentScope.Sales])
                .withConnectedHelpCenter(1)
                .withChatChannelEnabled()
                .build()

        const task = new EnableTriggerOnSearchTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
                storeKnowledgeStatus: {
                    has_public_resources: true,
                } as any,
                selfServiceChatChannels: [{ value: { id: 1 } }] as any,
                chatIntegrationsStatus: [{ chatId: 1, installed: true }] as any,
                isAiSalesAgentHelpOnSearchTemplateQueryEnabled: false,
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.display).toBe(false)
    })
})
