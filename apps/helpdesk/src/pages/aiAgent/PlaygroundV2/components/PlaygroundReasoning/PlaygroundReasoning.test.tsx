import '@testing-library/jest-dom'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { user } from 'fixtures/users'
import { AiAgentKnowledgeResourceTypeEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

import {
    PlaygroundReasoning,
    PlaygroundReasoningProps,
} from './PlaygroundReasoning'

const mockStore = configureMockStore()
const defaultState = {
    currentUser: Map(user),
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

const defaultProps: PlaygroundReasoningProps = {
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

const renderComponent = (props: Partial<PlaygroundReasoningProps> = {}) => {
    return render(
        <Provider store={mockStore(defaultState)}>
            <QueryClientProvider client={queryClient}>
                <PlaygroundReasoning {...defaultProps} {...props} />
            </QueryClientProvider>
        </Provider>,
    )
}

describe('PlaygroundReasoning', () => {
    beforeEach(() => {
        jest.clearAllMocks()
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

            it('should not render body content when loading', () => {
                renderComponent({
                    status: 'loading',
                    reasoningContent: 'Test content',
                })

                expect(
                    screen.queryByText('Test content'),
                ).not.toBeInTheDocument()
            })
        })

        describe('Error state', () => {
            it('should render error message', () => {
                renderComponent({ status: 'error' })

                expect(
                    screen.getByText(/Couldn't load reasoning/),
                ).toBeInTheDocument()
            })

            it('should render "Try again" button', () => {
                renderComponent({ status: 'error' })

                expect(screen.getByText('Try again')).toBeInTheDocument()
            })

            it('should call onRetry when "Try again" is clicked', async () => {
                renderComponent({ status: 'error' })

                const retryButton = screen.getByText('Try again')
                await userEvent.click(retryButton)

                expect(mockOnRetry).toHaveBeenCalledTimes(1)
            })

            it('should not render body content when in error state', () => {
                renderComponent({
                    status: 'error',
                    reasoningContent: 'Test content',
                })

                expect(
                    screen.queryByText('Test content'),
                ).not.toBeInTheDocument()
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

            it('should not render body content when collapsed', () => {
                renderComponent({
                    status: 'collapsed',
                    reasoningContent: 'Test content',
                })

                expect(
                    screen.queryByText('Test content'),
                ).not.toBeInTheDocument()
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

            it('should pass reasoning content to AiAgentReasoningContent', () => {
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

            it('should render static message in body', () => {
                renderComponent({
                    status: 'static',
                    staticMessage: 'Test static message',
                })

                expect(
                    screen.getByText('Test static message'),
                ).toBeInTheDocument()
            })
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
})
