import { QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { GetArticleVersionStatus } from '@gorgias/help-center-types'

import { appQueryClient } from 'api/queryClient'
import {
    useGetHelpCenter,
    useGetHelpCenterCategoryTree,
} from 'models/helpCenter/queries'
import type { CategoryWithLocalTranslation } from 'models/helpCenter/types'
import { InitialArticleMode } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/context'

import { FaqEditorWrapper } from './FaqEditorWrapper'

jest.mock('models/helpCenter/queries', () => ({
    useGetHelpCenter: jest.fn(),
    useGetHelpCenterCategoryTree: jest.fn(),
}))

jest.mock('pages/aiAgent/components/KnowledgeEditor/KnowledgeEditor', () => ({
    KnowledgeEditor: ({
        variant,
        helpCenter,
        locales,
        categories,
        article,
        onClose,
        onClickPrevious,
        onClickNext,
    }: any) => (
        <div data-testid="faq-editor">
            <span data-testid="editor-variant">{variant}</span>
            <span data-testid="help-center-id">{helpCenter.id}</span>
            <span data-testid="help-center-locale">
                {helpCenter.default_locale}
            </span>
            <span data-testid="locales-count">{locales.length}</span>
            <span data-testid="categories-count">{categories.length}</span>
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

jest.mock('pages/settings/helpCenter/providers/SupportedLocales', () => ({
    SupportedLocalesProvider: ({ children }: any) => <>{children}</>,
}))

jest.mock(
    'pages/settings/helpCenter/contexts/CurrentHelpCenterContext',
    () => ({
        __esModule: true,
        default: {
            Provider: ({ children }: any) => <>{children}</>,
        },
    }),
)

const mockUseGetHelpCenter = useGetHelpCenter as jest.Mock
const mockUseGetHelpCenterCategoryTree =
    useGetHelpCenterCategoryTree as jest.Mock

const createMockCategory = (
    id: number,
    children: CategoryWithLocalTranslation[] = [],
): CategoryWithLocalTranslation => ({
    id,
    created_datetime: '2024-01-01T00:00:00Z',
    updated_datetime: '2024-01-01T00:00:00Z',
    unlisted_id: `unlisted-${id}`,
    help_center_id: 123,
    available_locales: ['en-US'],
    translation: {
        created_datetime: '2024-01-01T00:00:00Z',
        updated_datetime: '2024-01-01T00:00:00Z',
        category_id: id,
        category_unlisted_id: `unlisted-${id}`,
        parent_category_id: null,
        locale: 'en-US',
        seo_meta: {
            title: null,
            description: null,
        },
        visibility_status: 'PUBLIC',
        image_url: null,
        title: `Category ${id}`,
        description: null,
        slug: `category-${id}`,
    },
    children,
})

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

    const mockHelpCenter = {
        id: 123,
        name: 'Test FAQ Help Center',
        default_locale: 'en-US',
    }

    const mockCategoryTree = {
        children: [
            createMockCategory(1, [
                createMockCategory(11),
                createMockCategory(12),
            ]),
            createMockCategory(2, []),
        ],
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseGetHelpCenter.mockReturnValue({
            data: mockHelpCenter,
            isLoading: false,
        })
        mockUseGetHelpCenterCategoryTree.mockReturnValue({
            data: mockCategoryTree,
            isLoading: false,
        })
    })

    const renderComponent = (props = {}) => {
        return render(
            <QueryClientProvider client={appQueryClient}>
                <FaqEditorWrapper {...defaultProps} {...props} />
            </QueryClientProvider>,
        )
    }

    describe('rendering', () => {
        it('renders FAQ editor when isOpen is true and help center is available', () => {
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

        it('does not render when help center is not available', () => {
            mockUseGetHelpCenter.mockReturnValue({
                data: null,
                isLoading: false,
            })

            renderComponent()

            expect(screen.queryByTestId('faq-editor')).not.toBeInTheDocument()
        })

        it('passes help center data to editor', () => {
            renderComponent()

            expect(screen.getByTestId('help-center-id')).toHaveTextContent(
                '123',
            )
            expect(screen.getByTestId('help-center-locale')).toHaveTextContent(
                'en-US',
            )
        })
    })

    describe('help center data fetching', () => {
        it('fetches help center by id', () => {
            renderComponent({ faqHelpCenterId: 456 })

            expect(mockUseGetHelpCenter).toHaveBeenCalledWith(
                456,
                {},
                { enabled: true },
            )
        })

        it('fetches category tree with correct parameters', () => {
            renderComponent()

            expect(mockUseGetHelpCenterCategoryTree).toHaveBeenCalledWith(
                123,
                0,
                {
                    locale: 'en-US',
                    order_by: 'position',
                    order_dir: 'asc',
                },
                { enabled: true },
            )
        })

        it('disables help center and category queries when editor is closed', () => {
            renderComponent({ isOpen: false })

            expect(mockUseGetHelpCenter).toHaveBeenCalledWith(
                123,
                {},
                { enabled: false },
            )
            expect(mockUseGetHelpCenterCategoryTree).toHaveBeenCalledWith(
                123,
                0,
                expect.any(Object),
                { enabled: false },
            )
        })

        it('does not fetch category tree when help center id is not available', () => {
            mockUseGetHelpCenter.mockReturnValue({
                data: null,
                isLoading: false,
            })

            renderComponent()

            expect(mockUseGetHelpCenterCategoryTree).toHaveBeenCalledWith(
                0,
                0,
                expect.any(Object),
                { enabled: false },
            )
        })

        it('uses default locale when help center locale is not available', () => {
            mockUseGetHelpCenter.mockReturnValue({
                data: {
                    ...mockHelpCenter,
                    default_locale: undefined,
                },
                isLoading: false,
            })

            renderComponent()

            expect(mockUseGetHelpCenterCategoryTree).toHaveBeenCalledWith(
                123,
                0,
                expect.objectContaining({
                    locale: 'en-US',
                }),
                expect.any(Object),
            )
        })
    })

    describe('categories transformation', () => {
        it('transforms category tree into categories list', () => {
            renderComponent()

            expect(screen.getByTestId('categories-count')).toHaveTextContent(
                '2',
            )
        })

        it('handles empty category tree', () => {
            mockUseGetHelpCenterCategoryTree.mockReturnValue({
                data: { children: [] },
                isLoading: false,
            })

            renderComponent()

            expect(screen.getByTestId('categories-count')).toHaveTextContent(
                '0',
            )
        })

        it('handles undefined category tree', () => {
            mockUseGetHelpCenterCategoryTree.mockReturnValue({
                data: undefined,
                isLoading: false,
            })

            renderComponent()

            expect(screen.getByTestId('categories-count')).toHaveTextContent(
                '0',
            )
        })

        it('transforms nested categories correctly', () => {
            renderComponent()

            expect(screen.getByTestId('faq-editor')).toBeInTheDocument()
        })
    })

    describe('locales configuration', () => {
        it('creates locale from help center default locale', () => {
            renderComponent()

            expect(screen.getByTestId('locales-count')).toHaveTextContent('1')
        })

        it('returns empty locales array when help center is not available', () => {
            mockUseGetHelpCenter.mockReturnValue({
                data: null,
                isLoading: false,
            })

            renderComponent({ isOpen: false })

            expect(screen.queryByTestId('faq-editor')).not.toBeInTheDocument()
        })

        it('uses help center default locale for locale configuration', () => {
            mockUseGetHelpCenter.mockReturnValue({
                data: {
                    ...mockHelpCenter,
                    default_locale: 'fr-FR',
                },
                isLoading: false,
            })

            renderComponent()

            expect(screen.getByTestId('help-center-locale')).toHaveTextContent(
                'fr-FR',
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

        it('passes initialArticleMode for existing articles', () => {
            renderComponent({
                faqArticleMode: 'existing',
                currentArticleId: 456,
                initialArticleMode: InitialArticleMode.EDIT,
            })

            expect(screen.getByTestId('faq-editor')).toBeInTheDocument()
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

        it('returns null when help center is not loaded', () => {
            mockUseGetHelpCenter.mockReturnValue({
                data: null,
                isLoading: false,
            })

            const { container } = renderComponent()

            expect(container.firstChild).toBeNull()
        })

        it('renders when both isOpen is true and help center is available', () => {
            renderComponent()

            expect(screen.getByTestId('faq-editor')).toBeInTheDocument()
        })
    })

    describe('prop updates', () => {
        it('updates when faqArticleMode changes', () => {
            const { rerender } = render(
                <QueryClientProvider client={appQueryClient}>
                    <FaqEditorWrapper {...defaultProps} faqArticleMode="new" />
                </QueryClientProvider>,
            )

            expect(screen.getByTestId('article-type')).toHaveTextContent('new')

            rerender(
                <QueryClientProvider client={appQueryClient}>
                    <FaqEditorWrapper
                        {...defaultProps}
                        faqArticleMode="existing"
                        currentArticleId={789}
                    />
                </QueryClientProvider>,
            )

            expect(screen.getByTestId('article-type')).toHaveTextContent(
                'existing',
            )
        })

        it('updates when currentArticleId changes', () => {
            const { rerender } = render(
                <QueryClientProvider client={appQueryClient}>
                    <FaqEditorWrapper
                        {...defaultProps}
                        faqArticleMode="existing"
                        currentArticleId={123}
                    />
                </QueryClientProvider>,
            )

            expect(screen.getByTestId('article-id')).toHaveTextContent('123')

            rerender(
                <QueryClientProvider client={appQueryClient}>
                    <FaqEditorWrapper
                        {...defaultProps}
                        faqArticleMode="existing"
                        currentArticleId={456}
                    />
                </QueryClientProvider>,
            )

            expect(screen.getByTestId('article-id')).toHaveTextContent('456')
        })
    })

    describe('context providers', () => {
        it('wraps editor with SupportedLocalesProvider', () => {
            renderComponent()

            expect(screen.getByTestId('faq-editor')).toBeInTheDocument()
        })

        it('wraps editor with CurrentHelpCenterContext provider', () => {
            renderComponent()

            expect(screen.getByTestId('faq-editor')).toBeInTheDocument()
        })
    })

    describe('loading states', () => {
        it('renders when category tree is loading', () => {
            mockUseGetHelpCenterCategoryTree.mockReturnValue({
                data: undefined,
                isLoading: true,
            })

            renderComponent()

            expect(screen.getByTestId('faq-editor')).toBeInTheDocument()
            expect(screen.getByTestId('categories-count')).toHaveTextContent(
                '0',
            )
        })

        it('renders with categories once loaded', async () => {
            const { rerender } = render(
                <QueryClientProvider client={appQueryClient}>
                    <FaqEditorWrapper {...defaultProps} />
                </QueryClientProvider>,
            )

            mockUseGetHelpCenterCategoryTree.mockReturnValue({
                data: mockCategoryTree,
                isLoading: false,
            })

            rerender(
                <QueryClientProvider client={appQueryClient}>
                    <FaqEditorWrapper {...defaultProps} />
                </QueryClientProvider>,
            )

            await waitFor(() => {
                expect(
                    screen.getByTestId('categories-count'),
                ).toHaveTextContent('2')
            })
        })
    })

    describe('callback invocation on article changes', () => {
        it('calls onUpdate when article content is updated', async () => {
            const onUpdate = jest.fn()

            renderComponent({
                faqArticleMode: 'existing',
                currentArticleId: 456,
                onUpdate,
            })

            const updateButton = screen.getByText('Update')
            await act(() => userEvent.click(updateButton))

            expect(onUpdate).toHaveBeenCalledTimes(1)
        })

        it('calls onDelete when article is deleted', async () => {
            const onDelete = jest.fn()

            renderComponent({
                faqArticleMode: 'existing',
                currentArticleId: 456,
                onDelete,
            })

            const deleteButton = screen.getByText('Delete')
            await act(() => userEvent.click(deleteButton))

            expect(onDelete).toHaveBeenCalledTimes(1)
        })

        it('calls onCreate when new article is created', async () => {
            const onCreate = jest.fn()

            renderComponent({
                faqArticleMode: 'new',
                onCreate,
            })

            const createButton = screen.getByText('Create')
            await act(() => userEvent.click(createButton))

            expect(onCreate).toHaveBeenCalledTimes(1)
        })
    })
})
