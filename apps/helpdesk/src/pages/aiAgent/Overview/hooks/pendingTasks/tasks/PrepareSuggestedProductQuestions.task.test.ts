import { AiAgentScope } from 'models/aiAgent/types'

import type { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { PrepareSuggestedProductQuestionsTask } from './PrepareSuggestedProductQuestions.task'

describe('PrepareSuggestedProductQuestionsTask', () => {
    const mockRoutes: RuleEngineRoutes = {
        aiAgentRoutes: {
            customerEngagement: '/ai-agent/customer-engagement',
            actions: '/ai-agent/actions',
            deployChat: '/ai-agent/deploy-chat',
            deployEmail: '/ai-agent/deploy-email',
        } as ReturnType<
            typeof import('pages/aiAgent/hooks/useAiAgentNavigation').getAiAgentNavigationRoutes
        >,
    }

    const createMockData = (
        overrides?: Partial<RuleEngineData>,
    ): RuleEngineData => {
        return {
            actions: [],
            aiAgentStoreConfiguration: {
                monitoredEmailIntegrations: [],
                monitoredChatIntegrations: [],
                scopes: [AiAgentScope.Sales],
                isConversationStartersEnabled: false,
                isConversationStartersDesktopOnly: false,
            },
            selfServiceChatChannels: [],
            pageInteractions: null,
            isActivationEnabled: false,
            isAiShoppingAssistantEnabled: false,
            ...overrides,
        } as RuleEngineData
    }

    describe('constructor', () => {
        it('should initialize with correct title, caption, and type', () => {
            const data = createMockData()
            const task = new PrepareSuggestedProductQuestionsTask(
                data,
                mockRoutes,
            )

            expect(task.title).toBe('Enable Suggested Product Questions')
            expect(task.caption).toBe(
                'Show dynamic AI-generated questions on product pages',
            )
            expect(task.type).toBe('RECOMMENDED')
        })
    })

    describe('available', () => {
        it('should be available when aiAgentStoreConfiguration exists', () => {
            const data = createMockData()
            const task = new PrepareSuggestedProductQuestionsTask(
                data,
                mockRoutes,
            )

            expect(task.available).toBe(true)
        })
    })

    describe('display', () => {
        it('should be displayed when Sales scope is included and conversation starters are not enabled', () => {
            const data = createMockData({
                aiAgentStoreConfiguration: {
                    monitoredEmailIntegrations: [],
                    monitoredChatIntegrations: [],
                    scopes: [AiAgentScope.Sales],
                    isConversationStartersEnabled: false,
                    isConversationStartersDesktopOnly: false,
                } as any,
            })
            const task = new PrepareSuggestedProductQuestionsTask(
                data,
                mockRoutes,
            )

            expect(task.display).toBe(true)
        })

        it('should not be displayed when Sales scope is not included', () => {
            const data = createMockData({
                aiAgentStoreConfiguration: {
                    monitoredEmailIntegrations: [],
                    monitoredChatIntegrations: [],
                    scopes: [AiAgentScope.Support],
                    isConversationStartersEnabled: false,
                    isConversationStartersDesktopOnly: false,
                } as any,
            })
            const task = new PrepareSuggestedProductQuestionsTask(
                data,
                mockRoutes,
            )

            expect(task.display).toBe(false)
        })

        it('should not be displayed when conversation starters are enabled', () => {
            const data = createMockData({
                aiAgentStoreConfiguration: {
                    monitoredEmailIntegrations: [],
                    monitoredChatIntegrations: [],
                    scopes: [AiAgentScope.Sales],
                    isConversationStartersEnabled: true,
                    isConversationStartersDesktopOnly: false,
                } as any,
            })
            const task = new PrepareSuggestedProductQuestionsTask(
                data,
                mockRoutes,
            )

            expect(task.display).toBe(false)
        })

        it('should be displayed when both Sales and Support scopes are included', () => {
            const data = createMockData({
                aiAgentStoreConfiguration: {
                    monitoredEmailIntegrations: [],
                    monitoredChatIntegrations: [],
                    scopes: [AiAgentScope.Sales, AiAgentScope.Support],
                    isConversationStartersEnabled: false,
                    isConversationStartersDesktopOnly: false,
                } as any,
            })
            const task = new PrepareSuggestedProductQuestionsTask(
                data,
                mockRoutes,
            )

            expect(task.display).toBe(true)
        })

        it('should not be displayed when Sales scope is included but conversation starters are enabled', () => {
            const data = createMockData({
                aiAgentStoreConfiguration: {
                    monitoredEmailIntegrations: [],
                    monitoredChatIntegrations: [],
                    scopes: [AiAgentScope.Sales, AiAgentScope.Support],
                    isConversationStartersEnabled: true,
                    isConversationStartersDesktopOnly: false,
                } as any,
            })
            const task = new PrepareSuggestedProductQuestionsTask(
                data,
                mockRoutes,
            )

            expect(task.display).toBe(false)
        })

        it('should not be displayed when scopes array is empty', () => {
            const data = createMockData({
                aiAgentStoreConfiguration: {
                    monitoredEmailIntegrations: [],
                    monitoredChatIntegrations: [],
                    scopes: [],
                    isConversationStartersEnabled: false,
                    isConversationStartersDesktopOnly: false,
                } as any,
            })
            const task = new PrepareSuggestedProductQuestionsTask(
                data,
                mockRoutes,
            )

            expect(task.display).toBe(false)
        })
    })

    describe('featureUrl', () => {
        it('should return the customer engagement route', () => {
            const data = createMockData()
            const task = new PrepareSuggestedProductQuestionsTask(
                data,
                mockRoutes,
            )

            expect(task.featureUrl).toBe('/ai-agent/customer-engagement')
        })
    })

    describe('isCheckedAutomatically', () => {
        it('should be checked automatically', () => {
            const data = createMockData()
            const task = new PrepareSuggestedProductQuestionsTask(
                data,
                mockRoutes,
            )

            expect(task.isCheckedAutomatically).toBe(true)
        })
    })

    describe('completed', () => {
        it('should be completed when display is false (conversation starters are enabled)', () => {
            const data = createMockData({
                aiAgentStoreConfiguration: {
                    monitoredEmailIntegrations: [],
                    monitoredChatIntegrations: [],
                    scopes: [AiAgentScope.Sales],
                    isConversationStartersEnabled: true,
                    isConversationStartersDesktopOnly: false,
                } as any,
            })
            const task = new PrepareSuggestedProductQuestionsTask(
                data,
                mockRoutes,
            )

            expect(task.completed).toBe(true)
        })

        it('should not be completed when display is true', () => {
            const data = createMockData({
                aiAgentStoreConfiguration: {
                    monitoredEmailIntegrations: [],
                    monitoredChatIntegrations: [],
                    scopes: [AiAgentScope.Sales],
                    isConversationStartersEnabled: false,
                    isConversationStartersDesktopOnly: false,
                } as any,
            })
            const task = new PrepareSuggestedProductQuestionsTask(
                data,
                mockRoutes,
            )

            expect(task.completed).toBe(false)
        })

        it('should be completed when Sales scope is not included', () => {
            const data = createMockData({
                aiAgentStoreConfiguration: {
                    monitoredEmailIntegrations: [],
                    monitoredChatIntegrations: [],
                    scopes: [AiAgentScope.Support],
                    isConversationStartersEnabled: false,
                    isConversationStartersDesktopOnly: false,
                } as any,
            })
            const task = new PrepareSuggestedProductQuestionsTask(
                data,
                mockRoutes,
            )

            expect(task.completed).toBe(true)
        })
    })
})
