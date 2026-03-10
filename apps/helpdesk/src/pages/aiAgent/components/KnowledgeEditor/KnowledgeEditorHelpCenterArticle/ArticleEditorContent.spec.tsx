import { createRef } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { ArticleWithLocalTranslation } from 'models/helpCenter/types'

import { ArticleEditorContent } from './ArticleEditorContent'
import { useArticleContext } from './context'
import type { ArticleContextValue, SettingsChanges } from './context/types'
import { useArticleAutoSave } from './hooks'

jest.mock('./context')
jest.mock('./hooks')
jest.mock(
    '../KnowledgeEditorSidePanel/KnowledgeEditorSidePanelHelpCenterArticle/KnowledgeEditorSidePanelHelpCenterArticle',
)
jest.mock('../KnowledgeEditorTopBar/KnowledgeEditorTopBar')
jest.mock('./ArticleToolbarControls')
jest.mock('./ArticleVersionBanner')
jest.mock('./KnowledgeEditorHelpCenterArticleEditView')
jest.mock('./KnowledgeEditorHelpCenterArticleReadView')
jest.mock('./KnowledgeEditorHelpCenterArticleDiffView')
jest.mock('domains/reporting/pages/common/drill-down/DrillDownModal', () => ({
    DrillDownModal: jest.fn(() => null),
}))

const mockUseArticleContext = useArticleContext as jest.Mock
const mockUseArticleAutoSave = useArticleAutoSave as jest.Mock

const createMockArticle = (
    overrides: Partial<ArticleWithLocalTranslation> = {},
): ArticleWithLocalTranslation =>
    ({
        id: 1,
        unlisted_id: 'test-unlisted-id',
        help_center_id: 1,
        available_locales: ['en-US'],
        created_datetime: '2024-01-01T00:00:00Z',
        updated_datetime: '2024-01-02T00:00:00Z',
        deleted_datetime: null,
        rating: { up: 0, down: 0 },
        translation: {
            locale: 'en-US',
            title: 'Test Article',
            content: '<p>Test content</p>',
            slug: 'test-article',
            excerpt: 'Test excerpt',
            category_id: 1,
            visibility_status: 'PUBLIC',
            customer_visibility: 'PUBLIC',
            article_id: 1,
            article_unlisted_id: 'test-unlisted-id',
            seo_meta: { title: 'SEO Title', description: 'SEO Description' },
            created_datetime: '2024-01-01T00:00:00Z',
            updated_datetime: '2024-01-02T00:00:00Z',
            deleted_datetime: null,
            is_current: true,
            rating: { up: 0, down: 0 },
            draft_version_id: null,
            published_version_id: null,
            published_datetime: null,
            publisher_user_id: null,
            commit_message: null,
            version: null,
        },
        ...overrides,
    }) as ArticleWithLocalTranslation

type ContextOverrides = Omit<Partial<ArticleContextValue>, 'state'> & {
    state?: Partial<ArticleContextValue['state']>
}

const createMockContextValue = (
    overrides: ContextOverrides = {},
): ArticleContextValue => {
    const defaultState: ArticleContextValue['state'] = {
        articleMode: 'edit' as const,
        isFullscreen: false,
        isDetailsView: true,
        title: 'Test Article',
        content: '<p>Test content</p>',
        savedSnapshot: {
            title: 'Test Article',
            content: '<p>Test content</p>',
        },
        isAutoSaving: false,
        hasAutoSavedInSession: false,
        article: createMockArticle(),
        translationMode: 'existing' as const,
        currentLocale: 'en-US' as const,
        pendingSettingsChanges: {} as SettingsChanges,
        versionStatus: 'latest_draft' as const,
        historicalVersion: null,
        comparisonVersion: null,
        activeModal: null,
        isUpdating: false,
        templateKey: undefined,
    }

    const mergedState = { ...defaultState, ...overrides.state }
    const { state: __state, ...restOverrides } = overrides

    return {
        state: mergedState,
        dispatch: jest.fn(),
        config: {
            helpCenter: {
                id: 1,
                uid: '1',
                name: 'Test Help Center',
                subdomain: 'test',
                default_locale: 'en-US',
                supported_locales: ['en-US'],
                source: 'manual',
                type: 'faq',
                layout: 'default',
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-01T00:00:00Z',
                deleted_datetime: null,
                deactivated_datetime: null,
                code_snippet_template: '',
                integration_id: null,
                search_deactivated_datetime: null,
                powered_by_deactivated_datetime: null,
                self_service_deactivated_datetime: null,
                gaid: null,
                algolia_api_key: null,
                algolia_app_id: null,
                algolia_index_name: null,
                primary_color: '#000000',
                primary_font_family: 'Inter',
                theme: 'light',
                hotswap_session_token: null,
                shop_name: null,
                shop_integration_id: null,
                email_integration: null,
                automation_settings_id: null,
                main_embedment_base_url: null,
            },
            supportedLocales: [{ code: 'en-US', name: 'English - USA' }],
            categories: [],
            initialMode: 'edit',
            onClose: jest.fn(),
            onClickPrevious: jest.fn(),
            onClickNext: jest.fn(),
            onCreatedFn: jest.fn(),
            onUpdatedFn: jest.fn(),
        },
        hasPendingContentChanges: false,
        isFormValid: true,
        hasDraft: false,
        canEdit: true,
        playground: {
            isOpen: false,
            onTest: jest.fn(),
            onClose: jest.fn(),
            sidePanelWidth: '60vw',
            shouldHideFullscreenButton: false,
        },
        ...restOverrides,
    } as ArticleContextValue
}

jest.mock('../KnowledgeEditorTopBar/KnowledgeEditorTopBar', () => ({
    KnowledgeEditorTopBar: jest.fn(
        ({
            onClickPrevious,
            onClickNext,
            title,
            onChangeTitle,
            isFullscreen,
            onToggleFullscreen,
            onClose,
            isDetailsView,
            onToggleDetailsView,
            disabled,
            isSaving,
            lastUpdatedDatetime,
            children,
        }) => (
            <div data-mock="KnowledgeEditorTopBar">
                <span data-testid="topbar-title">{title}</span>
                {onClickPrevious && (
                    <button onClick={onClickPrevious} aria-label="previous">
                        Previous
                    </button>
                )}
                {onClickNext && (
                    <button onClick={onClickNext} aria-label="next">
                        Next
                    </button>
                )}
                {onChangeTitle && (
                    <input
                        aria-label="title input"
                        value={title}
                        onChange={(e) => onChangeTitle(e.target.value)}
                    />
                )}
                <button
                    onClick={onToggleFullscreen}
                    aria-label={
                        isFullscreen ? 'leave fullscreen' : 'fullscreen'
                    }
                    disabled={disabled}
                >
                    Toggle Fullscreen
                </button>
                <button
                    onClick={onClose}
                    aria-label="close"
                    disabled={disabled}
                >
                    Close
                </button>
                <button
                    onClick={onToggleDetailsView}
                    aria-label={
                        isDetailsView
                            ? 'collapse side panel'
                            : 'expand side panel'
                    }
                    disabled={disabled}
                >
                    Toggle Details
                </button>
                {isSaving && <span>Saving...</span>}
                {lastUpdatedDatetime && (
                    <span data-testid="last-updated">
                        {lastUpdatedDatetime.toISOString()}
                    </span>
                )}
                {children}
            </div>
        ),
    ),
}))

jest.mock('./ArticleToolbarControls', () => ({
    ArticleToolbarControls: () => <div data-mock="ArticleToolbarControls" />,
}))

jest.mock('./ArticleVersionBanner', () => ({
    ArticleVersionBanner: () => <div data-mock="ArticleVersionBanner" />,
}))

jest.mock('./KnowledgeEditorHelpCenterArticleReadView', () => ({
    KnowledgeEditorHelpCenterArticleReadView: jest.fn(({ content, title }) => (
        <div data-mock="ReadView">
            <span data-testid="read-view-title">{title}</span>
            <span data-testid="read-view-content">{content}</span>
        </div>
    )),
}))

jest.mock('./KnowledgeEditorHelpCenterArticleEditView', () => ({
    KnowledgeEditorHelpCenterArticleEditView: jest.fn(
        ({ locale, articleId, content, onChangeContent }) => (
            <div data-mock="EditView">
                <span data-testid="edit-view-locale">{locale}</span>
                <span data-testid="edit-view-article-id">{articleId}</span>
                <input
                    aria-label="content editor"
                    value={content}
                    onChange={(e) => onChangeContent(e.target.value)}
                />
            </div>
        ),
    ),
}))

jest.mock('./KnowledgeEditorHelpCenterArticleDiffView', () => ({
    KnowledgeEditorHelpCenterArticleDiffView: jest.fn(
        ({ oldTitle, oldContent, newTitle, newContent }) => (
            <div data-mock="DiffView">
                <span data-testid="diff-view-old-title">{oldTitle}</span>
                <span data-testid="diff-view-old-content">{oldContent}</span>
                <span data-testid="diff-view-new-title">{newTitle}</span>
                <span data-testid="diff-view-new-content">{newContent}</span>
            </div>
        ),
    ),
}))

jest.mock(
    '../KnowledgeEditorSidePanel/KnowledgeEditorSidePanelHelpCenterArticle/KnowledgeEditorSidePanelHelpCenterArticle',
    () => ({
        KnowledgeEditorSidePanelHelpCenterArticle: () => (
            <div data-mock="SidePanel" />
        ),
    }),
)

jest.mock('./modals', () => ({
    ArticleUnsavedChangesModal: () => (
        <div data-mock="ArticleUnsavedChangesModal" />
    ),
    ArticleDiscardDraftModal: () => (
        <div data-mock="ArticleDiscardDraftModal" />
    ),
    ArticleDeleteModal: () => <div data-mock="ArticleDeleteModal" />,
    ArticleTranslationDeleteModal: () => (
        <div data-mock="ArticleTranslationDeleteModal" />
    ),
    ArticlePublishModal: () => <div data-mock="ArticlePublishModal" />,
    ArticleRestoreVersionModal: () => (
        <div data-mock="ArticleRestoreVersionModal" />
    ),
}))

describe('ArticleEditorContent', () => {
    const mockOnChangeField = jest.fn()
    const closeHandlerRef = createRef<(() => void) | null>()

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseArticleAutoSave.mockReturnValue({
            onChangeField: mockOnChangeField,
        })
        ;(
            closeHandlerRef as React.MutableRefObject<(() => void) | null>
        ).current = null
    })

    const renderComponent = (contextOverrides: ContextOverrides = {}) => {
        const contextValue = createMockContextValue(contextOverrides)
        mockUseArticleContext.mockReturnValue(contextValue)

        return {
            ...render(
                <ArticleEditorContent
                    closeHandlerRef={
                        closeHandlerRef as React.MutableRefObject<
                            (() => void) | null
                        >
                    }
                />,
            ),
            contextValue,
        }
    }

    describe('rendering', () => {
        it('should render all required components', () => {
            renderComponent()

            expect(screen.getByText('Test Article')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /close/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /fullscreen/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /collapse side panel/i }),
            ).toBeInTheDocument()
        })

        it('should render modals', () => {
            renderComponent()

            expect(
                screen.getByText(
                    (_, element) =>
                        element?.getAttribute('data-mock') ===
                        'ArticleUnsavedChangesModal',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    (_, element) =>
                        element?.getAttribute('data-mock') ===
                        'ArticleDiscardDraftModal',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    (_, element) =>
                        element?.getAttribute('data-mock') ===
                        'ArticleDeleteModal',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    (_, element) =>
                        element?.getAttribute('data-mock') ===
                        'ArticleTranslationDeleteModal',
                ),
            ).toBeInTheDocument()
        })

        it('should render toolbar controls', () => {
            renderComponent()

            expect(
                screen.getByText(
                    (_, element) =>
                        element?.getAttribute('data-mock') ===
                        'ArticleToolbarControls',
                ),
            ).toBeInTheDocument()
        })

        it('should render version banner', () => {
            renderComponent()

            expect(
                screen.getByText(
                    (_, element) =>
                        element?.getAttribute('data-mock') ===
                        'ArticleVersionBanner',
                ),
            ).toBeInTheDocument()
        })
    })

    describe('article mode behavior', () => {
        it('should render read view when articleMode is read', () => {
            renderComponent({ state: { articleMode: 'read' } })

            expect(
                screen.getByText(
                    (_, element) =>
                        element?.getAttribute('data-mock') === 'ReadView',
                ),
            ).toBeInTheDocument()
            expect(
                screen.queryByText(
                    (_, element) =>
                        element?.getAttribute('data-mock') === 'EditView',
                ),
            ).not.toBeInTheDocument()
        })

        it('should render edit view when articleMode is edit', () => {
            renderComponent({ state: { articleMode: 'edit' } })

            expect(
                screen.getByText(
                    (_, element) =>
                        element?.getAttribute('data-mock') === 'EditView',
                ),
            ).toBeInTheDocument()
            expect(
                screen.queryByText(
                    (_, element) =>
                        element?.getAttribute('data-mock') === 'ReadView',
                ),
            ).not.toBeInTheDocument()
        })

        it('should render edit view when articleMode is create', () => {
            renderComponent({ state: { articleMode: 'create' } })

            expect(
                screen.getByText(
                    (_, element) =>
                        element?.getAttribute('data-mock') === 'EditView',
                ),
            ).toBeInTheDocument()
        })

        it('should show navigation buttons in read mode', () => {
            renderComponent({ state: { articleMode: 'read' } })

            expect(
                screen.getByRole('button', { name: /previous/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /next/i }),
            ).toBeInTheDocument()
        })

        it('should hide navigation buttons in edit mode', () => {
            renderComponent({ state: { articleMode: 'edit' } })

            expect(
                screen.queryByRole('button', { name: /previous/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /next/i }),
            ).not.toBeInTheDocument()
        })

        it('should pass correct title in read mode', () => {
            renderComponent({
                state: { articleMode: 'read', title: 'My Article' },
            })

            expect(screen.getByTestId('topbar-title')).toHaveTextContent(
                'Help Center article',
            )
        })

        it('should pass article title in edit mode', () => {
            renderComponent({
                state: { articleMode: 'edit', title: 'My Article' },
            })

            expect(screen.getByTestId('topbar-title')).toHaveTextContent(
                'My Article',
            )
        })

        it('should make title editable in edit mode', () => {
            renderComponent({ state: { articleMode: 'edit' } })

            expect(
                screen.getByRole('textbox', { name: /title input/i }),
            ).toBeInTheDocument()
        })

        it('should not make title editable in read mode', () => {
            renderComponent({ state: { articleMode: 'read' } })

            expect(
                screen.queryByRole('textbox', { name: /title input/i }),
            ).not.toBeInTheDocument()
        })

        it('should render diff view when articleMode is diff and historicalVersion exists', () => {
            renderComponent({
                state: {
                    articleMode: 'diff',
                    historicalVersion: {
                        versionId: 42,
                        version: 3,
                        title: 'Historical Title',
                        content: '<p>Historical content</p>',
                        publishedDatetime: '2025-03-15T14:30:00Z',
                        commitMessage: 'Fixed content',
                        impactDateRange: {
                            start_datetime: '2025-03-01T00:00:00Z',
                            end_datetime: '2025-03-15T14:30:00Z',
                        },
                    },
                    title: 'Historical Title',
                    content: '<p>Historical content</p>',
                },
            })

            expect(
                screen.getByText(
                    (_, element) =>
                        element?.getAttribute('data-mock') === 'DiffView',
                ),
            ).toBeInTheDocument()
            expect(
                screen.queryByText(
                    (_, element) =>
                        element?.getAttribute('data-mock') === 'ReadView',
                ),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText(
                    (_, element) =>
                        element?.getAttribute('data-mock') === 'EditView',
                ),
            ).not.toBeInTheDocument()
        })

        it('should not render diff view when articleMode is diff but no historicalVersion', () => {
            renderComponent({
                state: {
                    articleMode: 'diff',
                    historicalVersion: null,
                },
            })

            expect(
                screen.queryByText(
                    (_, element) =>
                        element?.getAttribute('data-mock') === 'DiffView',
                ),
            ).not.toBeInTheDocument()
        })

        it('should hide navigation buttons in diff mode', () => {
            renderComponent({
                state: {
                    articleMode: 'diff',
                    historicalVersion: {
                        versionId: 42,
                        version: 3,
                        title: 'Old title',
                        content: 'Old content',
                        publishedDatetime: '2025-03-15T14:30:00Z',
                        impactDateRange: {
                            start_datetime: '2025-03-01T00:00:00Z',
                            end_datetime: '2025-03-15T14:30:00Z',
                        },
                    },
                },
            })

            expect(
                screen.queryByRole('button', { name: /previous/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /next/i }),
            ).not.toBeInTheDocument()
        })

        it('should show "Help Center article" as title in diff mode', () => {
            renderComponent({
                state: {
                    articleMode: 'diff',
                    title: 'Some Title',
                    historicalVersion: {
                        versionId: 42,
                        version: 3,
                        title: 'Old title',
                        content: 'Old content',
                        publishedDatetime: '2025-03-15T14:30:00Z',
                        impactDateRange: {
                            start_datetime: '2025-03-01T00:00:00Z',
                            end_datetime: '2025-03-15T14:30:00Z',
                        },
                    },
                },
            })

            expect(screen.getByTestId('topbar-title')).toHaveTextContent(
                'Help Center article',
            )
        })

        it('should not make title editable in diff mode', () => {
            renderComponent({
                state: {
                    articleMode: 'diff',
                    historicalVersion: {
                        versionId: 42,
                        version: 3,
                        title: 'Old title',
                        content: 'Old content',
                        publishedDatetime: '2025-03-15T14:30:00Z',
                        impactDateRange: {
                            start_datetime: '2025-03-01T00:00:00Z',
                            end_datetime: '2025-03-15T14:30:00Z',
                        },
                    },
                },
            })

            expect(
                screen.queryByRole('textbox', { name: /title input/i }),
            ).not.toBeInTheDocument()
        })

        it('should pass correct old/new props to diff view', () => {
            const article = createMockArticle({
                translation: {
                    ...createMockArticle().translation,
                    title: 'Current Title',
                    content: '<p>Current content</p>',
                },
            })

            renderComponent({
                state: {
                    articleMode: 'diff',
                    title: 'Historical Title',
                    content: '<p>Historical content</p>',
                    article,
                    historicalVersion: {
                        versionId: 42,
                        version: 3,
                        title: 'Historical Title',
                        content: '<p>Historical content</p>',
                        publishedDatetime: '2025-03-15T14:30:00Z',
                        impactDateRange: {
                            start_datetime: '2025-03-01T00:00:00Z',
                            end_datetime: '2025-03-15T14:30:00Z',
                        },
                    },
                },
            })

            expect(screen.getByTestId('diff-view-old-title')).toHaveTextContent(
                'Historical Title',
            )
            expect(
                screen.getByTestId('diff-view-old-content'),
            ).toHaveTextContent('<p>Historical content</p>')
            expect(screen.getByTestId('diff-view-new-title')).toHaveTextContent(
                'Current Title',
            )
            expect(
                screen.getByTestId('diff-view-new-content'),
            ).toHaveTextContent('<p>Current content</p>')
        })
    })

    describe('close behavior', () => {
        it('should set closeHandlerRef on mount', () => {
            renderComponent()

            expect(closeHandlerRef.current).toBeInstanceOf(Function)
        })

        it('should call onClose directly when no pending changes', async () => {
            const user = userEvent.setup()
            const { contextValue } = renderComponent({
                hasPendingContentChanges: false,
            })

            await user.click(screen.getByRole('button', { name: /close/i }))

            expect(contextValue.config.onClose).toHaveBeenCalled()
            expect(contextValue.dispatch).not.toHaveBeenCalledWith({
                type: 'SET_MODAL',
                payload: 'unsaved',
            })
        })

        it('should open unsaved changes modal when there are pending changes', async () => {
            const user = userEvent.setup()
            const { contextValue } = renderComponent({
                hasPendingContentChanges: true,
            })

            await user.click(screen.getByRole('button', { name: /close/i }))

            expect(contextValue.dispatch).toHaveBeenCalledWith({
                type: 'SET_MODAL',
                payload: 'unsaved',
            })
            expect(contextValue.config.onClose).not.toHaveBeenCalled()
        })

        it('should update closeHandlerRef when hasPendingContentChanges changes', () => {
            const { rerender } = renderComponent({
                hasPendingContentChanges: false,
            })

            const initialHandler = closeHandlerRef.current
            expect(initialHandler).toBeInstanceOf(Function)

            const newContextValue = createMockContextValue({
                hasPendingContentChanges: true,
            })
            mockUseArticleContext.mockReturnValue(newContextValue)

            rerender(
                <ArticleEditorContent
                    closeHandlerRef={
                        closeHandlerRef as React.MutableRefObject<
                            (() => void) | null
                        >
                    }
                />,
            )

            expect(closeHandlerRef.current).toBeInstanceOf(Function)

            closeHandlerRef.current?.()

            expect(newContextValue.dispatch).toHaveBeenCalledWith({
                type: 'SET_MODAL',
                payload: 'unsaved',
            })
        })

        it('should not trigger close when isUpdating is true', () => {
            const { contextValue } = renderComponent({
                state: { isUpdating: true, isAutoSaving: false },
                hasPendingContentChanges: false,
            })

            closeHandlerRef.current?.()

            expect(contextValue.config.onClose).not.toHaveBeenCalled()
            expect(contextValue.dispatch).not.toHaveBeenCalled()
        })

        it('should not trigger close when isAutoSaving is true', () => {
            const { contextValue } = renderComponent({
                state: { isUpdating: false, isAutoSaving: true },
                hasPendingContentChanges: false,
            })

            closeHandlerRef.current?.()

            expect(contextValue.config.onClose).not.toHaveBeenCalled()
            expect(contextValue.dispatch).not.toHaveBeenCalled()
        })

        it('should not open unsaved modal when disabled and has pending changes', () => {
            const { contextValue } = renderComponent({
                state: { isUpdating: true, isAutoSaving: false },
                hasPendingContentChanges: true,
            })

            closeHandlerRef.current?.()

            expect(contextValue.dispatch).not.toHaveBeenCalledWith({
                type: 'SET_MODAL',
                payload: 'unsaved',
            })
        })
    })

    describe('toggle actions', () => {
        it('should dispatch TOGGLE_FULLSCREEN when fullscreen button is clicked', async () => {
            const user = userEvent.setup()
            const { contextValue } = renderComponent()

            await user.click(
                screen.getByRole('button', { name: /fullscreen/i }),
            )

            expect(contextValue.dispatch).toHaveBeenCalledWith({
                type: 'TOGGLE_FULLSCREEN',
            })
        })

        it('should dispatch TOGGLE_DETAILS_VIEW when details button is clicked', async () => {
            const user = userEvent.setup()
            const { contextValue } = renderComponent()

            await user.click(
                screen.getByRole('button', { name: /collapse side panel/i }),
            )

            expect(contextValue.dispatch).toHaveBeenCalledWith({
                type: 'TOGGLE_DETAILS_VIEW',
            })
        })
    })

    describe('side panel visibility', () => {
        it('should show side panel when isDetailsView is true', () => {
            renderComponent({ state: { isDetailsView: true } })

            expect(
                screen.getByText(
                    (_, element) =>
                        element?.getAttribute('data-mock') === 'SidePanel',
                ),
            ).toBeInTheDocument()
        })

        it('should hide side panel when isDetailsView is false', () => {
            renderComponent({ state: { isDetailsView: false } })

            expect(
                screen.queryByText(
                    (_, element) =>
                        element?.getAttribute('data-mock') === 'SidePanel',
                ),
            ).not.toBeInTheDocument()
        })
    })

    describe('disabled state', () => {
        it('should disable controls when isUpdating is true', () => {
            renderComponent({
                state: { isUpdating: true, isAutoSaving: false },
            })

            expect(
                screen.getByRole('button', { name: /fullscreen/i }),
            ).toBeDisabled()
            expect(
                screen.getByRole('button', { name: /close/i }),
            ).toBeDisabled()
            expect(
                screen.getByRole('button', { name: /collapse side panel/i }),
            ).toBeDisabled()
        })

        it('should disable controls when isAutoSaving is true', () => {
            renderComponent({
                state: { isUpdating: false, isAutoSaving: true },
            })

            expect(
                screen.getByRole('button', { name: /fullscreen/i }),
            ).toBeDisabled()
            expect(
                screen.getByRole('button', { name: /close/i }),
            ).toBeDisabled()
        })

        it('should enable controls when neither isUpdating nor isAutoSaving', () => {
            renderComponent({
                state: { isUpdating: false, isAutoSaving: false },
            })

            expect(
                screen.getByRole('button', { name: /fullscreen/i }),
            ).not.toBeDisabled()
            expect(
                screen.getByRole('button', { name: /close/i }),
            ).not.toBeDisabled()
        })
    })

    describe('saving state', () => {
        it('should show saving indicator when isAutoSaving is true', () => {
            renderComponent({ state: { isAutoSaving: true } })

            expect(screen.getByText('Saving...')).toBeInTheDocument()
        })

        it('should not show saving indicator when isAutoSaving is false', () => {
            renderComponent({ state: { isAutoSaving: false } })

            expect(screen.queryByText('Saving...')).not.toBeInTheDocument()
        })

        it('should show last updated datetime when not saving', () => {
            const updatedDatetime = '2024-06-15T10:30:00Z'
            const article = createMockArticle({
                translation: {
                    locale: 'en-US',
                    title: 'Test',
                    content: '<p>Test</p>',
                    slug: 'test',
                    excerpt: '',
                    category_id: 1,
                    visibility_status: 'PUBLIC',
                    customer_visibility: 'PUBLIC',
                    article_id: 1,
                    article_unlisted_id: 'test',
                    seo_meta: { title: '', description: '' },
                    created_datetime: '2024-01-01T00:00:00Z',
                    updated_datetime: updatedDatetime,
                    deleted_datetime: null,
                    is_current: true,
                    draft_version_id: null,
                    published_version_id: null,
                    published_datetime: null,
                    publisher_user_id: null,
                    commit_message: null,
                    version: null,
                },
            })

            renderComponent({
                state: {
                    isAutoSaving: false,
                    hasAutoSavedInSession: true,
                    article,
                },
            })

            expect(screen.getByTestId('last-updated')).toHaveTextContent(
                '2024-06-15',
            )
        })

        it('should not show last updated datetime when saving', () => {
            renderComponent({
                state: {
                    isAutoSaving: true,
                    article: createMockArticle(),
                },
            })

            expect(screen.queryByTestId('last-updated')).not.toBeInTheDocument()
        })
    })

    describe('content editing', () => {
        it('should call onChangeField with title field when title is changed', async () => {
            const user = userEvent.setup()
            renderComponent({ state: { articleMode: 'edit' } })

            const titleInput = screen.getByRole('textbox', {
                name: /title input/i,
            })
            await user.type(titleInput, 'x')

            expect(mockOnChangeField).toHaveBeenCalledWith(
                'title',
                expect.any(String),
            )
        })

        it('should call onChangeField with content field when content is changed', async () => {
            const user = userEvent.setup()
            renderComponent({ state: { articleMode: 'edit' } })

            const contentEditor = screen.getByRole('textbox', {
                name: /content editor/i,
            })
            await user.type(contentEditor, 'x')

            expect(mockOnChangeField).toHaveBeenCalledWith(
                'content',
                expect.any(String),
            )
        })
    })

    describe('edit view props', () => {
        it('should pass correct props to edit view', () => {
            const article = createMockArticle()
            renderComponent({
                state: {
                    articleMode: 'edit',
                    currentLocale: 'fr-FR' as const,
                    article,
                    content: '<p>Custom content</p>',
                },
            })

            expect(screen.getByTestId('edit-view-locale')).toHaveTextContent(
                'fr-FR',
            )
            expect(
                screen.getByTestId('edit-view-article-id'),
            ).toHaveTextContent('1')
        })
    })

    describe('read view props', () => {
        it('should pass correct props to read view', () => {
            renderComponent({
                state: {
                    articleMode: 'read',
                    title: 'Read Title',
                    content: '<p>Read content</p>',
                },
            })

            expect(screen.getByTestId('read-view-title')).toHaveTextContent(
                'Read Title',
            )
            expect(screen.getByTestId('read-view-content')).toHaveTextContent(
                '<p>Read content</p>',
            )
        })
    })

    describe('fullscreen state', () => {
        it('should pass isFullscreen false to topbar', () => {
            renderComponent({ state: { isFullscreen: false } })

            expect(
                screen.getByRole('button', { name: /fullscreen/i }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /leave fullscreen/i }),
            ).not.toBeInTheDocument()
        })

        it('should pass isFullscreen true to topbar', () => {
            renderComponent({ state: { isFullscreen: true } })

            expect(
                screen.getByRole('button', { name: /leave fullscreen/i }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: 'fullscreen' }),
            ).not.toBeInTheDocument()
        })
    })

    describe('navigation', () => {
        it('should call onClickPrevious when previous button is clicked in read mode', async () => {
            const user = userEvent.setup()
            const { contextValue } = renderComponent({
                state: { articleMode: 'read' },
            })

            await user.click(screen.getByRole('button', { name: /previous/i }))

            expect(contextValue.config.onClickPrevious).toHaveBeenCalled()
        })

        it('should call onClickNext when next button is clicked in read mode', async () => {
            const user = userEvent.setup()
            const { contextValue } = renderComponent({
                state: { articleMode: 'read' },
            })

            await user.click(screen.getByRole('button', { name: /next/i }))

            expect(contextValue.config.onClickNext).toHaveBeenCalled()
        })
    })
})
