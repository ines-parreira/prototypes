import { act, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'

import { GetArticleVersionStatus } from '@gorgias/help-center-types'

import { toImmutable } from 'common/utils'
import { getHelpCentersResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { mockStore } from 'utils/testing'

import type { InitialArticleModeValue } from './context'
import { KnowledgeEditorHelpCenterArticle } from './KnowledgeEditorHelpCenterArticle'

const mockNotifyError = jest.fn()
let articleEditorCloseHandler: (() => void) | null = null

const mockHelpCenter = getHelpCentersResponseFixture.data[0]

const defaultArticleData = {
    helpCenter: mockHelpCenter,
    categories: [],
    locales: [{ code: 'en-US', name: 'en-US' }],
    isHelpCenterDataLoading: false,
    article: {
        id: 1,
        translation: {
            title: 'Test Article',
            content: 'Test Content',
            locale: 'en-US',
        },
    },
    isArticleLoading: false,
    isArticleError: false,
    articleError: null,
    initialVersionData: undefined,
    isInitialVersionLoading: false,
    isInitialVersionError: false,
}

const mockUseKnowledgeEditorArticleData = jest.fn(
    () => defaultArticleData as any,
)

jest.mock('./useKnowledgeEditorArticleData', () => ({
    useKnowledgeEditorArticleData: (
        ...args: Parameters<typeof mockUseKnowledgeEditorArticleData>
    ) => mockUseKnowledgeEditorArticleData(...args),
}))

jest.mock('@gorgias/axiom', () => ({
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
    Card: ({
        children,
        className,
    }: {
        children: React.ReactNode
        className?: string
        elevation?: string
    }) => (
        <div data-testid="card" className={className}>
            {children}
        </div>
    ),
    LegacyLoadingSpinner: () => (
        <div data-testid="loading-spinner">Loading</div>
    ),
    Skeleton: ({ height, containerClassName }: any) => (
        <div
            data-testid="skeleton"
            data-height={height}
            className={containerClassName}
        />
    ),
}))

jest.mock('hooks/useNotify', () => ({
    useNotify: () => ({
        error: mockNotifyError,
    }),
}))

jest.mock('models/api/types', () => ({
    ...jest.requireActual('models/api/types'),
    isGorgiasApiError: jest.fn(),
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

jest.mock('./ArticleEditorContent', () => ({
    ArticleEditorContent: ({
        closeHandlerRef,
    }: {
        closeHandlerRef: React.MutableRefObject<(() => void) | null>
    }) => {
        if (articleEditorCloseHandler) {
            closeHandlerRef.current = articleEditorCloseHandler
        }

        return (
            <div data-testid="article-editor-content">
                <button
                    onClick={() => {
                        if (closeHandlerRef.current) {
                            closeHandlerRef.current()
                        }
                    }}
                >
                    Close Editor
                </button>
            </div>
        )
    },
}))

// Track the config passed to ArticleContextProvider
let lastConfig: any = null

jest.mock('./context', () => {
    const actual = jest.requireActual('./context')
    return {
        ...actual,
        ArticleContextProvider: ({
            config,
            children,
        }: {
            config: any
            children: React.ReactNode
        }) => {
            lastConfig = config
            return <div data-testid="article-context-provider">{children}</div>
        },
        useArticleContext: () => ({
            playground: {
                isOpen: false,
                onTest: jest.fn(),
                onClose: jest.fn(),
                sidePanelWidth: '60vw',
                shouldHideFullscreenButton: false,
            },
            config: lastConfig || {
                onClose: jest.fn(),
                isLoading: false,
            },
        }),
    }
})

jest.mock('../KnowledgeEditorLoadingShell', () => ({
    KnowledgeEditorLoadingShell: () => (
        <div data-testid="loading-shell">Loading Shell</div>
    ),
}))

jest.mock('../../PlaygroundPanel/PlaygroundPanel', () => ({
    PlaygroundPanel: ({ onClose }: { onClose: () => void }) => (
        <div data-testid="playground-panel">
            <button onClick={onClose}>Close Playground</button>
        </div>
    ),
}))

const defaultState = {
    integrations: toImmutable({
        integrations: [],
    }),
    billing: toImmutable({
        products: [],
    }),
}

describe('KnowledgeEditorHelpCenterArticle', () => {
    const baseProps = {
        helpCenterId: mockHelpCenter.id,
        onClickPrevious: () => {},
        onClickNext: () => {},
        onClose: jest.fn(),
    }

    const renderComponent = (articleProps: any) => {
        return render(
            <Provider store={mockStore(defaultState)}>
                <KnowledgeEditorHelpCenterArticle
                    {...baseProps}
                    article={articleProps}
                />
            </Provider>,
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
        lastConfig = null
        articleEditorCloseHandler = null
        mockNotifyError.mockClear()
        mockUseKnowledgeEditorArticleData.mockReturnValue(defaultArticleData)
    })

    it('renders existing article with ArticleEditorContent', () => {
        renderComponent({
            type: 'existing',
            initialArticleMode: 'read' as InitialArticleModeValue,
            articleId: 1,
        })

        expect(
            screen.getByTestId('article-context-provider'),
        ).toBeInTheDocument()
        expect(screen.getByTestId('article-editor-content')).toBeInTheDocument()
    })

    it('renders new article with ArticleEditorContent', () => {
        renderComponent({
            type: 'new',
            template: {
                title: 'Test Article',
                content: 'Test Content',
                key: 'test-template',
            },
            onCreated: () => {},
        })

        expect(
            screen.getByTestId('article-context-provider'),
        ).toBeInTheDocument()
        expect(screen.getByTestId('article-editor-content')).toBeInTheDocument()
    })

    describe('loading state', () => {
        it('shows KnowledgeEditorLoadingShell when article is loading', () => {
            mockUseKnowledgeEditorArticleData.mockReturnValue({
                ...defaultArticleData,
                article: undefined,
                isArticleLoading: true,
            })

            renderComponent({
                type: 'existing',
                initialArticleMode: 'read' as InitialArticleModeValue,
                articleId: 1,
            })

            expect(screen.getByTestId('loading-shell')).toBeInTheDocument()
            expect(
                screen.queryByTestId('article-editor-content'),
            ).not.toBeInTheDocument()
        })

        it('shows ArticleEditorContent when data is loaded and not loading', () => {
            render(
                <KnowledgeEditorHelpCenterArticle
                    {...baseProps}
                    article={{
                        type: 'existing',
                        initialArticleMode: 'read' as InitialArticleModeValue,
                        articleId: 1,
                    }}
                />,
            )

            expect(
                screen.getByTestId('article-editor-content'),
            ).toBeInTheDocument()
            expect(
                screen.queryByTestId('loading-shell'),
            ).not.toBeInTheDocument()
        })
    })

    describe('onRequestClose callback', () => {
        it('can close panel for existing article', async () => {
            const onClose = jest.fn()
            const onSharedPanelStateChange = jest.fn()

            render(
                <KnowledgeEditorHelpCenterArticle
                    {...baseProps}
                    onClose={onClose}
                    article={{
                        type: 'existing',
                        initialArticleMode: 'read' as InitialArticleModeValue,
                        articleId: 1,
                    }}
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

        it('can close panel for new article', async () => {
            const onClose = jest.fn()
            const onSharedPanelStateChange = jest.fn()

            render(
                <KnowledgeEditorHelpCenterArticle
                    {...baseProps}
                    onClose={onClose}
                    article={{
                        type: 'new',
                        template: {
                            title: 'Test Article',
                            content: 'Test Content',
                            key: 'test-template',
                        },
                        onCreated: () => {},
                    }}
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
    })

    describe('Shared panel mode', () => {
        it('renders content without SidePanel and syncs shared panel state', async () => {
            const onClose = jest.fn()
            const onSharedPanelStateChange = jest.fn()

            render(
                <KnowledgeEditorHelpCenterArticle
                    {...baseProps}
                    onClose={onClose}
                    article={{
                        type: 'existing',
                        initialArticleMode: 'read' as InitialArticleModeValue,
                        articleId: 1,
                    }}
                    onSharedPanelStateChange={onSharedPanelStateChange}
                />,
            )

            expect(screen.queryByTestId('side-panel')).not.toBeInTheDocument()
            expect(
                screen.getByTestId('article-editor-content'),
            ).toBeInTheDocument()

            await waitFor(() => {
                expect(onSharedPanelStateChange).toHaveBeenCalled()
            })

            const latestSharedPanelState =
                onSharedPanelStateChange.mock.calls.at(-1)?.[0]

            expect(latestSharedPanelState).toEqual(
                expect.objectContaining({
                    width: '60vw',
                    onRequestClose: expect.any(Function),
                }),
            )

            act(() => {
                latestSharedPanelState.onRequestClose()
            })

            expect(onClose).toHaveBeenCalledTimes(1)
        })

        it('uses editor close handler when shared panel requests close', async () => {
            const onClose = jest.fn()
            const onSharedPanelStateChange = jest.fn()
            const customCloseHandler = jest.fn()
            articleEditorCloseHandler = customCloseHandler

            render(
                <KnowledgeEditorHelpCenterArticle
                    {...baseProps}
                    onClose={onClose}
                    article={{
                        type: 'existing',
                        initialArticleMode: 'read' as InitialArticleModeValue,
                        articleId: 1,
                    }}
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

            expect(customCloseHandler).toHaveBeenCalledTimes(1)
            expect(onClose).not.toHaveBeenCalled()
        })
    })

    it('renders existing article in edit mode', () => {
        renderComponent({
            type: 'existing',
            initialArticleMode: 'edit' as InitialArticleModeValue,
            articleId: 1,
        })

        expect(
            screen.getByTestId('article-context-provider'),
        ).toBeInTheDocument()
        expect(screen.getByTestId('article-editor-content')).toBeInTheDocument()
    })

    describe('query configuration', () => {
        it('passes existing article versionStatus to data hook', () => {
            renderComponent({
                type: 'existing',
                initialArticleMode: 'read' as InitialArticleModeValue,
                articleId: 1,
                versionStatus: GetArticleVersionStatus.Current,
            })

            expect(mockUseKnowledgeEditorArticleData).toHaveBeenCalledWith(
                expect.objectContaining({
                    articleId: 1,
                    versionStatus: GetArticleVersionStatus.Current,
                    isExisting: true,
                }),
            )
            expect(lastConfig?.versionStatus).toBe(
                GetArticleVersionStatus.Current,
            )
        })

        it('defaults to latest_draft when versionStatus is not provided', () => {
            renderComponent({
                type: 'existing',
                initialArticleMode: 'read' as InitialArticleModeValue,
                articleId: 1,
            })

            expect(mockUseKnowledgeEditorArticleData).toHaveBeenCalledWith(
                expect.objectContaining({
                    versionStatus: 'latest_draft',
                }),
            )
            expect(lastConfig?.versionStatus).toBe('latest_draft')
        })

        it('passes isExisting=false for new article mode', () => {
            renderComponent({
                type: 'new',
                template: {
                    title: 'Test Article',
                    content: 'Test Content',
                    key: 'test-template',
                },
                onCreated: () => {},
            })

            expect(mockUseKnowledgeEditorArticleData).toHaveBeenCalledWith(
                expect.objectContaining({
                    articleId: 0,
                    isExisting: false,
                }),
            )
        })

        it('passes isOpen=false when editor is closed', () => {
            render(
                <KnowledgeEditorHelpCenterArticle
                    {...baseProps}
                    isOpen={false}
                    article={{
                        type: 'existing',
                        initialArticleMode: 'read' as InitialArticleModeValue,
                        articleId: 1,
                    }}
                />,
            )

            expect(mockUseKnowledgeEditorArticleData).toHaveBeenCalledWith(
                expect.objectContaining({
                    isOpen: false,
                }),
            )
        })
    })

    describe('Error handling', () => {
        it('shows error notification and closes panel on 404 error', async () => {
            const mockIsGorgiasApiError =
                jest.requireMock('models/api/types').isGorgiasApiError

            const mockError = {
                response: {
                    status: 404,
                    data: {
                        error: {
                            msg: 'Article not found',
                        },
                    },
                },
            }

            mockUseKnowledgeEditorArticleData.mockReturnValue({
                ...defaultArticleData,
                article: null,
                isArticleError: true,
                articleError: mockError,
            })

            mockIsGorgiasApiError.mockReturnValue(true)

            renderComponent({
                type: 'existing',
                initialArticleMode: 'read' as InitialArticleModeValue,
                articleId: 1,
            })

            await waitFor(() => {
                expect(mockNotifyError).toHaveBeenCalledWith(
                    'This FAQ article is no longer available. It may have been deleted.',
                )
            })
        })

        it('shows generic error notification on non-404 error', async () => {
            const mockIsGorgiasApiError =
                jest.requireMock('models/api/types').isGorgiasApiError

            const mockError = {
                response: {
                    status: 500,
                    data: {
                        error: {
                            msg: 'Internal server error',
                        },
                    },
                },
            }

            mockUseKnowledgeEditorArticleData.mockReturnValue({
                ...defaultArticleData,
                article: null,
                isArticleError: true,
                articleError: mockError,
            })

            mockIsGorgiasApiError.mockReturnValue(true)

            renderComponent({
                type: 'existing',
                initialArticleMode: 'read' as InitialArticleModeValue,
                articleId: 1,
            })

            await waitFor(() => {
                expect(mockNotifyError).toHaveBeenCalledWith(
                    'Unable to load this FAQ article. Please try again or contact support.',
                )
            })
        })

        it('does not show error notification for new articles', () => {
            mockUseKnowledgeEditorArticleData.mockReturnValue({
                ...defaultArticleData,
                article: null,
                isArticleError: true,
                articleError: new Error('Some error'),
            })

            renderComponent({
                type: 'new',
                template: {
                    title: 'Test Article',
                    content: 'Test Content',
                    key: 'test-template',
                },
                onCreated: () => {},
            })

            expect(mockNotifyError).not.toHaveBeenCalled()
        })
    })

    describe('initialVersionId', () => {
        it('passes initialVersionId to data hook for existing article', () => {
            renderComponent({
                type: 'existing',
                initialArticleMode: 'read' as InitialArticleModeValue,
                articleId: 1,
                initialVersionId: 42,
            })

            expect(mockUseKnowledgeEditorArticleData).toHaveBeenCalledWith(
                expect.objectContaining({
                    initialVersionId: 42,
                }),
            )
        })

        it('does not pass initialVersionId for new articles', () => {
            renderComponent({
                type: 'new',
                template: {
                    title: 'Test Article',
                    content: 'Test Content',
                    key: 'test-template',
                },
                onCreated: () => {},
            })

            expect(mockUseKnowledgeEditorArticleData).toHaveBeenCalledWith(
                expect.objectContaining({
                    initialVersionId: undefined,
                }),
            )
        })

        it('shows loading state when version is loading', () => {
            mockUseKnowledgeEditorArticleData.mockReturnValue({
                ...defaultArticleData,
                isInitialVersionLoading: true,
            })

            renderComponent({
                type: 'existing',
                initialArticleMode: 'read' as InitialArticleModeValue,
                articleId: 1,
                initialVersionId: 42,
            })

            expect(screen.getByTestId('loading-shell')).toBeInTheDocument()
            expect(
                screen.queryByTestId('article-editor-content'),
            ).not.toBeInTheDocument()
        })

        it('renders article content when initial version fetch fails', () => {
            mockUseKnowledgeEditorArticleData.mockReturnValue({
                ...defaultArticleData,
                initialVersionData: undefined,
                isInitialVersionError: true,
            })

            renderComponent({
                type: 'existing',
                initialArticleMode: 'read' as InitialArticleModeValue,
                articleId: 1,
                initialVersionId: 42,
            })

            expect(
                screen.getByTestId('article-editor-content'),
            ).toBeInTheDocument()
            expect(
                screen.queryByTestId('loading-shell'),
            ).not.toBeInTheDocument()
        })

        it('passes initialVersionData to config when version data is available', () => {
            mockUseKnowledgeEditorArticleData.mockReturnValue({
                ...defaultArticleData,
                initialVersionData: {
                    id: 42,
                    version: 3,
                    title: 'Historical Title',
                    content: 'Historical Content',
                    published_datetime: '2024-01-15T00:00:00Z',
                    publisher_user_id: 5,
                    commit_message: 'Fix typo',
                },
                isInitialVersionError: false,
            })

            renderComponent({
                type: 'existing',
                initialArticleMode: 'read' as InitialArticleModeValue,
                articleId: 1,
                initialVersionId: 42,
            })

            expect(
                screen.getByTestId('article-context-provider'),
            ).toBeInTheDocument()
            expect(lastConfig?.initialVersionData).toEqual(
                expect.objectContaining({
                    versionId: 42,
                    version: 3,
                    title: 'Historical Title',
                    content: 'Historical Content',
                    publishedDatetime: '2024-01-15T00:00:00Z',
                    publisherUserId: 5,
                    commitMessage: 'Fix typo',
                }),
            )
        })
    })
})
