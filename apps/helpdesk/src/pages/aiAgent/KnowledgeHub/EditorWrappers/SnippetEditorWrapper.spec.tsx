import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SnippetType } from '../types'
import { SnippetEditorWrapper } from './SnippetEditorWrapper'

jest.mock('pages/aiAgent/components/KnowledgeEditor/KnowledgeEditor', () => ({
    KnowledgeEditor: ({
        variant,
        snippetId,
        snippetType,
        isOpen,
        onClose,
    }: any) => (
        <div>
            <span data-testid="editor-variant">{variant}</span>
            <span data-testid="snippet-id">{snippetId}</span>
            <span data-testid="snippet-type">{snippetType}</span>
            <span data-testid="is-open">{String(isOpen)}</span>
            <button onClick={onClose} type="button">
                Close
            </button>
        </div>
    ),
}))

describe('SnippetEditorWrapper', () => {
    const defaultProps = {
        shopName: 'test-shop',
        isOpen: true,
        currentArticleId: 123,
        snippetType: SnippetType.URL,
        onClose: jest.fn(),
        onUpdate: jest.fn(),
    }

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders unified knowledge editor in snippet mode', () => {
        render(<SnippetEditorWrapper {...defaultProps} />)

        expect(screen.getByTestId('editor-variant')).toHaveTextContent(
            'snippet',
        )
        expect(screen.getByTestId('snippet-id')).toHaveTextContent('123')
        expect(screen.getByTestId('snippet-type')).toHaveTextContent(
            SnippetType.URL,
        )
    })

    it('keeps editor mounted when editor is closed', () => {
        render(<SnippetEditorWrapper {...defaultProps} isOpen={false} />)

        expect(screen.getByTestId('editor-variant')).toHaveTextContent(
            'snippet',
        )
        expect(screen.getByTestId('is-open')).toHaveTextContent('false')
    })

    it('does not render when snippet id is missing', () => {
        const { container } = render(
            <SnippetEditorWrapper
                {...defaultProps}
                currentArticleId={undefined}
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('does not render when snippet type is missing', () => {
        const { container } = render(
            <SnippetEditorWrapper {...defaultProps} snippetType={undefined} />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('forwards close callback', async () => {
        const user = userEvent.setup()
        render(<SnippetEditorWrapper {...defaultProps} />)

        await user.click(screen.getByRole('button', { name: 'Close' }))

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('keeps last known snippet data when closing and ids reset', () => {
        const { rerender } = render(<SnippetEditorWrapper {...defaultProps} />)

        rerender(
            <SnippetEditorWrapper
                {...defaultProps}
                isOpen={false}
                currentArticleId={undefined}
                snippetType={undefined}
            />,
        )

        expect(screen.getByTestId('snippet-id')).toHaveTextContent('123')
        expect(screen.getByTestId('snippet-type')).toHaveTextContent(
            SnippetType.URL,
        )
        expect(screen.getByTestId('is-open')).toHaveTextContent('false')
    })
})
