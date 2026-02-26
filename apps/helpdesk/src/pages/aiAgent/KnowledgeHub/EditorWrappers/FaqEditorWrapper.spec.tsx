import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { GetArticleVersionStatus } from '@gorgias/help-center-types'

import { InitialArticleMode } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/context'

import { FaqEditorWrapper } from './FaqEditorWrapper'

jest.mock('pages/aiAgent/components/KnowledgeEditor/KnowledgeEditor', () => ({
    KnowledgeEditor: ({
        variant,
        helpCenterId,
        article,
        onClose,
        onClickPrevious,
        onClickNext,
    }: any) => (
        <div data-testid="faq-editor">
            <span data-testid="editor-variant">{variant}</span>
            <span data-testid="help-center-id">{helpCenterId}</span>
            <span data-testid="article-type">{article.type}</span>
            {article.type === 'existing' && (
                <>
                    <span data-testid="article-id">{article.articleId}</span>
                    {article.versionStatus && (
                        <span data-testid="version-status">
                            {article.versionStatus}
                        </span>
                    )}
                </>
            )}
            <button onClick={onClose}>Close</button>
            <button onClick={onClickPrevious}>Previous</button>
            <button onClick={onClickNext}>Next</button>
            {article.type === 'new' && (
                <button onClick={article.onCreated}>Create</button>
            )}
            {article.type === 'existing' && (
                <>
                    <button onClick={article.onUpdated}>Update</button>
                    <button onClick={article.onDeleted}>Delete</button>
                </>
            )}
        </div>
    ),
}))

describe('FaqEditorWrapper', () => {
    const defaultProps = {
        faqHelpCenterId: 123,
        isOpen: true,
        currentArticleId: undefined,
        faqArticleMode: 'new' as const,
        initialArticleMode: InitialArticleMode.READ,
        onClose: jest.fn(),
        onCreate: jest.fn(),
        onUpdate: jest.fn(),
        onDelete: jest.fn(),
        onClickPrevious: jest.fn(),
        onClickNext: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = (props = {}) => {
        return render(<FaqEditorWrapper {...defaultProps} {...props} />)
    }

    describe('rendering', () => {
        it('renders FAQ editor when isOpen is true', () => {
            renderComponent()

            expect(screen.getByTestId('faq-editor')).toBeInTheDocument()
            expect(screen.getByTestId('editor-variant')).toHaveTextContent(
                'article',
            )
        })

        it('does not render when isOpen is false', () => {
            renderComponent({ isOpen: false })

            expect(screen.queryByTestId('faq-editor')).not.toBeInTheDocument()
        })

        it('passes helpCenterId to editor', () => {
            renderComponent()

            expect(screen.getByTestId('help-center-id')).toHaveTextContent(
                '123',
            )
        })
    })

    describe('new article mode', () => {
        it('renders with new article type when creating', () => {
            renderComponent({
                faqArticleMode: 'new',
            })

            expect(screen.getByTestId('article-type')).toHaveTextContent('new')
        })

        it('passes onCreate callback for new articles', () => {
            const onCreate = jest.fn()

            renderComponent({
                faqArticleMode: 'new',
                onCreate,
            })

            expect(screen.getByText('Create')).toBeInTheDocument()
        })

        it('does not render article id for new articles', () => {
            renderComponent({
                faqArticleMode: 'new',
            })

            expect(screen.queryByTestId('article-id')).not.toBeInTheDocument()
        })
    })

    describe('existing article mode', () => {
        it('renders with existing article type when editing', () => {
            renderComponent({
                faqArticleMode: 'existing',
                currentArticleId: 456,
            })

            expect(screen.getByTestId('article-type')).toHaveTextContent(
                'existing',
            )
        })

        it('passes article id for existing articles', () => {
            renderComponent({
                faqArticleMode: 'existing',
                currentArticleId: 456,
            })

            expect(screen.getByTestId('article-id')).toHaveTextContent('456')
        })

        it('passes onUpdate callback for existing articles', () => {
            const onUpdate = jest.fn()

            renderComponent({
                faqArticleMode: 'existing',
                currentArticleId: 456,
                onUpdate,
            })

            expect(screen.getByText('Update')).toBeInTheDocument()
        })

        it('passes onDelete callback for existing articles', () => {
            const onDelete = jest.fn()

            renderComponent({
                faqArticleMode: 'existing',
                currentArticleId: 456,
                onDelete,
            })

            expect(screen.getByText('Delete')).toBeInTheDocument()
        })
    })

    describe('version status', () => {
        it('passes versionStatus when provided for existing articles', () => {
            renderComponent({
                faqArticleMode: 'existing',
                currentArticleId: 456,
                versionStatus: GetArticleVersionStatus.LatestDraft,
            })

            expect(screen.getByTestId('version-status')).toHaveTextContent(
                GetArticleVersionStatus.LatestDraft,
            )
        })

        it('passes Current version status when provided', () => {
            renderComponent({
                faqArticleMode: 'existing',
                currentArticleId: 456,
                versionStatus: GetArticleVersionStatus.Current,
            })

            expect(screen.getByTestId('version-status')).toHaveTextContent(
                GetArticleVersionStatus.Current,
            )
        })

        it('does not render version status when not provided', () => {
            renderComponent({
                faqArticleMode: 'existing',
                currentArticleId: 456,
            })

            expect(
                screen.queryByTestId('version-status'),
            ).not.toBeInTheDocument()
        })

        it('does not pass version status for new articles', () => {
            renderComponent({
                faqArticleMode: 'new',
                versionStatus: GetArticleVersionStatus.LatestDraft,
            })

            expect(
                screen.queryByTestId('version-status'),
            ).not.toBeInTheDocument()
        })
    })

    describe('navigation callbacks', () => {
        it('passes onClose callback', () => {
            const onClose = jest.fn()

            renderComponent({ onClose })

            expect(screen.getByText('Close')).toBeInTheDocument()
        })

        it('passes onClickPrevious callback', () => {
            const onClickPrevious = jest.fn()

            renderComponent({ onClickPrevious })

            expect(screen.getByText('Previous')).toBeInTheDocument()
        })

        it('passes onClickNext callback', () => {
            const onClickNext = jest.fn()

            renderComponent({ onClickNext })

            expect(screen.getByText('Next')).toBeInTheDocument()
        })
    })

    describe('conditional rendering', () => {
        it('returns null when isOpen is false', () => {
            const { container } = renderComponent({ isOpen: false })

            expect(container.firstChild).toBeNull()
        })

        it('renders when isOpen is true', () => {
            renderComponent()

            expect(screen.getByTestId('faq-editor')).toBeInTheDocument()
        })
    })

    describe('prop updates', () => {
        it('updates when faqArticleMode changes', () => {
            const { rerender } = render(
                <FaqEditorWrapper {...defaultProps} faqArticleMode="new" />,
            )

            expect(screen.getByTestId('article-type')).toHaveTextContent('new')

            rerender(
                <FaqEditorWrapper
                    {...defaultProps}
                    faqArticleMode="existing"
                    currentArticleId={789}
                />,
            )

            expect(screen.getByTestId('article-type')).toHaveTextContent(
                'existing',
            )
        })

        it('updates when currentArticleId changes', () => {
            const { rerender } = render(
                <FaqEditorWrapper
                    {...defaultProps}
                    faqArticleMode="existing"
                    currentArticleId={123}
                />,
            )

            expect(screen.getByTestId('article-id')).toHaveTextContent('123')

            rerender(
                <FaqEditorWrapper
                    {...defaultProps}
                    faqArticleMode="existing"
                    currentArticleId={456}
                />,
            )

            expect(screen.getByTestId('article-id')).toHaveTextContent('456')
        })
    })

    describe('callback invocation on article changes', () => {
        it('calls onUpdate when article content is updated', async () => {
            const user = userEvent.setup()
            const onUpdate = jest.fn()

            renderComponent({
                faqArticleMode: 'existing',
                currentArticleId: 456,
                onUpdate,
            })

            await user.click(screen.getByText('Update'))

            expect(onUpdate).toHaveBeenCalledTimes(1)
        })

        it('calls onDelete when article is deleted', async () => {
            const user = userEvent.setup()
            const onDelete = jest.fn()

            renderComponent({
                faqArticleMode: 'existing',
                currentArticleId: 456,
                onDelete,
            })

            await user.click(screen.getByText('Delete'))

            expect(onDelete).toHaveBeenCalledTimes(1)
        })

        it('calls onCreate when new article is created', async () => {
            const user = userEvent.setup()
            const onCreate = jest.fn()

            renderComponent({
                faqArticleMode: 'new',
                onCreate,
            })

            await user.click(screen.getByText('Create'))

            expect(onCreate).toHaveBeenCalledTimes(1)
        })
    })
})
