import { AiAgentScope } from 'models/aiAgent/types'

import type { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { PrepareTriggerOnSearchTask } from './PrepareTriggerOnSearch.task'

describe('PrepareTriggerOnSearchTask', () => {
    const mockRoutes: RuleEngineRoutes = {
        aiAgentRoutes: {
            customerEngagement: '/ai-agent/customer-engagement',
            actions: '/ai-agent/actions',
            deployChat: '/ai-agent/.getAiAgentNavigationRoutesdeploy-chat',
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
                isSalesHelpOnSearchEnabled: false,
            },
            selfServiceChatChannels: [],
            pageInteractions: null,
            isActivationEnabled: false,
            isAiShoppingAssistantEnabled: false,
            isTriggerOnSearchDisabled: false,
            ...overrides,
        } as RuleEngineData
    }

    describe('constructor', () => {
        it('should initialize with correct title, caption, and type', () => {
            const data = createMockData()
            const task = new PrepareTriggerOnSearchTask(data, mockRoutes)

            expect(task.title).toBe('Enable Search assist')
            expect(task.caption).toBe(
                'Proactively reach out to shoppers after a search.',
            )
            expect(task.type).toBe('RECOMMENDED')
        })
    })

    describe('available', () => {
        it('should be available when aiAgentStoreConfiguration exists', () => {
            const data = createMockData()
            const task = new PrepareTriggerOnSearchTask(data, mockRoutes)

            expect(task.available).toBe(true)
        })
    })

    describe('display', () => {
        it('should be displayed when Sales scope is included, search is not disabled, and sales help on search is not enabled', () => {
            const data = createMockData({
                aiAgentStoreConfiguration: {
                    monitoredEmailIntegrations: [],
                    monitoredChatIntegrations: [],
                    scopes: [AiAgentScope.Sales],
                    isSalesHelpOnSearchEnabled: false,
                } as any,
                isTriggerOnSearchDisabled: false,
            })
            const task = new PrepareTriggerOnSearchTask(data, mockRoutes)

            expect(task.display).toBe(true)
        })

        it('should not be displayed when Sales scope is not included', () => {
            const data = createMockData({
                aiAgentStoreConfiguration: {
                    monitoredEmailIntegrations: [],
                    monitoredChatIntegrations: [],
                    scopes: [AiAgentScope.Support],
                    isSalesHelpOnSearchEnabled: false,
                } as any,
                isTriggerOnSearchDisabled: false,
            })
            const task = new PrepareTriggerOnSearchTask(data, mockRoutes)

            expect(task.display).toBe(false)
        })

        it('should not be displayed when sales help on search is enabled', () => {
            const data = createMockData({
                aiAgentStoreConfiguration: {
                    monitoredEmailIntegrations: [],
                    monitoredChatIntegrations: [],
                    scopes: [AiAgentScope.Sales],
                    isSalesHelpOnSearchEnabled: true,
                } as any,
                isTriggerOnSearchDisabled: false,
            })
            const task = new PrepareTriggerOnSearchTask(data, mockRoutes)

            expect(task.display).toBe(false)
        })

        it('should not be displayed when Search assist is disabled', () => {
            const data = createMockData({
                aiAgentStoreConfiguration: {
                    monitoredEmailIntegrations: [],
                    monitoredChatIntegrations: [],
                    scopes: [AiAgentScope.Sales],
                    isSalesHelpOnSearchEnabled: false,
                } as any,
                isTriggerOnSearchDisabled: true,
            })
            const task = new PrepareTriggerOnSearchTask(data, mockRoutes)

            expect(task.display).toBe(false)
        })

        it('should be displayed when both Sales and Support scopes are included', () => {
            const data = createMockData({
                aiAgentStoreConfiguration: {
                    monitoredEmailIntegrations: [],
                    monitoredChatIntegrations: [],
                    scopes: [AiAgentScope.Sales, AiAgentScope.Support],
                    isSalesHelpOnSearchEnabled: false,
                } as any,
                isTriggerOnSearchDisabled: false,
            })
            const task = new PrepareTriggerOnSearchTask(data, mockRoutes)

            expect(task.display).toBe(true)
        })

        it('should not be displayed when both sales help on search is enabled and Search assist is disabled', () => {
            const data = createMockData({
                aiAgentStoreConfiguration: {
                    monitoredEmailIntegrations: [],
                    monitoredChatIntegrations: [],
                    scopes: [AiAgentScope.Sales],
                    isSalesHelpOnSearchEnabled: true,
                } as any,
                isTriggerOnSearchDisabled: true,
            })
            const task = new PrepareTriggerOnSearchTask(data, mockRoutes)

            expect(task.display).toBe(false)
        })

        it('should not be displayed when scopes array is empty', () => {
            const data = createMockData({
                aiAgentStoreConfiguration: {
                    monitoredEmailIntegrations: [],
                    monitoredChatIntegrations: [],
                    scopes: [],
                    isSalesHelpOnSearchEnabled: false,
                } as any,
                isTriggerOnSearchDisabled: false,
            })
            const task = new PrepareTriggerOnSearchTask(data, mockRoutes)

            expect(task.display).toBe(false)
        })
    })

    describe('featureUrl', () => {
        it('should return the customer engagement route', () => {
            const data = createMockData()
            const task = new PrepareTriggerOnSearchTask(data, mockRoutes)

            expect(task.featureUrl).toBe('/ai-agent/customer-engagement')
        })
    })

    describe('isCheckedAutomatically', () => {
        it('should be checked automatically', () => {
            const data = createMockData()
            const task = new PrepareTriggerOnSearchTask(data, mockRoutes)

            expect(task.isCheckedAutomatically).toBe(true)
        })
    })

    describe('completed', () => {
        it('should be completed when display is false (sales help on search is enabled)', () => {
            const data = createMockData({
                aiAgentStoreConfiguration: {
                    monitoredEmailIntegrations: [],
                    monitoredChatIntegrations: [],
                    scopes: [AiAgentScope.Sales],
                    isSalesHelpOnSearchEnabled: true,
                } as any,
                isTriggerOnSearchDisabled: false,
            })
            const task = new PrepareTriggerOnSearchTask(data, mockRoutes)

            expect(task.completed).toBe(true)
        })

        it('should not be completed when display is true', () => {
            const data = createMockData({
                aiAgentStoreConfiguration: {
                    monitoredEmailIntegrations: [],
                    monitoredChatIntegrations: [],
                    scopes: [AiAgentScope.Sales],
                    isSalesHelpOnSearchEnabled: false,
                } as any,
                isTriggerOnSearchDisabled: false,
            })
            const task = new PrepareTriggerOnSearchTask(data, mockRoutes)

            expect(task.completed).toBe(false)
        })

        it('should be completed when Search assist is disabled', () => {
            const data = createMockData({
                aiAgentStoreConfiguration: {
                    monitoredEmailIntegrations: [],
                    monitoredChatIntegrations: [],
                    scopes: [AiAgentScope.Sales],
                    isSalesHelpOnSearchEnabled: false,
                } as any,
                isTriggerOnSearchDisabled: true,
            })
            const task = new PrepareTriggerOnSearchTask(data, mockRoutes)

            expect(task.completed).toBe(true)
        })

        it('should be completed when Sales scope is not included', () => {
            const data = createMockData({
                aiAgentStoreConfiguration: {
                    monitoredEmailIntegrations: [],
                    monitoredChatIntegrations: [],
                    scopes: [AiAgentScope.Support],
                    isSalesHelpOnSearchEnabled: false,
                } as any,
                isTriggerOnSearchDisabled: false,
            })
            const task = new PrepareTriggerOnSearchTask(data, mockRoutes)

            expect(task.completed).toBe(true)
        })
    })
})
