import '@testing-library/jest-dom'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS, Map } from 'immutable'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import {
    mockAiReasoning,
    mockFindAiReasoningAiReasoningHandler,
} from '@gorgias/knowledge-service-mocks'

import { user } from 'fixtures/users'
import { AiAgentKnowledgeResourceTypeEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { isSessionImpersonated } from 'services/activityTracker/utils'

import type { PlaygroundReasoningStatelessProps } from './PlaygroundReasoning'
import {
    PlaygroundReasoning,
    PlaygroundReasoningStateless,
} from './PlaygroundReasoning'

jest.mock('services/activityTracker/utils', () => ({
    isSessionImpersonated: jest.fn(() => false),
}))

jest.mock('../../contexts/CoreContext', () => ({
    useCoreContext: jest.fn(() => ({ useV3: false })),
}))

const mockUseCoreContext = jest.requireMock('../../contexts/CoreContext')
    .useCoreContext as jest.MockedFunction<() => { useV3: boolean }>

const mockIsSessionImpersonated = isSessionImpersonated as jest.MockedFunction<
    typeof isSessionImpersonated
>

const mockStore = configureMockStore()
const defaultState = {
    currentUser: Map(user),
    integrations: fromJS({
        integrations: [],
    }),
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
})

const mockOnToggle = jest.fn()
const mockOnRetry = jest.fn()
const mockOnOpenPreview = jest.fn()

const defaultProps: PlaygroundReasoningStatelessProps = {
    status: 'collapsed',
    reasoningContent: 'Sample reasoning content',
    reasoningResources: [],
    reasoningMetadata: undefined,
    staticMessage: undefined,
    storeConfiguration: {
        shopName: 'Test Shop',
        shopType: 'shopify',
    },
    onToggle: mockOnToggle,
    onRetry: mockOnRetry,
    onOpenPreview: mockOnOpenPreview,
}

const renderComponent = (
    props: Partial<PlaygroundReasoningStatelessProps> = {},
) => {
    return render(
        <Provider store={mockStore(defaultState)}>
            <QueryClientProvider client={queryClient}>
                <PlaygroundReasoningStateless {...defaultProps} {...props} />
            </QueryClientProvider>
        </Provider>,
    )
}

describe('PlaygroundReasoning', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseCoreContext.mockReturnValue({ useV3: false })
    })

    describe('V3 mode', () => {
        it('should render "Reasoning not yet available for V3" when useV3 is true', () => {
            mockUseCoreContext.mockReturnValue({ useV3: true })
            renderComponent({ status: 'collapsed' })

            expect(
                screen.getByText('Reasoning not yet available for V3'),
            ).toBeInTheDocument()
        })

        it('should not render toggle button when useV3 is true', () => {
            mockUseCoreContext.mockReturnValue({ useV3: true })
            renderComponent({ status: 'collapsed' })

            expect(
                screen.queryByRole('button', { name: 'Show reasoning' }),
            ).not.toBeInTheDocument()
        })

        it('should not render "Reasoning not yet available for V3" when useV3 is false', () => {
            mockUseCoreContext.mockReturnValue({ useV3: false })
            renderComponent({ status: 'collapsed' })

            expect(
                screen.queryByText('Reasoning not yet available for V3'),
            ).not.toBeInTheDocument()
            expect(screen.getByText('Show reasoning')).toBeInTheDocument()
        })
    })

    describe('Status Behavior', () => {
        describe('Loading state', () => {
            it('should render loading text with shimmer animation', () => {
                renderComponent({ status: 'loading' })

                expect(
                    screen.getByText('Generating reasoning...'),
                ).toBeInTheDocument()
            })

            it('should have aria-live="polite" on loading text', () => {
                renderComponent({ status: 'loading' })

                const loadingText = screen.getByText('Generating reasoning...')
                expect(loadingText).toHaveAttribute('aria-live', 'polite')
            })

            it('should have aria-busy="true" on container', () => {
                const { container } = renderComponent({ status: 'loading' })

                const mainContainer =
                    container.querySelector('[aria-busy="true"]')
                expect(mainContainer).toBeInTheDocument()
            })
        })

        describe('Error state', () => {
            it('should render error message with retry button', () => {
                renderComponent({ status: 'error' })

                expect(
                    screen.getByText(/Couldn't load reasoning/),
                ).toBeInTheDocument()
                expect(screen.getByText('Try again')).toBeInTheDocument()
            })

            it('should call onRetry when "Try again" is clicked', async () => {
                renderComponent({ status: 'error' })

                const retryButton = screen.getByText('Try again')
                await userEvent.click(retryButton)

                expect(mockOnRetry).toHaveBeenCalledTimes(1)
            })
        })

        describe('Collapsed state', () => {
            it('should render "Show reasoning" button', () => {
                renderComponent({ status: 'collapsed' })

                expect(screen.getByText('Show reasoning')).toBeInTheDocument()
            })

            it('should render down arrow icon when collapsed', () => {
                renderComponent({ status: 'collapsed' })

                expect(
                    screen.getByText('keyboard_arrow_down'),
                ).toBeInTheDocument()
            })

            it('should have aria-expanded="false" on button', () => {
                renderComponent({ status: 'collapsed' })

                const button = screen.getByRole('button', {
                    name: 'Show reasoning',
                })
                expect(button).toHaveAttribute('aria-expanded', 'false')
            })

            it('should call onToggle when button is clicked', async () => {
                renderComponent({ status: 'collapsed' })

                const button = screen.getByText('Show reasoning')
                await userEvent.click(button)

                expect(mockOnToggle).toHaveBeenCalledTimes(1)
            })
        })

        describe('Expanded state', () => {
            it('should render "Hide reasoning" button', () => {
                renderComponent({ status: 'expanded' })

                expect(screen.getByText('Hide reasoning')).toBeInTheDocument()
            })

            it('should render up arrow icon when expanded', () => {
                renderComponent({ status: 'expanded' })

                expect(
                    screen.getByText('keyboard_arrow_up'),
                ).toBeInTheDocument()
            })

            it('should have aria-expanded="true" on button', () => {
                renderComponent({ status: 'expanded' })

                const button = screen.getByRole('button', {
                    name: 'Hide reasoning',
                })
                expect(button).toHaveAttribute('aria-expanded', 'true')
            })

            it('should call onToggle when button is clicked', async () => {
                renderComponent({ status: 'expanded' })

                const button = screen.getByText('Hide reasoning')
                await userEvent.click(button)

                expect(mockOnToggle).toHaveBeenCalledTimes(1)
            })

            it('should render body content when expanded', () => {
                renderComponent({
                    status: 'expanded',
                    reasoningContent: 'Test reasoning content',
                })

                expect(
                    screen.getByText('Test reasoning content'),
                ).toBeInTheDocument()
            })
        })

        describe('Static state', () => {
            it('should render static message', () => {
                renderComponent({
                    status: 'static',
                    staticMessage: 'AI Agent handed over to your team',
                })

                expect(
                    screen.getByText('AI Agent handed over to your team'),
                ).toBeInTheDocument()
            })

            it('should not render title button when status is static', () => {
                renderComponent({
                    status: 'static',
                    staticMessage: 'Static message',
                })

                expect(screen.queryByRole('button')).not.toBeInTheDocument()
            })
        })

        describe('Body content visibility', () => {
            it.each([
                ['loading', 'loading'],
                ['error', 'error'],
                ['collapsed', 'collapsed'],
            ] as const)(
                'should not render body content when status is %s',
                (_, status) => {
                    renderComponent({
                        status,
                        reasoningContent: 'Test content',
                    })

                    const content = screen.queryByText('Test content')
                    if (status === 'collapsed') {
                        // Content is in DOM for animation but hidden via CSS
                        expect(content).toBeInTheDocument()
                    } else {
                        // For loading and error, content is not rendered
                        expect(content).not.toBeInTheDocument()
                    }
                },
            )
        })
    })

    describe('Props Handling', () => {
        it('should render reasoning content with resources markers', () => {
            renderComponent({
                status: 'expanded',
                reasoningContent:
                    'Based on <<<article::100::13608>>>, I provided information',
                reasoningResources: [
                    {
                        resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                        resourceId: '13608',
                        resourceSetId: '100',
                        resourceTitle: 'Test Article',
                    },
                ],
            })

            // AiAgentReasoningContent processes the <<<...>>> markers
            expect(screen.getByText(/provided information/)).toBeInTheDocument()
        })

        it('should render reasoning content without resources', () => {
            renderComponent({
                status: 'expanded',
                reasoningContent: 'Simple reasoning without resources',
                reasoningResources: [],
            })

            expect(
                screen.getByText('Simple reasoning without resources'),
            ).toBeInTheDocument()
        })

        it('should handle complex reasoning content', () => {
            renderComponent({
                status: 'expanded',
                reasoningContent: `I helped the customer by:

- Checking their order
- Providing tracking information`,
            })

            expect(screen.getByText(/Checking their order/)).toBeInTheDocument()
            expect(
                screen.getByText(/Providing tracking information/),
            ).toBeInTheDocument()
        })
    })

    describe('Keyboard Navigation', () => {
        it('should trigger onToggle when Enter is pressed on collapsed button', async () => {
            renderComponent({ status: 'collapsed' })

            const button = screen.getByRole('button', {
                name: 'Show reasoning',
            })
            button.focus()
            await userEvent.keyboard('{Enter}')

            expect(mockOnToggle).toHaveBeenCalledTimes(1)
        })

        it('should trigger onToggle when Space is pressed on expanded button', async () => {
            renderComponent({ status: 'expanded' })

            const button = screen.getByRole('button', {
                name: 'Hide reasoning',
            })
            button.focus()
            await userEvent.keyboard(' ')

            expect(mockOnToggle).toHaveBeenCalledTimes(1)
        })
    })

    describe('Execution ID Display (Stateless)', () => {
        it('should display execution ID when shouldDisplayExecutionId is true and executionId exists', () => {
            const executionId = 'exec_123abc456def'
            renderComponent({
                status: 'expanded',
                shouldDisplayExecutionId: true,
                storeConfiguration: {
                    shopName: 'Test Shop',
                    shopType: 'shopify',
                    executionId,
                },
            })

            expect(
                screen.getByText(`Execution ID: ${executionId}`),
            ).toBeInTheDocument()
        })

        it('should not display execution ID when shouldDisplayExecutionId is false even if executionId exists', () => {
            const executionId = 'exec_123abc456def'
            renderComponent({
                status: 'expanded',
                shouldDisplayExecutionId: false,
                storeConfiguration: {
                    shopName: 'Test Shop',
                    shopType: 'shopify',
                    executionId,
                },
            })

            expect(
                screen.queryByText(`Execution ID: ${executionId}`),
            ).not.toBeInTheDocument()
        })

        it('should not display execution ID when shouldDisplayExecutionId is true but executionId is undefined', () => {
            renderComponent({
                status: 'expanded',
                shouldDisplayExecutionId: true,
                storeConfiguration: {
                    shopName: 'Test Shop',
                    shopType: 'shopify',
                },
            })

            expect(screen.queryByText(/Execution ID:/)).not.toBeInTheDocument()
        })

        it('should not display execution ID when shouldDisplayExecutionId is true but executionId is null', () => {
            renderComponent({
                status: 'expanded',
                shouldDisplayExecutionId: true,
                storeConfiguration: {
                    shopName: 'Test Shop',
                    shopType: 'shopify',
                    executionId: null as unknown as string,
                },
            })

            expect(screen.queryByText(/Execution ID:/)).not.toBeInTheDocument()
        })

        it('should not display execution ID when shouldDisplayExecutionId is true but executionId is empty string', () => {
            renderComponent({
                status: 'expanded',
                shouldDisplayExecutionId: true,
                storeConfiguration: {
                    shopName: 'Test Shop',
                    shopType: 'shopify',
                    executionId: '',
                },
            })

            expect(screen.queryByText(/Execution ID:/)).not.toBeInTheDocument()
        })
    })
})

describe('PlaygroundReasoning (Connected Component)', () => {
    const server = setupServer()
    let testQueryClient: QueryClient

    const renderConnectedComponent = (
        props: Partial<React.ComponentProps<typeof PlaygroundReasoning>> = {},
    ) => {
        return render(
            <MemoryRouter>
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={testQueryClient}>
                        <PlaygroundReasoning
                            accountId={1}
                            userId={2}
                            testSessionId="test-session-123"
                            messageId="message-456"
                            storeConfiguration={null}
                            {...props}
                        />
                    </QueryClientProvider>
                </Provider>
            </MemoryRouter>,
        )
    }

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'bypass' })
    })

    beforeEach(() => {
        jest.clearAllMocks()
        testQueryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        })
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    describe('Loading and Data Fetching', () => {
        it('should start in loading state and transition to collapsed when data loads', async () => {
            const mockReasoning = mockFindAiReasoningAiReasoningHandler(
                async () => {
                    const baseReasoning = mockAiReasoning()
                    return HttpResponse.json({
                        ...baseReasoning,
                        reasoning: [
                            {
                                ...baseReasoning.reasoning[0],
                                responseType: 'RESPONSE',
                                targetId: 'test',
                                value: 'Test reasoning content',
                            },
                        ],
                        resources: [],
                    })
                },
            )

            server.use(mockReasoning.handler)

            renderConnectedComponent()

            expect(
                screen.getByText('Generating reasoning...'),
            ).toBeInTheDocument()

            await waitFor(() => {
                expect(screen.getByText('Show reasoning')).toBeInTheDocument()
            })

            expect(
                screen.queryByText('Generating reasoning...'),
            ).not.toBeInTheDocument()
        })

        it('should continue polling when reasoning content is empty', async () => {
            let callCount = 0
            const mockReasoning = mockFindAiReasoningAiReasoningHandler(
                async () => {
                    callCount++
                    const baseReasoning = mockAiReasoning()
                    if (callCount < 3) {
                        return HttpResponse.json({
                            ...baseReasoning,
                            reasoning: [],
                            resources: [],
                        })
                    }
                    return HttpResponse.json({
                        ...baseReasoning,
                        reasoning: [
                            {
                                ...baseReasoning.reasoning[0],
                                responseType: 'RESPONSE',
                                targetId: 'test',
                                value: 'Loaded content',
                            },
                        ],
                        resources: [],
                    })
                },
            )

            server.use(mockReasoning.handler)

            renderConnectedComponent()

            expect(
                screen.getByText('Generating reasoning...'),
            ).toBeInTheDocument()

            await waitFor(
                () => {
                    expect(
                        screen.getByText('Show reasoning'),
                    ).toBeInTheDocument()
                },
                { timeout: 10000 },
            )

            expect(callCount).toBeGreaterThanOrEqual(3)
        })
    })

    describe('Expand/Collapse Behavior', () => {
        it('should allow expanding and collapsing reasoning content', async () => {
            const baseReasoning = mockAiReasoning()
            const mockReasoning = mockFindAiReasoningAiReasoningHandler(
                async () => {
                    return HttpResponse.json({
                        ...baseReasoning,
                        reasoning: [
                            {
                                ...baseReasoning.reasoning[0],
                                responseType: 'RESPONSE',
                                targetId: 'test',
                                value: 'Test content',
                            },
                        ],
                        resources: [],
                    })
                },
            )

            server.use(mockReasoning.handler)

            renderConnectedComponent()

            await waitFor(() => {
                expect(screen.getByText('Show reasoning')).toBeInTheDocument()
            })

            const showButton = screen.getByText('Show reasoning')
            await act(async () => {
                await userEvent.click(showButton)
            })

            await waitFor(() => {
                expect(screen.getByText('Hide reasoning')).toBeInTheDocument()
            })

            expect(screen.getByText('Test content')).toBeInTheDocument()

            const hideButton = screen.getByText('Hide reasoning')
            await act(async () => {
                await userEvent.click(hideButton)
            })

            await waitFor(() => {
                expect(screen.getByText('Show reasoning')).toBeInTheDocument()
            })

            // Content remains in DOM for animation but is hidden
            expect(screen.getByText('Test content')).toBeInTheDocument()
        })
    })

    describe('Execution ID Display', () => {
        it('should display execution ID when session is impersonated and executionId exists', async () => {
            mockIsSessionImpersonated.mockReturnValue(true)

            const baseReasoning = mockAiReasoning()
            const mockReasoning = mockFindAiReasoningAiReasoningHandler(
                async () => {
                    return HttpResponse.json({
                        ...baseReasoning,
                        reasoning: [
                            {
                                ...baseReasoning.reasoning[0],
                                responseType: 'RESPONSE',
                                targetId: 'test',
                                value: 'Test content',
                            },
                        ],
                        resources: [],
                    })
                },
            )

            server.use(mockReasoning.handler)

            const executionId = 'exec_123abc456def'
            renderConnectedComponent({
                storeConfiguration: {
                    shopName: 'Test Shop',
                    shopType: 'shopify',
                    executionId,
                },
            })

            await waitFor(() => {
                expect(screen.getByText('Show reasoning')).toBeInTheDocument()
            })

            expect(
                screen.getByText(`Execution ID: ${executionId}`),
            ).toBeInTheDocument()

            mockIsSessionImpersonated.mockReturnValue(false)
        })

        it('should not display execution ID when session is not impersonated', async () => {
            mockIsSessionImpersonated.mockReturnValue(false)

            const baseReasoning = mockAiReasoning()
            const mockReasoning = mockFindAiReasoningAiReasoningHandler(
                async () => {
                    return HttpResponse.json({
                        ...baseReasoning,
                        reasoning: [
                            {
                                ...baseReasoning.reasoning[0],
                                responseType: 'RESPONSE',
                                targetId: 'test',
                                value: 'Test content',
                            },
                        ],
                        resources: [],
                    })
                },
            )

            server.use(mockReasoning.handler)

            const executionId = 'exec_123abc456def'
            renderConnectedComponent({
                storeConfiguration: {
                    shopName: 'Test Shop',
                    shopType: 'shopify',
                    executionId,
                },
            })

            await waitFor(() => {
                expect(screen.getByText('Show reasoning')).toBeInTheDocument()
            })

            expect(
                screen.queryByText(`Execution ID: ${executionId}`),
            ).not.toBeInTheDocument()
        })

        it('should not display execution ID when executionId is not provided', async () => {
            mockIsSessionImpersonated.mockReturnValue(true)

            const baseReasoning = mockAiReasoning()
            const mockReasoning = mockFindAiReasoningAiReasoningHandler(
                async () => {
                    return HttpResponse.json({
                        ...baseReasoning,
                        reasoning: [
                            {
                                ...baseReasoning.reasoning[0],
                                responseType: 'RESPONSE',
                                targetId: 'test',
                                value: 'Test content',
                            },
                        ],
                        resources: [],
                    })
                },
            )

            server.use(mockReasoning.handler)

            renderConnectedComponent({
                storeConfiguration: {
                    shopName: 'Test Shop',
                    shopType: 'shopify',
                },
            })

            await waitFor(() => {
                expect(screen.getByText('Show reasoning')).toBeInTheDocument()
            })

            expect(screen.queryByText(/Execution ID:/)).not.toBeInTheDocument()

            mockIsSessionImpersonated.mockReturnValue(false)
        })
    })
})
