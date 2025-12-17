import type React from 'react'

import { isProduction } from '@repo/utils'
import { renderHook } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'

import { createBaseUrl } from 'models/aiAgent/resources/message-processing'
import { IntegrationType } from 'models/integration/constants'
import type { HttpIntegration } from 'models/integration/types'

import { useAiAgentHttpIntegration } from '../useAiAgentHttpIntegration'

const mockStore = configureStore([])

jest.mock('models/aiAgent/resources/message-processing', () => ({
    createBaseUrl: jest.fn(() => 'https://aiagent.gorgias.help'),
}))

jest.mock('@repo/utils', () => {
    const actual = jest.requireActual('@repo/utils')
    return {
        ...actual,
        isProduction: jest.fn(() => false),
        GorgiasUIEnv: {
            Development: 'development',
            Production: 'production',
            Staging: 'staging',
        },
        getEnvironment: jest.fn(() => 'development'),
    }
})

describe('useAiAgentHttpIntegration', () => {
    const createWrapper = (store: any) => {
        return ({ children }: { children: React.ReactNode }) => (
            <Provider store={store}>{children}</Provider>
        )
    }

    const mockIsProduction = isProduction as jest.MockedFunction<
        typeof isProduction
    >
    const mockCreateBaseUrl = createBaseUrl as jest.MockedFunction<
        typeof createBaseUrl
    >

    beforeEach(() => {
        // Default to non-production environment
        mockIsProduction.mockReturnValue(false)
        mockCreateBaseUrl.mockReturnValue('https://aiagent.gorgias.help')
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return AI agent integration with extracted base URL when integration exists with /api/ path', () => {
        const mockIntegration = {
            id: 123,
            name: 'AI agent',
            type: IntegrationType.Http,
            http: {
                url: 'https://ai-agent-api-staging-ulad.ngrok.io/api/interaction/start',
                execution_order: 1,
                form: null,
                headers: {},
                id: 456,
                method: 'POST' as any,
                request_content_type: 'application/json' as any,
                response_content_type: 'application/json' as any,
                triggers: {},
            },
            meta: {},
        } as HttpIntegration

        const store = mockStore({
            integrations: fromJS({
                integrations: [mockIntegration],
            }),
        })

        const { result } = renderHook(() => useAiAgentHttpIntegration(), {
            wrapper: createWrapper(store),
        })

        expect(result.current.httpIntegrationId).toBe(123)
        expect(result.current.baseUrl).toBe(
            'https://ai-agent-api-staging-ulad.ngrok.io',
        )
        expect(result.current.aiAgentIntegration).toEqual(mockIntegration)
    })

    it('should extract origin when /api/ is not found in URL', () => {
        const mockIntegration = {
            id: 456,
            name: 'AI agent',
            type: IntegrationType.Http,
            http: {
                url: 'https://custom-ai-agent.example.com:8080/some/other/path',
                execution_order: 1,
                form: null,
                headers: {},
                id: 789,
                method: 'POST' as any,
                request_content_type: 'application/json' as any,
                response_content_type: 'application/json' as any,
                triggers: {},
            },
            meta: {},
        } as HttpIntegration

        const store = mockStore({
            integrations: fromJS({
                integrations: [mockIntegration],
            }),
        })

        const { result } = renderHook(() => useAiAgentHttpIntegration(), {
            wrapper: createWrapper(store),
        })

        expect(result.current.baseUrl).toBe(
            'https://custom-ai-agent.example.com:8080',
        )
    })

    it('should return default URL when no AI agent integration exists', () => {
        const mockIntegration = {
            id: 789,
            name: 'Some other integration',
            type: IntegrationType.Http,
            http: {
                url: 'https://example.com/webhook',
                execution_order: 1,
                form: null,
                headers: {},
                id: 999,
                method: 'POST' as any,
                request_content_type: 'application/json' as any,
                response_content_type: 'application/json' as any,
                triggers: {},
            },
            meta: {},
        } as HttpIntegration

        const store = mockStore({
            integrations: fromJS({
                integrations: [mockIntegration],
            }),
        })

        const { result } = renderHook(() => useAiAgentHttpIntegration(), {
            wrapper: createWrapper(store),
        })

        expect(result.current.httpIntegrationId).toBe(null)
        expect(result.current.baseUrl).toBe('https://aiagent.gorgias.help')
        expect(result.current.aiAgentIntegration).toBeUndefined()
        expect(createBaseUrl).toHaveBeenCalled()
    })

    it('should return default URL when integrations list is empty', () => {
        const store = mockStore({
            integrations: fromJS({
                integrations: [],
            }),
        })

        const { result } = renderHook(() => useAiAgentHttpIntegration(), {
            wrapper: createWrapper(store),
        })

        expect(result.current.httpIntegrationId).toBe(null)
        expect(result.current.baseUrl).toBe('https://aiagent.gorgias.help')
        expect(result.current.aiAgentIntegration).toBeUndefined()
    })

    it('should handle integration without http property', () => {
        const mockIntegration = {
            id: 111,
            name: 'AI agent',
            type: IntegrationType.Http,
            http: null as any,
            meta: {},
        } as HttpIntegration

        const store = mockStore({
            integrations: fromJS({
                integrations: [mockIntegration],
            }),
        })

        const { result } = renderHook(() => useAiAgentHttpIntegration(), {
            wrapper: createWrapper(store),
        })

        expect(result.current.httpIntegrationId).toBe(111)
        expect(result.current.baseUrl).toBe('https://aiagent.gorgias.help')
        expect(result.current.aiAgentIntegration).toEqual(mockIntegration)
    })

    it('should handle integration with invalid URL format', () => {
        const mockIntegration = {
            id: 222,
            name: 'AI agent',
            type: IntegrationType.Http,
            http: {
                url: 'not-a-valid-url',
                execution_order: 1,
                form: null,
                headers: {},
                id: 333,
                method: 'POST' as any,
                request_content_type: 'application/json' as any,
                response_content_type: 'application/json' as any,
                triggers: {},
            },
            meta: {},
        } as HttpIntegration

        const store = mockStore({
            integrations: fromJS({
                integrations: [mockIntegration],
            }),
        })

        const { result } = renderHook(() => useAiAgentHttpIntegration(), {
            wrapper: createWrapper(store),
        })

        expect(result.current.baseUrl).toBe('not-a-valid-url')
    })

    it('should handle URL with /api/ at the end', () => {
        const mockIntegration = {
            id: 444,
            name: 'AI agent',
            type: IntegrationType.Http,
            http: {
                url: 'https://example.com/api/',
                execution_order: 1,
                form: null,
                headers: {},
                id: 555,
                method: 'POST' as any,
                request_content_type: 'application/json' as any,
                response_content_type: 'application/json' as any,
                triggers: {},
            },
            meta: {},
        } as HttpIntegration

        const store = mockStore({
            integrations: fromJS({
                integrations: [mockIntegration],
            }),
        })

        const { result } = renderHook(() => useAiAgentHttpIntegration(), {
            wrapper: createWrapper(store),
        })

        expect(result.current.baseUrl).toBe('https://example.com')
    })

    it('should handle multiple HTTP integrations and find the AI agent one', () => {
        const otherIntegration = {
            id: 666,
            name: 'Other integration',
            type: IntegrationType.Http,
            http: {
                url: 'https://other.com/api/webhook',
                execution_order: 1,
                form: null,
                headers: {},
                id: 777,
                method: 'POST' as any,
                request_content_type: 'application/json' as any,
                response_content_type: 'application/json' as any,
                triggers: {},
            },
            meta: {},
        } as HttpIntegration

        const aiAgentIntegration = {
            id: 888,
            name: 'AI agent',
            type: IntegrationType.Http,
            http: {
                url: 'https://ai-agent.com/api/v1/endpoint',
                execution_order: 2,
                form: null,
                headers: {},
                id: 999,
                method: 'POST' as any,
                request_content_type: 'application/json' as any,
                response_content_type: 'application/json' as any,
                triggers: {},
            },
            meta: {},
        } as HttpIntegration

        const store = mockStore({
            integrations: fromJS({
                integrations: [otherIntegration, aiAgentIntegration],
            }),
        })

        const { result } = renderHook(() => useAiAgentHttpIntegration(), {
            wrapper: createWrapper(store),
        })

        expect(result.current.httpIntegrationId).toBe(888)
        expect(result.current.baseUrl).toBe('https://ai-agent.com')
        expect(result.current.aiAgentIntegration).toEqual(aiAgentIntegration)
    })

    it('should handle URL with nested /api/ paths and extract first occurrence', () => {
        const mockIntegration = {
            id: 1010,
            name: 'AI agent',
            type: IntegrationType.Http,
            http: {
                url: 'https://example.com/api/v2/api/interaction',
                execution_order: 1,
                form: null,
                headers: {},
                id: 1111,
                method: 'POST' as any,
                request_content_type: 'application/json' as any,
                response_content_type: 'application/json' as any,
                triggers: {},
            },
            meta: {},
        } as HttpIntegration

        const store = mockStore({
            integrations: fromJS({
                integrations: [mockIntegration],
            }),
        })

        const { result } = renderHook(() => useAiAgentHttpIntegration(), {
            wrapper: createWrapper(store),
        })

        expect(result.current.baseUrl).toBe('https://example.com')
    })

    it('should be case-insensitive when looking for AI agent integration name', () => {
        const mockIntegration = {
            id: 1212,
            name: 'ai agent', // lowercase
            type: IntegrationType.Http,
            http: {
                url: 'https://example.com/api/endpoint',
                execution_order: 1,
                form: null,
                headers: {},
                id: 1313,
                method: 'POST' as any,
                request_content_type: 'application/json' as any,
                response_content_type: 'application/json' as any,
                triggers: {},
            },
            meta: {},
        } as HttpIntegration

        const store = mockStore({
            integrations: fromJS({
                integrations: [mockIntegration],
            }),
        })

        const { result } = renderHook(() => useAiAgentHttpIntegration(), {
            wrapper: createWrapper(store),
        })

        // Should find the integration because name matching is now case-insensitive
        expect(result.current.httpIntegrationId).toBe(1212)
        expect(result.current.baseUrl).toBe('https://example.com')
        expect(result.current.aiAgentIntegration).toEqual(mockIntegration)
    })

    it('should always return default URL in production environment regardless of integrations', () => {
        mockIsProduction.mockReturnValue(true)

        const mockIntegration = {
            id: 999,
            name: 'AI agent',
            type: IntegrationType.Http,
            http: {
                url: 'https://custom-ai-agent.com/api/interaction/start',
                execution_order: 1,
                form: null,
                headers: {},
                id: 1000,
                method: 'POST' as any,
                request_content_type: 'application/json' as any,
                response_content_type: 'application/json' as any,
                triggers: {},
            },
            meta: {},
        } as HttpIntegration

        const store = mockStore({
            integrations: fromJS({
                integrations: [mockIntegration],
            }),
        })

        const { result } = renderHook(() => useAiAgentHttpIntegration(), {
            wrapper: createWrapper(store),
        })

        // Should return default URL even though integration exists
        expect(result.current.httpIntegrationId).toBe(999)
        expect(result.current.baseUrl).toBe('https://aiagent.gorgias.help')
        expect(result.current.aiAgentIntegration).toEqual(mockIntegration)
        expect(mockCreateBaseUrl).toHaveBeenCalled()
    })

    it('should use integration URL in non-production environment', () => {
        mockIsProduction.mockReturnValue(false)

        const mockIntegration = {
            id: 777,
            name: 'AI Agent', // mixed case
            type: IntegrationType.Http,
            http: {
                url: 'https://staging.example.com/api/v1/endpoint',
                execution_order: 1,
                form: null,
                headers: {},
                id: 888,
                method: 'POST' as any,
                request_content_type: 'application/json' as any,
                response_content_type: 'application/json' as any,
                triggers: {},
            },
            meta: {},
        } as HttpIntegration

        const store = mockStore({
            integrations: fromJS({
                integrations: [mockIntegration],
            }),
        })

        const { result } = renderHook(() => useAiAgentHttpIntegration(), {
            wrapper: createWrapper(store),
        })

        // Should use the integration URL in non-production
        expect(result.current.httpIntegrationId).toBe(777)
        expect(result.current.baseUrl).toBe('https://staging.example.com')
        expect(result.current.aiAgentIntegration).toEqual(mockIntegration)
    })

    it('should return default URL in production even when no integrations exist', () => {
        mockIsProduction.mockReturnValue(true)

        const store = mockStore({
            integrations: fromJS({
                integrations: [],
            }),
        })

        const { result } = renderHook(() => useAiAgentHttpIntegration(), {
            wrapper: createWrapper(store),
        })

        expect(result.current.httpIntegrationId).toBe(null)
        expect(result.current.baseUrl).toBe('https://aiagent.gorgias.help')
        expect(result.current.aiAgentIntegration).toBeUndefined()
        expect(mockCreateBaseUrl).toHaveBeenCalled()
    })
})
