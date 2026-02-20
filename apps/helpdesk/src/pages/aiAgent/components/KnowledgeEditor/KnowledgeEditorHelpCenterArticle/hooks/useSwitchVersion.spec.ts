import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'

import { appQueryClient } from 'api/queryClient'
import { useNotify } from 'hooks/useNotify'
import { getHelpCenterArticle } from 'models/helpCenter/resources'
import type { LocaleCode } from 'models/helpCenter/types'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

import { useArticleContext } from '../context/ArticleContext'
import type { ArticleContextValue } from '../context/types'
import { useSwitchVersion } from './useSwitchVersion'

jest.mock('hooks/useNotify', () => ({
    useNotify: jest.fn(),
}))

jest.mock('models/helpCenter/resources', () => ({
    getHelpCenterArticle: jest.fn(),
}))

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useHelpCenterApi: jest.fn(),
}))

jest.mock('../context/ArticleContext', () => ({
    useArticleContext: jest.fn(),
}))

const mockUseNotify = useNotify as jest.Mock
const mockGetHelpCenterArticle = getHelpCenterArticle as jest.Mock
const mockUseHelpCenterApi = useHelpCenterApi as jest.Mock
const mockUseArticleContext = useArticleContext as jest.Mock

describe('useSwitchVersion (Article)', () => {
    let mockDispatch: jest.Mock
    let mockNotifyError: jest.Mock
    let mockClient: { getArticle: jest.Mock }

    const mockTranslation = {
        locale: 'en-US' as const,
        title: 'Test Article',
        content: '<p>Test content</p>',
        slug: 'test-article',
        excerpt: 'Test excerpt',
        category_id: 1,
        visibility_status: 'PUBLIC' as const,
        article_id: 123,
        article_unlisted_id: 'test-unlisted-id',
        seo_meta: { title: 'SEO Title', description: 'SEO Description' },
        created_datetime: '2024-01-01T00:00:00Z',
        updated_datetime: '2024-01-02T00:00:00Z',
        deleted_datetime: null,
        is_current: false,
        rating: { up: 0, down: 0 },
        draft_version_id: 1,
        published_version_id: 2,
        published_datetime: null,
        publisher_user_id: null,
        commit_message: null,
        version: null,
    }

    const mockArticle = {
        id: 123,
        unlisted_id: 'test-unlisted-id',
        help_center_id: 1,
        available_locales: ['en-US'] as LocaleCode[],
        created_datetime: '2024-01-01T00:00:00Z',
        updated_datetime: '2024-01-02T00:00:00Z',
        deleted_datetime: null,
        rating: { up: 0, down: 0 },
        category_id: 1,
        ingested_resource_id: null,
        translation: mockTranslation,
    }

    const createMockContext = (
        overrides: Partial<{
            state: Partial<ArticleContextValue['state']>
            config: Partial<ArticleContextValue['config']>
        }> = {},
    ): ArticleContextValue =>
        ({
            state: {
                articleMode: 'edit',
                isFullscreen: false,
                isDetailsView: true,
                title: 'Test Article',
                content: '<p>Test content</p>',
                savedSnapshot: {
                    title: 'Test Article',
                    content: '<p>Test content</p>',
                },
                isAutoSaving: false,
                article: mockArticle,
                translationMode: 'existing',
                currentLocale: 'en-US',
                pendingSettingsChanges: {},
                versionStatus: 'latest_draft',
                activeModal: null,
                isUpdating: false,
                templateKey: undefined,
                ...overrides.state,
            } as ArticleContextValue['state'],
            dispatch: mockDispatch,
            config: {
                helpCenter: { id: 1 },
                supportedLocales: [],
                categories: [],
                initialMode: 'edit',
                onClose: jest.fn(),
                ...overrides.config,
            } as ArticleContextValue['config'],
            hasPendingContentChanges: false,
            isFormValid: true,
            hasDraft: true,
            canEdit: true,
            playground: {
                isOpen: false,
                onTest: jest.fn(),
                onClose: jest.fn(),
                sidePanelWidth: '60vw',
                shouldHideFullscreenButton: false,
            },
        }) as ArticleContextValue

    const mockArticleResponse = {
        id: 123,
        translation: {
            title: 'Published Title',
            content: '<p>Published content</p>',
            locale: 'en-US',
            is_current: true,
            draft_version_id: 1,
            published_version_id: 2,
        },
    }

    const renderUseSwitchVersion = () => {
        const queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        })

        return renderHook(() => useSwitchVersion(), {
            wrapper: ({ children }) =>
                createElement(
                    QueryClientProvider,
                    { client: queryClient },
                    children,
                ),
        })
    }

    beforeEach(() => {
        jest.clearAllMocks()
        appQueryClient.clear()

        mockDispatch = jest.fn()
        mockNotifyError = jest.fn()
        mockClient = { getArticle: jest.fn() }

        mockUseNotify.mockReturnValue({
            error: mockNotifyError,
        })
        mockUseHelpCenterApi.mockReturnValue({
            client: mockClient,
            isReady: true,
        })
        mockUseArticleContext.mockReturnValue(createMockContext())
    })

    it('should not do anything when article id is missing', async () => {
        mockUseArticleContext.mockReturnValue(
            createMockContext({
                state: { article: undefined },
            }),
        )

        const { result } = renderUseSwitchVersion()

        await act(async () => {
            await result.current.switchToVersion('current')
        })

        expect(mockDispatch).not.toHaveBeenCalled()
        expect(mockGetHelpCenterArticle).not.toHaveBeenCalled()
    })

    it('should dispatch SET_UPDATING true at start', async () => {
        mockGetHelpCenterArticle.mockResolvedValue(mockArticleResponse)

        const { result } = renderUseSwitchVersion()

        await act(async () => {
            await result.current.switchToVersion('current')
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_UPDATING',
            payload: true,
        })
    })

    it('should dispatch SET_UPDATING false at end', async () => {
        mockGetHelpCenterArticle.mockResolvedValue(mockArticleResponse)

        const { result } = renderUseSwitchVersion()

        await act(async () => {
            await result.current.switchToVersion('current')
        })

        const lastCall =
            mockDispatch.mock.calls[mockDispatch.mock.calls.length - 1]
        expect(lastCall).toEqual([{ type: 'SET_UPDATING', payload: false }])
    })

    it('should call getHelpCenterArticle with correct params for "current" target', async () => {
        mockGetHelpCenterArticle.mockResolvedValue(mockArticleResponse)

        const { result } = renderUseSwitchVersion()

        await act(async () => {
            await result.current.switchToVersion('current')
        })

        expect(mockGetHelpCenterArticle).toHaveBeenCalledWith(
            mockClient,
            { help_center_id: 1, id: 123 },
            { locale: 'en-US', version_status: 'current' },
            { throwOn404: undefined },
        )
    })

    it('should call getHelpCenterArticle with correct params for "latest_draft" target', async () => {
        mockGetHelpCenterArticle.mockResolvedValue(mockArticleResponse)

        const { result } = renderUseSwitchVersion()

        await act(async () => {
            await result.current.switchToVersion('latest_draft')
        })

        expect(mockGetHelpCenterArticle).toHaveBeenCalledWith(
            mockClient,
            { help_center_id: 1, id: 123 },
            { locale: 'en-US', version_status: 'latest_draft' },
            { throwOn404: undefined },
        )
    })

    it('should reuse cached response when switching to the same version repeatedly', async () => {
        mockGetHelpCenterArticle.mockResolvedValue(mockArticleResponse)

        const { result } = renderUseSwitchVersion()

        await act(async () => {
            await result.current.switchToVersion('current')
            await result.current.switchToVersion('current')
        })

        expect(mockGetHelpCenterArticle).toHaveBeenCalledTimes(1)
    })

    it('should dispatch SWITCH_VERSION with article and versionStatus on success', async () => {
        mockGetHelpCenterArticle.mockResolvedValue(mockArticleResponse)

        const { result } = renderUseSwitchVersion()

        await act(async () => {
            await result.current.switchToVersion('current')
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SWITCH_VERSION',
            payload: {
                article: mockArticleResponse,
                versionStatus: 'current',
            },
        })
    })

    it('should include the correct versionStatus in SWITCH_VERSION payload', async () => {
        mockGetHelpCenterArticle.mockResolvedValue(mockArticleResponse)

        const { result } = renderUseSwitchVersion()

        await act(async () => {
            await result.current.switchToVersion('latest_draft')
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SWITCH_VERSION',
            payload: {
                article: mockArticleResponse,
                versionStatus: 'latest_draft',
            },
        })
    })

    it('should not dispatch SWITCH_VERSION when response is null', async () => {
        mockGetHelpCenterArticle.mockResolvedValue(null)

        const { result } = renderUseSwitchVersion()

        await act(async () => {
            await result.current.switchToVersion('current')
        })

        expect(mockDispatch).not.toHaveBeenCalledWith(
            expect.objectContaining({ type: 'SWITCH_VERSION' }),
        )
    })

    it('should show error notification on failure', async () => {
        mockGetHelpCenterArticle.mockRejectedValue(new Error('API Error'))

        const { result } = renderUseSwitchVersion()

        await act(async () => {
            await result.current.switchToVersion('current')
        })

        expect(mockNotifyError).toHaveBeenCalledWith(
            'An error occurred while switching version.',
        )
    })

    it('should dispatch SET_UPDATING false even on error', async () => {
        mockGetHelpCenterArticle.mockRejectedValue(new Error('API Error'))

        const { result } = renderUseSwitchVersion()

        await act(async () => {
            await result.current.switchToVersion('current')
        })

        const lastCall =
            mockDispatch.mock.calls[mockDispatch.mock.calls.length - 1]
        expect(lastCall).toEqual([{ type: 'SET_UPDATING', payload: false }])
    })

    it('should use currentLocale from article state', async () => {
        mockUseArticleContext.mockReturnValue(
            createMockContext({
                state: { currentLocale: 'fr-FR' as any },
            }),
        )
        mockGetHelpCenterArticle.mockResolvedValue(mockArticleResponse)

        const { result } = renderUseSwitchVersion()

        await act(async () => {
            await result.current.switchToVersion('current')
        })

        expect(mockGetHelpCenterArticle).toHaveBeenCalledWith(
            mockClient,
            expect.any(Object),
            expect.objectContaining({ locale: 'fr-FR' }),
            { throwOn404: undefined },
        )
    })
})
