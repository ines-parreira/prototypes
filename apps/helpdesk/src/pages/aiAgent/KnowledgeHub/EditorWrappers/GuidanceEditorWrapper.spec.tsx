import { render, screen } from '@testing-library/react'

import { GuidanceEditorWrapper } from './GuidanceEditorWrapper'

jest.mock('pages/aiAgent/components/KnowledgeEditor/KnowledgeEditor', () => ({
    KnowledgeEditor: ({
        shopName,
        shopType,
        guidanceArticleId,
        guidanceMode,
        isOpen,
        onClose,
        onCreate,
        onUpdate,
        onDelete,
    }: any) => (
        <div data-testid="knowledge-editor">
            <span data-testid="shop-name">{shopName}</span>
            <span data-testid="shop-type">{shopType}</span>
            <span data-testid="guidance-article-id">
                {guidanceArticleId || 'none'}
            </span>
            <span data-testid="guidance-mode">{guidanceMode}</span>
            <span data-testid="is-open">{String(isOpen)}</span>
            <button onClick={onClose}>Close</button>
            {onCreate && <button onClick={onCreate}>Create</button>}
            {onUpdate && <button onClick={onUpdate}>Update</button>}
            {onDelete && <button onClick={onDelete}>Delete</button>}
        </div>
    ),
}))

describe('GuidanceEditorWrapper', () => {
    const defaultProps = {
        shopName: 'test-shop',
        shopType: 'shopify',
        guidanceMode: 'create' as const,
        isOpen: true,
        onClose: jest.fn(),
    }

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('rendering', () => {
        it('renders KnowledgeEditor when isOpen is true', () => {
            render(<GuidanceEditorWrapper {...defaultProps} />)

            expect(screen.getByTestId('knowledge-editor')).toBeInTheDocument()
        })

        it('keeps KnowledgeEditor mounted when isOpen is false', () => {
            render(<GuidanceEditorWrapper {...defaultProps} isOpen={false} />)

            expect(screen.getByTestId('knowledge-editor')).toBeInTheDocument()
            expect(screen.getByTestId('is-open')).toHaveTextContent('false')
        })

        it('passes all required props to KnowledgeEditor', () => {
            render(<GuidanceEditorWrapper {...defaultProps} />)

            expect(screen.getByTestId('shop-name')).toHaveTextContent(
                'test-shop',
            )
            expect(screen.getByTestId('shop-type')).toHaveTextContent('shopify')
            expect(screen.getByTestId('guidance-mode')).toHaveTextContent(
                'create',
            )
            expect(screen.getByTestId('is-open')).toHaveTextContent('true')
        })
    })

    describe('create mode', () => {
        it('renders with create mode when creating new guidance', () => {
            const onCreate = jest.fn()

            render(
                <GuidanceEditorWrapper
                    {...defaultProps}
                    guidanceMode="create"
                    onCreate={onCreate}
                />,
            )

            expect(screen.getByTestId('guidance-mode')).toHaveTextContent(
                'create',
            )
            expect(screen.getByTestId('guidance-article-id')).toHaveTextContent(
                'none',
            )
        })

        it('passes onCreate callback when provided', () => {
            const onCreate = jest.fn()

            render(
                <GuidanceEditorWrapper
                    {...defaultProps}
                    guidanceMode="create"
                    onCreate={onCreate}
                />,
            )

            expect(screen.getByText('Create')).toBeInTheDocument()
        })

        it('passes guidanceTemplate when creating from template', () => {
            const guidanceTemplate = {
                id: '1',
                name: 'Test Template',
                content: 'Test content for guidance',
                tag: 'test-tag',
                style: {
                    color: '#000000',
                    background: '#FFFFFF',
                },
            }

            render(
                <GuidanceEditorWrapper
                    {...defaultProps}
                    guidanceMode="create"
                    guidanceTemplate={guidanceTemplate}
                />,
            )

            expect(screen.getByTestId('knowledge-editor')).toBeInTheDocument()
        })
    })

    describe('edit mode', () => {
        it('renders with edit mode when editing existing guidance', () => {
            const onUpdate = jest.fn()

            render(
                <GuidanceEditorWrapper
                    {...defaultProps}
                    guidanceMode="edit"
                    guidanceArticleId={123}
                    onUpdate={onUpdate}
                />,
            )

            expect(screen.getByTestId('guidance-mode')).toHaveTextContent(
                'edit',
            )
            expect(screen.getByTestId('guidance-article-id')).toHaveTextContent(
                '123',
            )
        })

        it('passes onUpdate callback when provided', () => {
            const onUpdate = jest.fn()

            render(
                <GuidanceEditorWrapper
                    {...defaultProps}
                    guidanceMode="edit"
                    guidanceArticleId={123}
                    onUpdate={onUpdate}
                />,
            )

            expect(screen.getByText('Update')).toBeInTheDocument()
        })

        it('passes onDelete callback when provided', () => {
            const onDelete = jest.fn()

            render(
                <GuidanceEditorWrapper
                    {...defaultProps}
                    guidanceMode="edit"
                    guidanceArticleId={123}
                    onDelete={onDelete}
                />,
            )

            expect(screen.getByText('Delete')).toBeInTheDocument()
        })
    })

    describe('navigation callbacks', () => {
        it('passes onClickPrevious when provided', () => {
            const onClickPrevious = jest.fn()

            render(
                <GuidanceEditorWrapper
                    {...defaultProps}
                    onClickPrevious={onClickPrevious}
                />,
            )

            expect(screen.getByTestId('knowledge-editor')).toBeInTheDocument()
        })

        it('passes onClickNext when provided', () => {
            const onClickNext = jest.fn()

            render(
                <GuidanceEditorWrapper
                    {...defaultProps}
                    onClickNext={onClickNext}
                />,
            )

            expect(screen.getByTestId('knowledge-editor')).toBeInTheDocument()
        })

        it('works without navigation callbacks', () => {
            render(<GuidanceEditorWrapper {...defaultProps} />)

            expect(screen.getByTestId('knowledge-editor')).toBeInTheDocument()
        })
    })

    describe('conditional rendering', () => {
        it('renders editor when isOpen is false', () => {
            render(<GuidanceEditorWrapper {...defaultProps} isOpen={false} />)

            expect(screen.getByTestId('knowledge-editor')).toBeInTheDocument()
            expect(screen.getByTestId('is-open')).toHaveTextContent('false')
        })

        it('renders immediately when isOpen changes from false to true', () => {
            const { rerender } = render(
                <GuidanceEditorWrapper {...defaultProps} isOpen={false} />,
            )

            expect(screen.getByTestId('knowledge-editor')).toBeInTheDocument()
            expect(screen.getByTestId('is-open')).toHaveTextContent('false')

            rerender(<GuidanceEditorWrapper {...defaultProps} isOpen={true} />)

            expect(screen.getByTestId('knowledge-editor')).toBeInTheDocument()
            expect(screen.getByTestId('is-open')).toHaveTextContent('true')
        })

        it('keeps editor mounted when isOpen changes from true to false', () => {
            const { rerender } = render(
                <GuidanceEditorWrapper {...defaultProps} isOpen={true} />,
            )

            expect(screen.getByTestId('knowledge-editor')).toBeInTheDocument()

            rerender(<GuidanceEditorWrapper {...defaultProps} isOpen={false} />)

            expect(screen.getByTestId('knowledge-editor')).toBeInTheDocument()
            expect(screen.getByTestId('is-open')).toHaveTextContent('false')
        })
    })

    describe('prop updates', () => {
        it('updates shopName when prop changes', () => {
            const { rerender } = render(
                <GuidanceEditorWrapper {...defaultProps} shopName="shop-1" />,
            )

            expect(screen.getByTestId('shop-name')).toHaveTextContent('shop-1')

            rerender(
                <GuidanceEditorWrapper {...defaultProps} shopName="shop-2" />,
            )

            expect(screen.getByTestId('shop-name')).toHaveTextContent('shop-2')
        })

        it('updates guidanceMode when prop changes', () => {
            const { rerender } = render(
                <GuidanceEditorWrapper
                    {...defaultProps}
                    guidanceMode="create"
                />,
            )

            expect(screen.getByTestId('guidance-mode')).toHaveTextContent(
                'create',
            )

            rerender(
                <GuidanceEditorWrapper {...defaultProps} guidanceMode="edit" />,
            )

            expect(screen.getByTestId('guidance-mode')).toHaveTextContent(
                'edit',
            )
        })

        it('updates guidanceArticleId when prop changes', () => {
            const { rerender } = render(
                <GuidanceEditorWrapper
                    {...defaultProps}
                    guidanceArticleId={123}
                />,
            )

            expect(screen.getByTestId('guidance-article-id')).toHaveTextContent(
                '123',
            )

            rerender(
                <GuidanceEditorWrapper
                    {...defaultProps}
                    guidanceArticleId={456}
                />,
            )

            expect(screen.getByTestId('guidance-article-id')).toHaveTextContent(
                '456',
            )
        })
    })
})
