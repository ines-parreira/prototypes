import '@testing-library/jest-dom'

import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { PlaygroundInitialContent } from './PlaygroundInitialContent'

const mockUseCoreContext = {
    useCoreContext: jest.fn(),
}

jest.mock('pages/aiAgent/PlaygroundV2/contexts/CoreContext', () => ({
    useCoreContext: () => mockUseCoreContext.useCoreContext(),
}))

jest.mock(
    'pages/aiAgent/PlaygroundV2/components/LoadingDraftKnowledge/LoadingDraftKnowledge',
    () => ({
        LoadingDraftKnowledge: ({ title, subtitle }: any) => (
            <div role="status" aria-live="polite">
                <div data-testid="loading-title">{title}</div>
                <div data-testid="loading-subtitle">{subtitle}</div>
            </div>
        ),
    }),
)

describe('PlaygroundInitialContent', () => {
    beforeEach(() => {
        mockUseCoreContext.useCoreContext.mockReturnValue({
            areActionsEnabled: false,
            isDraftKnowledgeReady: true,
        })
    })

    describe('Rendering', () => {
        it('should render with correct title', () => {
            render(<PlaygroundInitialContent />)

            expect(
                screen.getByText('Preview shopper experience'),
            ).toBeInTheDocument()
        })

        it('should render with correct description when actions are disabled', () => {
            mockUseCoreContext.useCoreContext.mockReturnValue({
                areActionsEnabled: false,
                isDraftKnowledgeReady: true,
            })

            render(<PlaygroundInitialContent />)

            expect(
                screen.getByText(
                    /AI Agent will use your stores' resources and order history to respond/i,
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    /Preview conversations won't send messages or take any real actions/i,
                ),
            ).toBeInTheDocument()
        })

        it('should render with correct description when actions are enabled', () => {
            mockUseCoreContext.useCoreContext.mockReturnValue({
                areActionsEnabled: true,
                isDraftKnowledgeReady: true,
            })

            render(<PlaygroundInitialContent />)

            expect(
                screen.getByText(
                    /AI Agent will use your stores' resources and order history to respond/i,
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    /Preview conversations won't send messages, but the actions will affect real customer data/i,
                ),
            ).toBeInTheDocument()
        })

        it('should render AI icon', () => {
            const { container } = render(<PlaygroundInitialContent />)

            const iconContainer = container.querySelector('[class*="icon"]')
            expect(iconContainer).toBeInTheDocument()
        })
    })

    describe('With Button (Outbound Mode)', () => {
        const mockOnStartClick = jest.fn()

        beforeEach(() => {
            jest.clearAllMocks()
        })

        it('should render button when onStartClick is provided', () => {
            render(<PlaygroundInitialContent onStartClick={mockOnStartClick} />)

            const button = screen.getByRole('button', {
                name: /start conversation/i,
            })
            expect(button).toBeInTheDocument()
        })

        it('should call onStartClick when button is clicked', async () => {
            const user = userEvent.setup()
            render(<PlaygroundInitialContent onStartClick={mockOnStartClick} />)

            const button = screen.getByRole('button', {
                name: /start conversation/i,
            })
            await act(() => user.click(button))

            expect(mockOnStartClick).toHaveBeenCalledTimes(1)
        })

        it('should not show loading state by default', () => {
            render(<PlaygroundInitialContent onStartClick={mockOnStartClick} />)

            const button = screen.getByRole('button', {
                name: /start conversation/i,
            })
            expect(button).not.toHaveAttribute('aria-busy', 'true')
        })

        it('should be disabled when isLoading is true', () => {
            render(
                <PlaygroundInitialContent
                    onStartClick={mockOnStartClick}
                    isLoading={true}
                />,
            )

            const button = screen.getByRole('button', {
                name: /start conversation/i,
            })
            expect(button).toBeDisabled()
        })
    })

    describe('Without Button (Inbound Mode)', () => {
        it('should not render button when onStartClick is not provided', () => {
            render(<PlaygroundInitialContent />)

            const buttons = screen.queryAllByRole('button')
            expect(buttons).toHaveLength(0)
        })

        it('should still render icon and text without button', () => {
            const { container } = render(<PlaygroundInitialContent />)

            expect(
                screen.getByText('Preview shopper experience'),
            ).toBeInTheDocument()
            const iconContainer = container.querySelector('[class*="icon"]')
            expect(iconContainer).toBeInTheDocument()
        })
    })

    describe('Draft Knowledge Readiness', () => {
        it('should render LoadingDraftKnowledge when draft knowledge is not ready', () => {
            mockUseCoreContext.useCoreContext.mockReturnValue({
                areActionsEnabled: false,
                isDraftKnowledgeReady: false,
            })

            render(<PlaygroundInitialContent />)

            expect(screen.getByRole('status')).toBeInTheDocument()
            expect(screen.getByTestId('loading-title')).toHaveTextContent(
                'Syncing draft...',
            )
            expect(screen.getByTestId('loading-subtitle')).toHaveTextContent(
                'Syncing your latest updates for testing',
            )
        })

        it('should not render regular content when draft knowledge is not ready', () => {
            mockUseCoreContext.useCoreContext.mockReturnValue({
                areActionsEnabled: false,
                isDraftKnowledgeReady: false,
            })

            render(<PlaygroundInitialContent />)

            expect(
                screen.queryByText('Preview shopper experience'),
            ).not.toBeInTheDocument()
        })

        it('should render preview content when draft knowledge is ready', () => {
            mockUseCoreContext.useCoreContext.mockReturnValue({
                areActionsEnabled: false,
                isDraftKnowledgeReady: true,
            })

            render(<PlaygroundInitialContent />)

            expect(
                screen.getByText('Preview shopper experience'),
            ).toBeInTheDocument()
            expect(screen.queryByRole('status')).not.toBeInTheDocument()
        })
    })
})
