import { AiAgentScope } from 'models/aiAgent/types'
import {
    FocusActivationModal,
    getAiSalesAgentEmailEnabledFlag,
} from 'pages/aiAgent/Activation/utils'

import { AiAgentStoreConfigurationFixture } from '../../tests/AiAgentStoreConfiguration.fixture'
import { EnableSalesSkill } from '../EnableSalesSkill'
import { buildRuleEngineData, buildRuleEngineRoutes } from './utils'

jest.mock('pages/aiAgent/Activation/utils', () => ({
    ...jest.requireActual('pages/aiAgent/Activation/utils'),
    getAiSalesAgentEmailEnabledFlag: jest.fn(),
}))

describe('EnableSalesSkill', () => {
    const mockedGetAiSalesAgentEmailEnabledFlag =
        getAiSalesAgentEmailEnabledFlag as jest.Mock

    beforeEach(() => {
        mockedGetAiSalesAgentEmailEnabledFlag.mockReturnValue(true)
    })

    it('should display the task if sales skill is not enabled and at least one sales channel is enabled and the feature flag is enabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutConnectedHelpCenter()
                .withEmailChannelEnabled()
                .withChatChannelEnabled()
                .build()
        aiAgentStoreConfiguration.scopes = []

        const task = new EnableSalesSkill(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(true)
        expect(aiAgentStoreConfiguration.emailChannelDeactivatedDatetime).toBe(
            null,
        )
        expect(aiAgentStoreConfiguration.chatChannelDeactivatedDatetime).toBe(
            null,
        )
    })

    it('should not display the task if sales skill is enabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutConnectedHelpCenter()
                .withEmailChannelEnabled()
                .withChatChannelEnabled()
                .build()
        aiAgentStoreConfiguration.scopes = [AiAgentScope.Sales]

        const task = new EnableSalesSkill(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(false)
    })

    it('should not display the task if no sales channel is enabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutConnectedHelpCenter()
                .build()
        aiAgentStoreConfiguration.scopes = []

        const task = new EnableSalesSkill(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(false)
    })

    it('should not display the task if the feature flag is disabled', () => {
        mockedGetAiSalesAgentEmailEnabledFlag.mockReturnValue(false)

        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutConnectedHelpCenter()
                .withEmailChannelEnabled()
                .withChatChannelEnabled()
                .build()
        aiAgentStoreConfiguration.scopes = []

        const task = new EnableSalesSkill(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
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
                sales: '/ai-agent/sales',
            } as any
        })

        it('should generate URL with activation modal when activation is enabled', () => {
            const aiAgentStoreConfiguration =
                AiAgentStoreConfigurationFixture.start()
                    .withoutConnectedHelpCenter()
                    .withEmailChannelEnabled()
                    .withChatChannelEnabled()
                    .build()
            aiAgentStoreConfiguration.scopes = []

            const task = new EnableSalesSkill(
                buildRuleEngineData({
                    aiAgentStoreConfiguration: {
                        ...aiAgentStoreConfiguration,
                        storeName,
                    },
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
                    .withoutConnectedHelpCenter()
                    .withEmailChannelEnabled()
                    .withChatChannelEnabled()
                    .build()
            aiAgentStoreConfiguration.scopes = []

            const task = new EnableSalesSkill(
                buildRuleEngineData({
                    aiAgentStoreConfiguration: {
                        ...aiAgentStoreConfiguration,
                        storeName,
                    },
                    isActivationEnabled: false,
                }),
                routes,
            )

            expect(task.featureUrl).toBe('/ai-agent/sales')
        })
    })
})
