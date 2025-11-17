import { AiAgentScope } from 'models/aiAgent/types'

import type { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { PrepareAskAnythingInputTask } from './PrepareAskAnythingInput.task'

describe('PrepareAskAnythingInputTask', () => {
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
                floatingChatInputConfiguration: {
                    isEnabled: false,
                    isDesktopOnly: false,
                    needHelpText: '',
                },
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
            const task = new PrepareAskAnythingInputTask(data, mockRoutes)

            expect(task.title).toBe('Enable Ask anything input for Chat')
            expect(task.caption).toBe(
                'Drive more sales by encouraging Shoppers to start a chat.',
            )
            expect(task.type).toBe('RECOMMENDED')
        })
    })

    describe('available', () => {
        it('should be available when aiAgentStoreConfiguration exists', () => {
            const data = createMockData()
            const task = new PrepareAskAnythingInputTask(data, mockRoutes)

            expect(task.available).toBe(true)
        })
    })

    describe('display', () => {
        it('should be displayed when Sales scope is included and floatingChatInputConfiguration is not enabled', () => {
            const data = createMockData({
                aiAgentStoreConfiguration: {
                    monitoredEmailIntegrations: [],
                    monitoredChatIntegrations: [],
                    scopes: [AiAgentScope.Sales],
                    floatingChatInputConfiguration: {
                        isEnabled: false,
                        isDesktopOnly: false,
                        needHelpText: '',
                    },
                } as any,
            })
            const task = new PrepareAskAnythingInputTask(data, mockRoutes)

            expect(task.display).toBe(true)
        })

        it('should not be displayed when Sales scope is not included', () => {
            const data = createMockData({
                aiAgentStoreConfiguration: {
                    monitoredEmailIntegrations: [],
                    monitoredChatIntegrations: [],
                    scopes: [AiAgentScope.Support],
                    floatingChatInputConfiguration: {
                        isEnabled: false,
                        isDesktopOnly: false,
                        needHelpText: '',
                    },
                } as any,
            })
            const task = new PrepareAskAnythingInputTask(data, mockRoutes)

            expect(task.display).toBe(false)
        })

        it('should not be displayed when floatingChatInputConfiguration is enabled', () => {
            const data = createMockData({
                aiAgentStoreConfiguration: {
                    monitoredEmailIntegrations: [],
                    monitoredChatIntegrations: [],
                    scopes: [AiAgentScope.Sales],
                    floatingChatInputConfiguration: {
                        isEnabled: true,
                        isDesktopOnly: false,
                        needHelpText: '',
                    },
                } as any,
            })
            const task = new PrepareAskAnythingInputTask(data, mockRoutes)

            expect(task.display).toBe(false)
        })

        it('should not be displayed when floatingChatInputConfiguration is null', () => {
            const data = createMockData({
                aiAgentStoreConfiguration: {
                    monitoredEmailIntegrations: [],
                    monitoredChatIntegrations: [],
                    scopes: [AiAgentScope.Sales],
                    floatingChatInputConfiguration: null,
                } as any,
            })
            const task = new PrepareAskAnythingInputTask(data, mockRoutes)

            expect(task.display).toBe(true)
        })

        it('should not be displayed when floatingChatInputConfiguration is undefined', () => {
            const data = createMockData({
                aiAgentStoreConfiguration: {
                    monitoredEmailIntegrations: [],
                    monitoredChatIntegrations: [],
                    scopes: [AiAgentScope.Sales],
                    floatingChatInputConfiguration: undefined,
                } as any,
            })
            const task = new PrepareAskAnythingInputTask(data, mockRoutes)

            expect(task.display).toBe(true)
        })

        it('should be displayed when both Sales and Support scopes are included', () => {
            const data = createMockData({
                aiAgentStoreConfiguration: {
                    monitoredEmailIntegrations: [],
                    monitoredChatIntegrations: [],
                    scopes: [AiAgentScope.Sales, AiAgentScope.Support],
                    floatingChatInputConfiguration: {
                        isEnabled: false,
                        isDesktopOnly: false,
                        needHelpText: '',
                    },
                } as any,
            })
            const task = new PrepareAskAnythingInputTask(data, mockRoutes)

            expect(task.display).toBe(true)
        })
    })

    describe('featureUrl', () => {
        it('should return the customer engagement route', () => {
            const data = createMockData()
            const task = new PrepareAskAnythingInputTask(data, mockRoutes)

            expect(task.featureUrl).toBe('/ai-agent/customer-engagement')
        })
    })

    describe('isCheckedAutomatically', () => {
        it('should be checked automatically', () => {
            const data = createMockData()
            const task = new PrepareAskAnythingInputTask(data, mockRoutes)

            expect(task.isCheckedAutomatically).toBe(true)
        })
    })

    describe('completed', () => {
        it('should be completed when display is false (floatingChatInputConfiguration is enabled)', () => {
            const data = createMockData({
                aiAgentStoreConfiguration: {
                    monitoredEmailIntegrations: [],
                    monitoredChatIntegrations: [],
                    scopes: [AiAgentScope.Sales],
                    floatingChatInputConfiguration: {
                        isEnabled: true,
                        isDesktopOnly: false,
                        needHelpText: '',
                    },
                } as any,
            })
            const task = new PrepareAskAnythingInputTask(data, mockRoutes)

            expect(task.completed).toBe(true)
        })

        it('should not be completed when display is true', () => {
            const data = createMockData({
                aiAgentStoreConfiguration: {
                    monitoredEmailIntegrations: [],
                    monitoredChatIntegrations: [],
                    scopes: [AiAgentScope.Sales],
                    floatingChatInputConfiguration: {
                        isEnabled: false,
                        isDesktopOnly: false,
                        needHelpText: '',
                    },
                } as any,
            })
            const task = new PrepareAskAnythingInputTask(data, mockRoutes)

            expect(task.completed).toBe(false)
        })
    })
})
