import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import type { FindAiReasoningAiReasoningResult } from '@gorgias/knowledge-service-types'

import {
    ReasoningResponseType,
    useGetMessageAiReasoning,
} from 'models/knowledgeService/queries'
import { useGetResourcesReasoningMetadata } from 'pages/tickets/detail/components/AIAgentFeedbackBar/useEnrichKnowledgeFeedbackData/useGetResourcesReasoningMetadata'

import { parseReasoningResources } from '../utils/reasoningResources'
import { useAiAgentReasoning } from './useAiAgentReasoning'

jest.mock('models/knowledgeService/queries', () => ({
    ...jest.requireActual('models/knowledgeService/queries'),
    useGetMessageAiReasoning: jest.fn(),
}))

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/useEnrichKnowledgeFeedbackData/useGetResourcesReasoningMetadata',
    () => ({
        useGetResourcesReasoningMetadata: jest.fn(),
    }),
)

jest.mock('../utils/reasoningResources', () => ({
    parseReasoningResources: jest.fn(() => []),
}))

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
})

const wrapper = ({ children }: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const mockReasoningData = (
    overrides?: Partial<FindAiReasoningAiReasoningResult['data']>,
): FindAiReasoningAiReasoningResult['data'] =>
    ({
        reasoning: [] as any,
        resources: [] as any,
        execution: null,
        usedTasks: [] as any,
        storeConfiguration: {
            shopName: 'test-store',
            shopType: 'shopify',
            faqHelpCenterId: 100,
            guidanceHelpCenterId: 200,
            snippetHelpCenterId: 300,
            executionId: 'exec-123',
        },
        ...overrides,
    }) as any

describe('useAiAgentReasoning', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
        ;(useGetMessageAiReasoning as jest.Mock).mockReturnValue({
            data: null,
            refetch: jest.fn(),
        })
        ;(useGetResourcesReasoningMetadata as jest.Mock).mockReturnValue({
            isLoading: false,
            data: [] as any,
        })
        ;(parseReasoningResources as jest.Mock).mockReturnValue([])
    })

    describe('basic functionality', () => {
        it('should return loading state when data is not yet available and enabled is true', () => {
            ;(useGetMessageAiReasoning as jest.Mock).mockReturnValue({
                data: null,
                refetch: jest.fn(),
            })

            const { result } = renderHook(
                () =>
                    useAiAgentReasoning({
                        objectId: '123',
                        objectType: 'TICKET',
                        messageId: '456',
                        enabled: true,
                    }),
                { wrapper },
            )

            expect(result.current.isLoading).toBe(true)
            expect(result.current.reasoningContent).toBe(null)
            expect(result.current.staticMessage).toBe(
                "Couldn't load reasoning. Please try again.",
            )
        })

        it('should not be loading when enabled is false', () => {
            const { result } = renderHook(
                () =>
                    useAiAgentReasoning({
                        objectId: '123',
                        objectType: 'TICKET',
                        messageId: '456',
                        enabled: false,
                    }),
                { wrapper },
            )

            expect(result.current.isLoading).toBe(false)
        })

        it('should call useGetMessageAiReasoning with correct parameters', () => {
            renderHook(
                () =>
                    useAiAgentReasoning({
                        objectId: '123',
                        objectType: 'TEST_MODE_SESSION',
                        messageId: '456',
                        enabled: true,
                    }),
                { wrapper },
            )

            expect(useGetMessageAiReasoning).toHaveBeenCalledWith(
                {
                    objectId: '123',
                    objectType: 'TEST_MODE_SESSION',
                    messageId: '456',
                } as any,
                {
                    enabled: true,
                } as any,
            )
        })

        it('should not enable query when messageId is empty', () => {
            renderHook(
                () =>
                    useAiAgentReasoning({
                        objectId: '123',
                        objectType: 'TICKET',
                        messageId: '',
                        enabled: true,
                    }),
                { wrapper },
            )

            expect(useGetMessageAiReasoning).toHaveBeenCalledWith(
                expect.anything(),
                {
                    enabled: false,
                } as any,
            )
        })
    })

    describe('reasoning content parsing', () => {
        it('should parse response reasoning only', () => {
            const mockData = mockReasoningData({
                reasoning: [
                    {
                        responseType: ReasoningResponseType.RESPONSE,
                        value: 'This is the response reasoning',
                        targetId: 'response-1',
                    } as any,
                ] as any,
            })
            ;(useGetMessageAiReasoning as jest.Mock).mockReturnValue({
                data: mockData,
                refetch: jest.fn(),
            })

            const { result } = renderHook(
                () =>
                    useAiAgentReasoning({
                        objectId: '123',
                        objectType: 'TICKET',
                        messageId: '456',
                    }),
                { wrapper },
            )

            expect(result.current.reasoningContent).toBe(
                'This is the response reasoning',
            )
            expect(result.current.isLoading).toBe(false)
        })

        it('should parse outcome reasoning only', () => {
            const mockData = mockReasoningData({
                reasoning: [
                    {
                        responseType: ReasoningResponseType.OUTCOME,
                        value: 'This is the outcome',
                        targetId: 'outcome-1',
                    } as any,
                ] as any,
            })
            ;(useGetMessageAiReasoning as jest.Mock).mockReturnValue({
                data: mockData,
                refetch: jest.fn(),
            })

            const { result } = renderHook(
                () =>
                    useAiAgentReasoning({
                        objectId: '123',
                        objectType: 'TICKET',
                        messageId: '456',
                    }),
                { wrapper },
            )

            expect(result.current.reasoningContent).toBe(
                '**Outcome:**\n\nThis is the outcome',
            )
        })

        it('should parse response and outcome reasoning with separator', () => {
            const mockData = mockReasoningData({
                reasoning: [
                    {
                        responseType: ReasoningResponseType.RESPONSE,
                        value: 'Response content',
                        targetId: 'response-1',
                    } as any,
                    {
                        responseType: ReasoningResponseType.OUTCOME,
                        value: 'Outcome content',
                        targetId: 'outcome-1',
                    } as any,
                ] as any,
            })
            ;(useGetMessageAiReasoning as jest.Mock).mockReturnValue({
                data: mockData,
                refetch: jest.fn(),
            })

            const { result } = renderHook(
                () =>
                    useAiAgentReasoning({
                        objectId: '123',
                        objectType: 'TICKET',
                        messageId: '456',
                    }),
                { wrapper },
            )

            expect(result.current.reasoningContent).toContain(
                'Response content',
            )
            expect(result.current.reasoningContent).toContain('&nbsp;')
            expect(result.current.reasoningContent).toContain(
                '**Outcome:**\n\nOutcome content',
            )
        })

        it('should parse full details with task reasoning', () => {
            const mockData = mockReasoningData({
                reasoning: [
                    {
                        responseType: ReasoningResponseType.TASK,
                        value: 'Task 1 reasoning',
                        targetId: 'task-1',
                    } as any,
                    {
                        responseType: ReasoningResponseType.TASK,
                        value: 'Task 2 reasoning',
                        targetId: 'task-2',
                    } as any,
                ] as any,
                usedTasks: ['task-1', 'task-2'] as any,
            })
            ;(useGetMessageAiReasoning as jest.Mock).mockReturnValue({
                data: mockData,
                refetch: jest.fn(),
            })

            const { result } = renderHook(
                () =>
                    useAiAgentReasoning({
                        objectId: '123',
                        objectType: 'TICKET',
                        messageId: '456',
                    }),
                { wrapper },
            )

            expect(result.current.reasoningContent).toContain(
                'fullDetailsContainer',
            )
            expect(result.current.reasoningContent).toContain('Full details:')
            expect(result.current.reasoningContent).toContain(
                '1. Task 1 reasoning',
            )
            expect(result.current.reasoningContent).toContain(
                '2. Task 2 reasoning',
            )
        })

        it('should filter out tasks not in usedTasks', () => {
            const mockData = mockReasoningData({
                reasoning: [
                    {
                        responseType: ReasoningResponseType.TASK,
                        value: 'Used task',
                        targetId: 'task-1',
                    } as any,
                    {
                        responseType: ReasoningResponseType.TASK,
                        value: 'Unused task',
                        targetId: 'task-2',
                    } as any,
                ] as any,
                usedTasks: ['task-1'] as any,
            })
            ;(useGetMessageAiReasoning as jest.Mock).mockReturnValue({
                data: mockData,
                refetch: jest.fn(),
            })

            const { result } = renderHook(
                () =>
                    useAiAgentReasoning({
                        objectId: '123',
                        objectType: 'TICKET',
                        messageId: '456',
                    }),
                { wrapper },
            )

            expect(result.current.reasoningContent).toContain('Used task')
            expect(result.current.reasoningContent).not.toContain('Unused task')
        })

        it('should include all tasks when usedTasks is undefined', () => {
            const mockData = mockReasoningData({
                reasoning: [
                    {
                        responseType: ReasoningResponseType.TASK,
                        value: 'Task 1',
                        targetId: 'task-1',
                    } as any,
                    {
                        responseType: ReasoningResponseType.TASK,
                        value: 'Task 2',
                        targetId: 'task-2',
                    } as any,
                ] as any,
                usedTasks: undefined,
            })
            ;(useGetMessageAiReasoning as jest.Mock).mockReturnValue({
                data: mockData,
                refetch: jest.fn(),
            })

            const { result } = renderHook(
                () =>
                    useAiAgentReasoning({
                        objectId: '123',
                        objectType: 'TICKET',
                        messageId: '456',
                    }),
                { wrapper },
            )

            expect(result.current.reasoningContent).toContain('Task 1')
            expect(result.current.reasoningContent).toContain('Task 2')
        })

        it('should combine full details and outcome into single container', () => {
            const mockData = mockReasoningData({
                reasoning: [
                    {
                        responseType: ReasoningResponseType.TASK,
                        value: 'Task reasoning',
                        targetId: 'task-1',
                    } as any,
                    {
                        responseType: ReasoningResponseType.OUTCOME,
                        value: 'Final outcome',
                        targetId: 'outcome-1',
                    } as any,
                ] as any,
                usedTasks: ['task-1'] as any,
            })
            ;(useGetMessageAiReasoning as jest.Mock).mockReturnValue({
                data: mockData,
                refetch: jest.fn(),
            })

            const { result } = renderHook(
                () =>
                    useAiAgentReasoning({
                        objectId: '123',
                        objectType: 'TICKET',
                        messageId: '456',
                    }),
                { wrapper },
            )

            expect(result.current.reasoningContent).toContain(
                'fullDetailsContainer',
            )
            expect(result.current.reasoningContent).toContain(
                '1. Task reasoning',
            )
            expect(result.current.reasoningContent).toContain('2. **Outcome**')
            expect(result.current.reasoningContent).toContain('Final outcome')
        })
    })

    describe('static messages', () => {
        it('should return handover static message when isHandover is true and no reasoning content', () => {
            const mockData = mockReasoningData({
                reasoning: [] as any,
                execution: {
                    endDatetime: '2024-01-01T00:00:00Z',
                } as any,
            })
            ;(useGetMessageAiReasoning as jest.Mock).mockReturnValue({
                data: mockData,
                refetch: jest.fn(),
            })

            const { result } = renderHook(
                () =>
                    useAiAgentReasoning({
                        objectId: '123',
                        objectType: 'TICKET',
                        messageId: '456',
                        isHandover: true,
                    }),
                { wrapper },
            )

            expect(result.current.staticMessage).toBe(
                'AI Agent was not confident in its answer and handed the ticket over to your team.',
            )
            expect(result.current.reasoningContent).toBe('')
        })

        it('should return unavailable message when execution ended but no reasoning', () => {
            const mockData = mockReasoningData({
                reasoning: [] as any,
                execution: {
                    endDatetime: '2024-01-01T00:00:00Z',
                } as any,
            })
            ;(useGetMessageAiReasoning as jest.Mock).mockReturnValue({
                data: mockData,
                refetch: jest.fn(),
            })

            const { result } = renderHook(
                () =>
                    useAiAgentReasoning({
                        objectId: '123',
                        objectType: 'TICKET',
                        messageId: '456',
                        isHandover: false,
                    }),
                { wrapper },
            )

            expect(result.current.staticMessage).toBe(
                'Reasoning unavailable for this message.',
            )
            expect(result.current.reasoningContent).toBe('')
        })

        it('should return error message when no data is available', () => {
            ;(useGetMessageAiReasoning as jest.Mock).mockReturnValue({
                data: null,
                refetch: jest.fn(),
            })

            const { result } = renderHook(
                () =>
                    useAiAgentReasoning({
                        objectId: '123',
                        objectType: 'TICKET',
                        messageId: '456',
                    }),
                { wrapper },
            )

            expect(result.current.staticMessage).toBe(
                "Couldn't load reasoning. Please try again.",
            )
            expect(result.current.reasoningContent).toBe(null)
        })
    })

    describe('resource parsing', () => {
        it('should parse resources from response reasoning', () => {
            const mockData = mockReasoningData({
                reasoning: [
                    {
                        responseType: ReasoningResponseType.RESPONSE,
                        value: 'Response with <<<article::100::1>>>',
                        targetId: 'response-1',
                    } as any,
                ] as any,
                resources: [] as any,
            })
            ;(useGetMessageAiReasoning as jest.Mock).mockReturnValue({
                data: mockData,
                refetch: jest.fn(),
            })
            ;(parseReasoningResources as jest.Mock)
                .mockReturnValueOnce([
                    {
                        resourceId: '1',
                        resourceSetId: '100',
                        resourceType: 'ARTICLE',
                    } as any,
                ])
                .mockReturnValueOnce([])

            const { result } = renderHook(
                () =>
                    useAiAgentReasoning({
                        objectId: '123',
                        objectType: 'TICKET',
                        messageId: '456',
                    }),
                { wrapper },
            )

            expect(parseReasoningResources).toHaveBeenCalledWith(
                'Response with <<<article::100::1>>>',
                [] as any,
            )
            expect(result.current.reasoningResources).toHaveLength(1)
        })

        it('should parse resources from task reasoning with taskIds filter', () => {
            const mockData = mockReasoningData({
                reasoning: [
                    {
                        responseType: ReasoningResponseType.TASK,
                        value: 'Task with <<<guidance::200::2>>>',
                        targetId: 'task-1',
                    } as any,
                ] as any,
                resources: [
                    {
                        resourceId: '2',
                        resourceSetId: '200',
                        resourceType: 'GUIDANCE',
                        taskIds: ['task-1'] as any,
                        resourceTitle: 'Guidance Article',
                    } as any,
                ] as any,
                usedTasks: ['task-1'] as any,
            })
            ;(useGetMessageAiReasoning as jest.Mock).mockReturnValue({
                data: mockData,
                refetch: jest.fn(),
            })

            renderHook(
                () =>
                    useAiAgentReasoning({
                        objectId: '123',
                        objectType: 'TICKET',
                        messageId: '456',
                    }),
                { wrapper },
            )

            expect(parseReasoningResources).toHaveBeenCalledWith(
                expect.anything(),
                [
                    {
                        resourceId: '2',
                        resourceSetId: '200',
                        resourceType: 'GUIDANCE',
                        taskIds: ['task-1'] as any,
                        resourceTitle: 'Guidance Article',
                    } as any,
                ] as any,
            )
        })

        it('should combine resources from all reasoning sections', () => {
            const mockData = mockReasoningData({
                reasoning: [
                    {
                        responseType: ReasoningResponseType.RESPONSE,
                        value: 'Response',
                        targetId: 'response-1',
                    } as any,
                    {
                        responseType: ReasoningResponseType.TASK,
                        value: 'Task',
                        targetId: 'task-1',
                    } as any,
                    {
                        responseType: ReasoningResponseType.OUTCOME,
                        value: 'Outcome',
                        targetId: 'outcome-1',
                    } as any,
                ] as any,
                resources: [] as any,
                usedTasks: ['task-1'] as any,
            })
            ;(useGetMessageAiReasoning as jest.Mock).mockReturnValue({
                data: mockData,
                refetch: jest.fn(),
            })
            ;(parseReasoningResources as jest.Mock)
                .mockReturnValueOnce([{ resourceId: '1' }])
                .mockReturnValueOnce([{ resourceId: '2' }])
                .mockReturnValueOnce([{ resourceId: '3' }])

            const { result } = renderHook(
                () =>
                    useAiAgentReasoning({
                        objectId: '123',
                        objectType: 'TICKET',
                        messageId: '456',
                    }),
                { wrapper },
            )

            expect(result.current.reasoningResources).toHaveLength(3)
        })
    })

    describe('metadata enrichment', () => {
        it('should call useGetResourcesReasoningMetadata with correct parameters', () => {
            const mockData = mockReasoningData({
                reasoning: [
                    {
                        responseType: ReasoningResponseType.RESPONSE,
                        value: 'Response',
                        targetId: 'response-1',
                    } as any,
                ] as any,
            })
            ;(useGetMessageAiReasoning as jest.Mock).mockReturnValue({
                data: mockData,
                refetch: jest.fn(),
            })
            ;(parseReasoningResources as jest.Mock).mockReturnValueOnce([
                { resourceId: '1', resourceType: 'ARTICLE' },
            ])

            renderHook(
                () =>
                    useAiAgentReasoning({
                        objectId: '123',
                        objectType: 'TICKET',
                        messageId: '456',
                        enabled: true,
                    }),
                { wrapper },
            )

            expect(useGetResourcesReasoningMetadata).toHaveBeenCalledWith({
                queriesEnabled: true,
                resources: [
                    { resourceId: '1', resourceType: 'ARTICLE' },
                ] as any,
                storeConfiguration: mockData.storeConfiguration,
            })
        })

        it('should pass enabled flag to metadata enrichment', () => {
            const mockData = mockReasoningData()
            ;(useGetMessageAiReasoning as jest.Mock).mockReturnValue({
                data: mockData,
                refetch: jest.fn(),
            })

            renderHook(
                () =>
                    useAiAgentReasoning({
                        objectId: '123',
                        objectType: 'TICKET',
                        messageId: '456',
                        enabled: false,
                    }),
                { wrapper },
            )

            expect(useGetResourcesReasoningMetadata).toHaveBeenCalledWith(
                expect.objectContaining({
                    queriesEnabled: false,
                }),
            )
        })

        it('should filter out null resources before passing to metadata enrichment', () => {
            const mockData = mockReasoningData({
                reasoning: [
                    {
                        responseType: ReasoningResponseType.RESPONSE,
                        value: 'Response',
                        targetId: 'response-1',
                    } as any,
                ] as any,
            })
            ;(useGetMessageAiReasoning as jest.Mock).mockReturnValue({
                data: mockData,
                refetch: jest.fn(),
            })
            ;(parseReasoningResources as jest.Mock).mockReturnValueOnce([
                { resourceId: '1' },
                null,
                { resourceId: '2' },
            ])

            renderHook(
                () =>
                    useAiAgentReasoning({
                        objectId: '123',
                        objectType: 'TICKET',
                        messageId: '456',
                    }),
                { wrapper },
            )

            expect(useGetResourcesReasoningMetadata).toHaveBeenCalledWith(
                expect.objectContaining({
                    resources: [
                        { resourceId: '1' },
                        { resourceId: '2' },
                    ] as any,
                }),
            )
        })

        it('should return metadata from enrichment hook', () => {
            const mockData = mockReasoningData()
            const mockMetadata = {
                isLoading: false,
                data: [
                    {
                        id: '1',
                        title: 'Article Title',
                        url: '/article/1',
                    } as any,
                ] as any,
            }
            ;(useGetMessageAiReasoning as jest.Mock).mockReturnValue({
                data: mockData,
                refetch: jest.fn(),
            })
            ;(useGetResourcesReasoningMetadata as jest.Mock).mockReturnValue(
                mockMetadata,
            )

            const { result } = renderHook(
                () =>
                    useAiAgentReasoning({
                        objectId: '123',
                        objectType: 'TICKET',
                        messageId: '456',
                    }),
                { wrapper },
            )

            expect(result.current.reasoningMetadata).toEqual(mockMetadata)
        })
    })

    describe('V3 (Evoli) support', () => {
        it('should render response reasoning without Full details section for V3', () => {
            const mockData = mockReasoningData({
                reasoning: [
                    {
                        responseType: ReasoningResponseType.RESPONSE,
                        value: 'V3 response content',
                        targetId: 'response-1',
                    } as any,
                ] as any,
                usedTasks: [] as any,
            })
            ;(useGetMessageAiReasoning as jest.Mock).mockReturnValue({
                data: mockData,
                refetch: jest.fn(),
            })

            const { result } = renderHook(
                () =>
                    useAiAgentReasoning({
                        objectId: '123',
                        objectType: 'TICKET',
                        messageId: '456',
                    }),
                { wrapper },
            )

            expect(result.current.reasoningContent).toContain(
                'V3 response content',
            )
            expect(result.current.reasoningContent).not.toContain(
                'fullDetailsContainer',
            )
            expect(result.current.reasoningContent).not.toContain(
                'Full details:',
            )
        })

        it('should pass all resources to response reasoning when resources have empty taskIds', () => {
            const resources = [
                {
                    resourceId: '1',
                    resourceType: 'ARTICLE',
                    taskIds: [] as any,
                } as any,
                {
                    resourceId: '2',
                    resourceType: 'GUIDANCE',
                    taskIds: [] as any,
                } as any,
            ]
            const mockData = mockReasoningData({
                reasoning: [
                    {
                        responseType: ReasoningResponseType.RESPONSE,
                        value: 'V3 response',
                        targetId: 'response-1',
                    } as any,
                ] as any,
                resources: resources as any,
                usedTasks: [] as any,
            })
            ;(useGetMessageAiReasoning as jest.Mock).mockReturnValue({
                data: mockData,
                refetch: jest.fn(),
            })

            renderHook(
                () =>
                    useAiAgentReasoning({
                        objectId: '123',
                        objectType: 'TICKET',
                        messageId: '456',
                    }),
                { wrapper },
            )

            expect(parseReasoningResources).toHaveBeenCalledWith(
                'V3 response',
                resources,
            )
        })

        it('should not crash when resources have null or undefined taskIds', () => {
            const mockData = mockReasoningData({
                reasoning: [
                    {
                        responseType: ReasoningResponseType.TASK,
                        value: 'Task reasoning',
                        targetId: 'task-1',
                    } as any,
                ] as any,
                resources: [
                    {
                        resourceId: '1',
                        resourceType: 'ARTICLE',
                        taskIds: null as any,
                    } as any,
                    {
                        resourceId: '2',
                        resourceType: 'GUIDANCE',
                        taskIds: undefined as any,
                    } as any,
                ] as any,
                usedTasks: ['task-1'] as any,
            })
            ;(useGetMessageAiReasoning as jest.Mock).mockReturnValue({
                data: mockData,
                refetch: jest.fn(),
            })

            expect(() =>
                renderHook(
                    () =>
                        useAiAgentReasoning({
                            objectId: '123',
                            objectType: 'TICKET',
                            messageId: '456',
                        }),
                    { wrapper },
                ),
            ).not.toThrow()
        })
    })

    describe('refetch functionality', () => {
        it('should expose refetch function from useGetMessageAiReasoning', () => {
            const mockRefetch = jest.fn()
            ;(useGetMessageAiReasoning as jest.Mock).mockReturnValue({
                data: mockReasoningData(),
                refetch: mockRefetch,
            })

            const { result } = renderHook(
                () =>
                    useAiAgentReasoning({
                        objectId: '123',
                        objectType: 'TICKET',
                        messageId: '456',
                    }),
                { wrapper },
            )

            result.current.refetch()

            expect(mockRefetch).toHaveBeenCalled()
        })
    })

    describe('edge cases', () => {
        it('should handle reasoning with only empty values', () => {
            const mockData = mockReasoningData({
                reasoning: [
                    {
                        responseType: ReasoningResponseType.RESPONSE,
                        value: '',
                        targetId: 'response-1',
                    } as any,
                    {
                        responseType: ReasoningResponseType.OUTCOME,
                        value: '',
                        targetId: 'outcome-1',
                    } as any,
                ] as any,
                execution: {
                    endDatetime: '2024-01-01T00:00:00Z',
                } as any,
            })
            ;(useGetMessageAiReasoning as jest.Mock).mockReturnValue({
                data: mockData,
                refetch: jest.fn(),
            })

            const { result } = renderHook(
                () =>
                    useAiAgentReasoning({
                        objectId: '123',
                        objectType: 'TICKET',
                        messageId: '456',
                    }),
                { wrapper },
            )

            expect(result.current.staticMessage).toBe(
                'Reasoning unavailable for this message.',
            )
        })

        it('should handle newline escaping in task values', () => {
            const mockData = mockReasoningData({
                reasoning: [
                    {
                        responseType: ReasoningResponseType.TASK,
                        value: 'Line 1\\nLine 2\\nLine 3',
                        targetId: 'task-1',
                    } as any,
                ] as any,
                usedTasks: ['task-1'] as any,
            })
            ;(useGetMessageAiReasoning as jest.Mock).mockReturnValue({
                data: mockData,
                refetch: jest.fn(),
            })

            const { result } = renderHook(
                () =>
                    useAiAgentReasoning({
                        objectId: '123',
                        objectType: 'TICKET',
                        messageId: '456',
                    }),
                { wrapper },
            )

            expect(result.current.reasoningContent).toContain(
                'Line 1\n\nLine 2',
            )
            expect(result.current.reasoningContent).toContain(
                'Line 2\n\nLine 3',
            )
        })

        it('should handle undefined reasoning', () => {
            const mockData = {
                ...mockReasoningData(),
                reasoning: undefined,
            }
            ;(useGetMessageAiReasoning as jest.Mock).mockReturnValue({
                data: mockData,
                refetch: jest.fn(),
            })

            const { result } = renderHook(
                () =>
                    useAiAgentReasoning({
                        objectId: '123',
                        objectType: 'TICKET',
                        messageId: '456',
                    }),
                { wrapper },
            )

            expect(result.current.reasoningContent).toBe(null)
            expect(result.current.staticMessage).toBe(
                "Couldn't load reasoning. Please try again.",
            )
        })

        it('should handle missing execution object', () => {
            const mockData = mockReasoningData({
                reasoning: [] as any,
                execution: null,
            })
            ;(useGetMessageAiReasoning as jest.Mock).mockReturnValue({
                data: mockData,
                refetch: jest.fn(),
            })

            const { result } = renderHook(
                () =>
                    useAiAgentReasoning({
                        objectId: '123',
                        objectType: 'TICKET',
                        messageId: '456',
                    }),
                { wrapper },
            )

            expect(result.current.staticMessage).toBeUndefined()
            expect(result.current.reasoningContent).toBe('')
        })
    })
})
