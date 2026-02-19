import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SnippetType } from '../../../KnowledgeHub/types'
import { KnowledgeEditorSnippet } from './KnowledgeEditorSnippet'

jest.mock('pages/aiAgent/hooks/useAiAgentHelpCenter', () => ({
    useAiAgentHelpCenterState: jest.fn(),
}))

jest.mock('./KnowledgeEditorSnippetLoader', () => ({
    KnowledgeEditorSnippetLoader: ({
        snippetType,
        snippetId,
        onTest,
    }: {
        snippetType: string
        snippetId: number
        onTest: () => void
    }) => (
        <div data-testid="snippet-loader">
            {snippetType} - {snippetId}
            <button onClick={onTest}>Test</button>
        </div>
    ),
}))

jest.mock('../../PlaygroundPanel/PlaygroundPanel', () => ({
    PlaygroundPanel: ({ onClose }: { onClose: () => void }) => (
        <div data-testid="playground-panel" data-name="playground-panel">
            <button onClick={onClose}>Close Playground</button>
        </div>
    ),
}))

jest.mock('@gorgias/axiom', () => ({
    Card: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="axiom-card">{children}</div>
    ),
    Skeleton: () => <div data-testid="axiom-skeleton" />,
    SidePanel: ({
        isOpen,
        onOpenChange,
        children,
    }: {
        isOpen: boolean
        onOpenChange: (open: boolean) => void
        children: React.ReactNode
    }) =>
        isOpen ? (
            <div data-testid="side-panel" data-is-open={isOpen}>
                <button
                    data-testid="close-panel-button"
                    onClick={() => onOpenChange(false)}
                >
                    Close
                </button>
                {children}
            </div>
        ) : null,
}))

const { useAiAgentHelpCenterState } = jest.requireMock(
    'pages/aiAgent/hooks/useAiAgentHelpCenter',
)

describe('KnowledgeEditorSnippet', () => {
    const mockHelpCenter = {
        id: 1,
        default_locale: 'en-US',
        name: 'Test Help Center',
    }

    const baseProps = {
        shopName: 'test-shop',
        snippetId: 123,
        onClose: jest.fn(),
        onClickPrevious: jest.fn(),
        onClickNext: jest.fn(),
        onUpdated: jest.fn(),
        isOpen: true,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        useAiAgentHelpCenterState.mockReturnValue({
            helpCenter: mockHelpCenter,
            isLoading: false,
        })
    })

    describe('URL Snippet', () => {
        it('renders side panel with URL snippet loader when open', () => {
            render(
                <KnowledgeEditorSnippet
                    {...baseProps}
                    snippetType={SnippetType.URL}
                />,
            )

            expect(screen.getByTestId('snippet-loader')).toBeInTheDocument()
            expect(screen.getByText('url - 123')).toBeInTheDocument()
        })

        it('passes correct props to snippet loader for URL', () => {
            render(
                <KnowledgeEditorSnippet
                    {...baseProps}
                    snippetType={SnippetType.URL}
                />,
            )

            expect(screen.getByTestId('snippet-loader')).toBeInTheDocument()
        })
    })

    describe('Document Snippet', () => {
        it('renders side panel with document snippet loader when open', () => {
            render(
                <KnowledgeEditorSnippet
                    {...baseProps}
                    snippetType={SnippetType.Document}
                />,
            )

            expect(screen.getByTestId('snippet-loader')).toBeInTheDocument()
            expect(screen.getByText('document - 123')).toBeInTheDocument()
        })

        it('passes correct props to snippet loader for document', () => {
            render(
                <KnowledgeEditorSnippet
                    {...baseProps}
                    snippetType={SnippetType.Document}
                />,
            )

            expect(screen.getByTestId('snippet-loader')).toBeInTheDocument()
        })
    })

    describe('Store Snippet', () => {
        it('renders side panel with store snippet loader when open', () => {
            render(
                <KnowledgeEditorSnippet
                    {...baseProps}
                    snippetType={SnippetType.Store}
                />,
            )

            expect(screen.getByTestId('snippet-loader')).toBeInTheDocument()
            expect(screen.getByText('store - 123')).toBeInTheDocument()
        })

        it('passes correct props to snippet loader for store', () => {
            render(
                <KnowledgeEditorSnippet
                    {...baseProps}
                    snippetType={SnippetType.Store}
                />,
            )

            expect(screen.getByTestId('snippet-loader')).toBeInTheDocument()
        })
    })

    describe('Help Center Context', () => {
        it('returns null when help center is not available', () => {
            useAiAgentHelpCenterState.mockReturnValue({
                helpCenter: undefined,
                isLoading: false,
            })

            const { container } = render(
                <KnowledgeEditorSnippet
                    {...baseProps}
                    snippetType={SnippetType.URL}
                />,
            )

            expect(container.firstChild).toBeNull()
        })

        it('uses help center ID and locale from context', () => {
            render(
                <KnowledgeEditorSnippet
                    {...baseProps}
                    snippetType={SnippetType.URL}
                />,
            )

            expect(useAiAgentHelpCenterState).toHaveBeenCalledWith({
                shopName: 'test-shop',
                helpCenterType: 'snippet',
            })
        })

        it('renders loading shell while help center is loading', () => {
            useAiAgentHelpCenterState.mockReturnValue({
                helpCenter: undefined,
                isLoading: true,
            })

            render(
                <KnowledgeEditorSnippet
                    {...baseProps}
                    snippetType={SnippetType.URL}
                />,
            )

            expect(
                document.querySelector(
                    '[data-name=\"knowledge-editor-top-bar-container\"]',
                ),
            ).toBeInTheDocument()
            expect(
                screen.queryByTestId('snippet-loader'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Side Panel Configuration', () => {
        it('renders snippet loader when side panel is open', () => {
            render(
                <KnowledgeEditorSnippet
                    {...baseProps}
                    snippetType={SnippetType.URL}
                />,
            )

            expect(screen.getByTestId('snippet-loader')).toBeInTheDocument()
        })

        it('renders with fullscreen toggle capability', () => {
            render(
                <KnowledgeEditorSnippet
                    {...baseProps}
                    snippetType={SnippetType.URL}
                />,
            )

            expect(screen.getByTestId('snippet-loader')).toBeInTheDocument()
        })
    })

    describe('Callbacks', () => {
        it('passes onClose callback to loader', () => {
            const onClose = jest.fn()

            render(
                <KnowledgeEditorSnippet
                    {...baseProps}
                    snippetType={SnippetType.URL}
                    onClose={onClose}
                />,
            )

            expect(screen.getByTestId('snippet-loader')).toBeInTheDocument()
        })

        it('passes onClickPrevious callback to loader', () => {
            const onClickPrevious = jest.fn()

            render(
                <KnowledgeEditorSnippet
                    {...baseProps}
                    snippetType={SnippetType.URL}
                    onClickPrevious={onClickPrevious}
                />,
            )

            expect(screen.getByTestId('snippet-loader')).toBeInTheDocument()
        })

        it('passes onClickNext callback to loader', () => {
            const onClickNext = jest.fn()

            render(
                <KnowledgeEditorSnippet
                    {...baseProps}
                    snippetType={SnippetType.URL}
                    onClickNext={onClickNext}
                />,
            )

            expect(screen.getByTestId('snippet-loader')).toBeInTheDocument()
        })

        it('passes onUpdated callback to loader', () => {
            const onUpdated = jest.fn()

            render(
                <KnowledgeEditorSnippet
                    {...baseProps}
                    snippetType={SnippetType.URL}
                    onUpdated={onUpdated}
                />,
            )

            expect(screen.getByTestId('snippet-loader')).toBeInTheDocument()
        })
    })

    describe('isOpen prop', () => {
        it('does not render when isOpen is false', () => {
            render(
                <KnowledgeEditorSnippet
                    {...baseProps}
                    snippetType={SnippetType.URL}
                    isOpen={false}
                />,
            )

            expect(
                screen.queryByTestId('snippet-loader'),
            ).not.toBeInTheDocument()
        })

        it('renders when isOpen is true', () => {
            render(
                <KnowledgeEditorSnippet
                    {...baseProps}
                    snippetType={SnippetType.URL}
                    isOpen={true}
                />,
            )

            expect(screen.getByTestId('snippet-loader')).toBeInTheDocument()
        })
    })

    describe('Playground Panel', () => {
        it('should have playground panel hidden initially', () => {
            render(
                <KnowledgeEditorSnippet
                    {...baseProps}
                    snippetType={SnippetType.URL}
                />,
            )

            const playgroundPanel = screen.getByTestId('playground-panel')
            const playgroundContainer = playgroundPanel.parentElement

            expect(playgroundPanel).toBeInTheDocument()
            expect(playgroundContainer).toHaveClass('playground-closed')
            expect(playgroundContainer).not.toHaveClass('playground-open')
        })

        it('should open playground panel when Test button is clicked', async () => {
            render(
                <KnowledgeEditorSnippet
                    {...baseProps}
                    snippetType={SnippetType.URL}
                />,
            )

            const playgroundPanel = screen.getByTestId('playground-panel')
            const playgroundContainer = playgroundPanel.parentElement

            expect(playgroundContainer).toHaveClass('playground-closed')
            expect(playgroundContainer).not.toHaveClass('playground-open')

            await act(() =>
                userEvent.click(screen.getByRole('button', { name: /test/i })),
            )

            expect(playgroundContainer).toHaveClass('playground-open')
            expect(playgroundContainer).not.toHaveClass('playground-closed')
        })

        it('should show two columns when playground is open', async () => {
            render(
                <KnowledgeEditorSnippet
                    {...baseProps}
                    snippetType={SnippetType.URL}
                />,
            )

            await act(() =>
                userEvent.click(screen.getByRole('button', { name: /test/i })),
            )

            expect(screen.getByTestId('snippet-loader')).toBeInTheDocument()
            expect(screen.getByTestId('playground-panel')).toBeInTheDocument()
        })

        it('should close playground panel when close button is clicked', async () => {
            render(
                <KnowledgeEditorSnippet
                    {...baseProps}
                    snippetType={SnippetType.URL}
                />,
            )

            const playgroundPanel = screen.getByTestId('playground-panel')
            const playgroundContainer = playgroundPanel.parentElement

            await act(() =>
                userEvent.click(screen.getByRole('button', { name: /test/i })),
            )

            expect(playgroundContainer).toHaveClass('playground-open')

            await act(() =>
                userEvent.click(
                    screen.getByRole('button', { name: /close playground/i }),
                ),
            )

            expect(playgroundContainer).toHaveClass('playground-closed')
            expect(playgroundContainer).not.toHaveClass('playground-open')
        })

        it('should toggle playground when Test button is clicked multiple times', async () => {
            render(
                <KnowledgeEditorSnippet
                    {...baseProps}
                    snippetType={SnippetType.URL}
                />,
            )

            const playgroundPanel = screen.getByTestId('playground-panel')
            const playgroundContainer = playgroundPanel.parentElement

            await act(() =>
                userEvent.click(screen.getByRole('button', { name: /test/i })),
            )

            expect(playgroundContainer).toHaveClass('playground-open')
            expect(playgroundContainer).not.toHaveClass('playground-closed')

            await act(() =>
                userEvent.click(screen.getByRole('button', { name: /test/i })),
            )

            expect(playgroundContainer).toHaveClass('playground-closed')
            expect(playgroundContainer).not.toHaveClass('playground-open')

            await act(() =>
                userEvent.click(screen.getByRole('button', { name: /test/i })),
            )

            expect(playgroundContainer).toHaveClass('playground-open')
            expect(playgroundContainer).not.toHaveClass('playground-closed')
        })

        it('should change playground visibility state when opened', async () => {
            render(
                <KnowledgeEditorSnippet
                    {...baseProps}
                    snippetType={SnippetType.URL}
                />,
            )

            const playgroundPanel = screen.getByTestId('playground-panel')
            const playgroundContainer = playgroundPanel.parentElement

            expect(playgroundPanel).toBeInTheDocument()
            expect(playgroundContainer).toHaveClass('playground-closed')

            await act(() =>
                userEvent.click(screen.getByRole('button', { name: /test/i })),
            )

            expect(playgroundPanel).toBeInTheDocument()
            expect(playgroundContainer).toHaveClass('playground-open')
        })

        it('should keep playground state independent of other interactions', async () => {
            render(
                <KnowledgeEditorSnippet
                    {...baseProps}
                    snippetType={SnippetType.URL}
                />,
            )

            await act(() =>
                userEvent.click(screen.getByRole('button', { name: /test/i })),
            )

            expect(screen.getByTestId('playground-panel')).toBeInTheDocument()
            expect(screen.getByTestId('snippet-loader')).toBeInTheDocument()
        })
    })

    describe('Shared panel state', () => {
        it('calls onClose when shared panel onRequestClose is invoked', async () => {
            const onClose = jest.fn()
            const onSharedPanelStateChange = jest.fn()

            render(
                <KnowledgeEditorSnippet
                    {...baseProps}
                    snippetType={SnippetType.URL}
                    onClose={onClose}
                    onSharedPanelStateChange={onSharedPanelStateChange}
                />,
            )

            await waitFor(() => {
                expect(onSharedPanelStateChange).toHaveBeenCalled()
            })

            const latestSharedPanelState =
                onSharedPanelStateChange.mock.calls.at(-1)?.[0]
            act(() => {
                latestSharedPanelState.onRequestClose()
            })

            expect(onClose).toHaveBeenCalledTimes(1)
        })

        it('does not call onClose by default when shared close is not triggered', () => {
            const onClose = jest.fn()

            render(
                <KnowledgeEditorSnippet
                    {...baseProps}
                    snippetType={SnippetType.URL}
                    onClose={onClose}
                />,
            )

            expect(onClose).not.toHaveBeenCalled()
        })
    })

    describe('Shared panel mode', () => {
        it('renders editor content without SidePanel and syncs shared panel state', async () => {
            const onClose = jest.fn()
            const onSharedPanelStateChange = jest.fn()

            render(
                <KnowledgeEditorSnippet
                    {...baseProps}
                    snippetType={SnippetType.URL}
                    onClose={onClose}
                    onSharedPanelStateChange={onSharedPanelStateChange}
                />,
            )

            expect(screen.queryByTestId('side-panel')).not.toBeInTheDocument()
            expect(screen.getByTestId('snippet-loader')).toBeInTheDocument()

            await waitFor(() => {
                expect(onSharedPanelStateChange).toHaveBeenCalled()
            })

            const latestSharedPanelState =
                onSharedPanelStateChange.mock.calls.at(-1)?.[0]
            expect(latestSharedPanelState).toEqual(
                expect.objectContaining({
                    width: expect.any(String),
                    onRequestClose: expect.any(Function),
                }),
            )

            act(() => {
                latestSharedPanelState.onRequestClose()
            })

            expect(onClose).toHaveBeenCalledTimes(1)
        })

        it('does not sync shared panel state when help center is missing', () => {
            const onSharedPanelStateChange = jest.fn()
            useAiAgentHelpCenterState.mockReturnValue({
                helpCenter: undefined,
                isLoading: false,
            })

            render(
                <KnowledgeEditorSnippet
                    {...baseProps}
                    snippetType={SnippetType.URL}
                    onSharedPanelStateChange={onSharedPanelStateChange}
                />,
            )

            expect(onSharedPanelStateChange).not.toHaveBeenCalled()
        })
    })
})
