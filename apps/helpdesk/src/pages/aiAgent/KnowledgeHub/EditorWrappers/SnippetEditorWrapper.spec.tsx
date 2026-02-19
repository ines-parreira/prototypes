import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SnippetType } from '../types'
import { SnippetEditorWrapper } from './SnippetEditorWrapper'

jest.mock('pages/aiAgent/components/KnowledgeEditor/KnowledgeEditor', () => ({
    KnowledgeEditor: ({ variant, snippetId, snippetType, onClose }: any) => (
        <div>
            <span data-testid="editor-variant">{variant}</span>
            <span data-testid="snippet-id">{snippetId}</span>
            <span data-testid="snippet-type">{snippetType}</span>
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

    it('does not render when editor is closed', () => {
        const { container } = render(
            <SnippetEditorWrapper {...defaultProps} isOpen={false} />,
        )

        expect(container.firstChild).toBeNull()
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
})
