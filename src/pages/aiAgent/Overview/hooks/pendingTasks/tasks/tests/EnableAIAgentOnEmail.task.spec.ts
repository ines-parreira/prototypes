import { FocusActivationModal } from 'pages/aiAgent/Activation/utils'

import { AiAgentStoreConfigurationFixture } from '../../tests/AiAgentStoreConfiguration.fixture'
import { EnableAIAgentOnEmailTask } from '../EnableAIAgentOnEmail.task'
import { buildRuleEngineData, buildRuleEngineRoutes } from './utils'

describe('EnableAIAgentOnEmail', () => {
    it('should display the task if ai agent store configuration email disabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutConnectedHelpCenter()
                .build()

        const task = new EnableAIAgentOnEmailTask(
            buildRuleEngineData({
                aiAgentStoreConfiguration,
            }),
            buildRuleEngineRoutes(),
        )
        expect(task.display).toBe(true)
    })

    it('should not display the task if ai agent store configuration email enabled', () => {
        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutConnectedHelpCenter()
                .withEmailChannelEnabled()
                .build()

        const task = new EnableAIAgentOnEmailTask(
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
                settingsChannels: '/ai-agent/settings/channels',
            } as any
        })

        it('should generate URL with activation modal when activation is enabled', () => {
            const aiAgentStoreConfiguration =
                AiAgentStoreConfigurationFixture.start()
                    .withoutConnectedHelpCenter()
                    .build()

            const task = new EnableAIAgentOnEmailTask(
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
                    .build()

            const task = new EnableAIAgentOnEmailTask(
                buildRuleEngineData({
                    aiAgentStoreConfiguration: {
                        ...aiAgentStoreConfiguration,
                        storeName,
                    },
                    isActivationEnabled: false,
                }),
                routes,
            )

            expect(task.featureUrl).toBe('/ai-agent/settings/channels')
        })
    })
})
