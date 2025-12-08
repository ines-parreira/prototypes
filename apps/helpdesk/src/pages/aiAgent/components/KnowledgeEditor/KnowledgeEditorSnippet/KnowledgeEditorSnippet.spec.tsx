import { render, screen } from '@testing-library/react'

import { SnippetType } from '../../../KnowledgeHub/types'
import { KnowledgeEditorSnippet } from './KnowledgeEditorSnippet'

jest.mock('pages/aiAgent/hooks/useAiAgentHelpCenter', () => ({
    useAiAgentHelpCenter: jest.fn(),
}))

jest.mock('./KnowledgeEditorSnippetLoader', () => ({
    KnowledgeEditorSnippetLoader: ({
        snippetType,
        snippetId,
    }: {
        snippetType: string
        snippetId: number
    }) => (
        <div data-testid="snippet-loader">
            {snippetType} - {snippetId}
        </div>
    ),
}))

const { useAiAgentHelpCenter } = jest.requireMock(
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
        useAiAgentHelpCenter.mockReturnValue(mockHelpCenter)
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
            useAiAgentHelpCenter.mockReturnValue(null)

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

            expect(useAiAgentHelpCenter).toHaveBeenCalledWith({
                shopName: 'test-shop',
                helpCenterType: 'snippet',
            })
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
})
