import { logEvent, SegmentEvent } from '@repo/logging'
import { act, renderHook } from '@testing-library/react'

import { useNotify } from 'hooks/useNotify'
import { useUpdateArticleTranslation } from 'models/helpCenter/mutations'
import type { LocaleCode } from 'models/helpCenter/types'

import { useArticleContext } from '../context/ArticleContext'
import type { ArticleContextValue } from '../context/types'
import { useRestoreVersionModal } from './useRestoreVersionModal'

jest.mock('@repo/logging')

jest.mock('hooks/useNotify', () => ({
    useNotify: jest.fn(),
}))

jest.mock('models/helpCenter/mutations', () => ({
    useUpdateArticleTranslation: jest.fn(),
}))

jest.mock('../context/ArticleContext', () => ({
    useArticleContext: jest.fn(),
}))

const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>
const mockUseNotify = useNotify as jest.Mock
const mockUseUpdateArticleTranslation = useUpdateArticleTranslation as jest.Mock
const mockUseArticleContext = useArticleContext as jest.Mock

describe('useRestoreVersionModal', () => {
    let mockDispatch: jest.Mock
    let mockNotifyError: jest.Mock
    let mockNotifySuccess: jest.Mock
    let mockMutateAsync: jest.Mock
    let mockOnUpdatedFn: jest.Mock

    const mockTranslation = {
        locale: 'en-US' as const,
        title: 'Current Title',
        content: '<p>Current content</p>',
        slug: 'current-title',
        excerpt: '',
        category_id: 1,
        visibility_status: 'PUBLIC' as const,
        customer_visibility: 'PUBLIC' as const,
        article_id: 123,
        article_unlisted_id: 'unlisted-id',
        seo_meta: null,
        created_datetime: '2024-01-01T00:00:00Z',
        updated_datetime: '2024-01-02T00:00:00Z',
        deleted_datetime: null,
        is_current: true,
        rating: { up: 0, down: 0 },
        draft_version_id: 10,
        published_version_id: 9,
    }

    const mockArticle = {
        id: 123,
        unlisted_id: 'unlisted-id',
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

    const mockHistoricalVersion = {
        versionId: 5,
        version: 3,
        title: 'Historical Title',
        content: '<p>Historical content</p>',
        publishedDatetime: '2024-01-10T00:00:00Z',
        publisherUserId: 42,
        commitMessage: 'Published version 3',
        impactDateRange: {
            start_datetime: '2024-01-01T00:00:00Z',
            end_datetime: '2024-01-10T00:00:00Z',
        },
    }

    const createMockContext = (
        overrides: Partial<{
            state: Partial<ArticleContextValue['state']>
            config: Partial<ArticleContextValue['config']>
        }> = {},
    ): ArticleContextValue => ({
        state: {
            articleMode: 'read',
            isFullscreen: false,
            isDetailsView: true,
            title: 'Current Title',
            content: '<p>Current content</p>',
            savedSnapshot: {
                title: 'Current Title',
                content: '<p>Current content</p>',
            },
            isAutoSaving: false,
            hasAutoSavedInSession: false,
            article: mockArticle,
            translationMode: 'existing',
            currentLocale: 'en-US',
            pendingSettingsChanges: {},
            versionStatus: 'latest_draft',
            historicalVersion: mockHistoricalVersion,
            activeModal: 'restore',
            isUpdating: false,
            templateKey: undefined,
            ...overrides.state,
        } as ArticleContextValue['state'],
        dispatch: mockDispatch,
        config: {
            helpCenter: { id: 1, default_locale: 'en-US' },
            supportedLocales: [],
            categories: [],
            shopName: 'test-shop',
            initialMode: 'read',
            onClose: jest.fn(),
            onUpdatedFn: mockOnUpdatedFn,
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
    })

    beforeEach(() => {
        jest.clearAllMocks()

        mockDispatch = jest.fn()
        mockNotifyError = jest.fn()
        mockNotifySuccess = jest.fn()
        mockMutateAsync = jest.fn()
        mockOnUpdatedFn = jest.fn()

        mockUseNotify.mockReturnValue({
            error: mockNotifyError,
            success: mockNotifySuccess,
        })
        mockUseUpdateArticleTranslation.mockReturnValue({
            mutateAsync: mockMutateAsync,
        })
        mockUseArticleContext.mockReturnValue(createMockContext())
    })

    describe('isOpen', () => {
        it('should return true when activeModal is restore', () => {
            const { result } = renderHook(() => useRestoreVersionModal())

            expect(result.current.isOpen).toBe(true)
        })

        it('should return false when activeModal is null', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({ state: { activeModal: null } }),
            )

            const { result } = renderHook(() => useRestoreVersionModal())

            expect(result.current.isOpen).toBe(false)
        })
    })

    describe('isRestoring', () => {
        it('should return true when isUpdating is true', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({ state: { isUpdating: true } }),
            )

            const { result } = renderHook(() => useRestoreVersionModal())

            expect(result.current.isRestoring).toBe(true)
        })

        it('should return false when isUpdating is false', () => {
            const { result } = renderHook(() => useRestoreVersionModal())

            expect(result.current.isRestoring).toBe(false)
        })
    })

    describe('onClose', () => {
        it('should dispatch CLOSE_MODAL action', () => {
            const { result } = renderHook(() => useRestoreVersionModal())

            act(() => {
                result.current.onClose()
            })

            expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' })
        })
    })

    describe('onRestore', () => {
        it('should early return when article is undefined', async () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({ state: { article: undefined } }),
            )

            const { result } = renderHook(() => useRestoreVersionModal())

            await act(async () => {
                await result.current.onRestore()
            })

            expect(mockMutateAsync).not.toHaveBeenCalled()
            expect(mockDispatch).not.toHaveBeenCalled()
        })

        it('should early return when historicalVersion is null', async () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({ state: { historicalVersion: null } }),
            )

            const { result } = renderHook(() => useRestoreVersionModal())

            await act(async () => {
                await result.current.onRestore()
            })

            expect(mockMutateAsync).not.toHaveBeenCalled()
            expect(mockDispatch).not.toHaveBeenCalled()
        })

        it('should call updateTranslationMutation with correct params', async () => {
            mockMutateAsync.mockResolvedValue({
                data: {
                    title: 'Restored Title',
                    content: 'Restored Content',
                },
            })

            const { result } = renderHook(() => useRestoreVersionModal())

            await act(async () => {
                await result.current.onRestore()
            })

            expect(mockMutateAsync).toHaveBeenCalledWith([
                undefined,
                {
                    help_center_id: 1,
                    article_id: 123,
                    locale: 'en-US',
                },
                {
                    title: mockHistoricalVersion.title,
                    content: mockHistoricalVersion.content,
                    is_current: false,
                },
            ])
        })

        it('should show success notification on successful restore', async () => {
            mockMutateAsync.mockResolvedValue({
                data: {
                    title: 'Restored Title',
                    content: 'Restored Content',
                },
            })

            const { result } = renderHook(() => useRestoreVersionModal())

            await act(async () => {
                await result.current.onRestore()
            })

            expect(mockNotifySuccess).toHaveBeenCalledWith(
                'Version restored as draft.',
            )
        })

        it('should show error notification on failure', async () => {
            mockMutateAsync.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(() => useRestoreVersionModal())

            await act(async () => {
                await result.current.onRestore()
            })

            expect(mockNotifyError).toHaveBeenCalledWith(
                'An error occurred while restoring version.',
            )
        })

        it('should dispatch SET_UPDATING false and CLOSE_MODAL in finally block', async () => {
            mockMutateAsync.mockResolvedValue({
                data: {
                    title: 'Restored Title',
                    content: 'Restored Content',
                },
            })

            const { result } = renderHook(() => useRestoreVersionModal())

            await act(async () => {
                await result.current.onRestore()
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: false,
            })
            expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' })
        })

        it('should track version restored event on successful restore', async () => {
            mockMutateAsync.mockResolvedValue({
                data: {
                    title: 'Restored Title',
                    content: 'Restored Content',
                },
            })

            const { result } = renderHook(() => useRestoreVersionModal())

            await act(async () => {
                await result.current.onRestore()
            })

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentVersionHistoryVersionRestored,
                {
                    shopName: 'test-shop',
                    resourceType: 'article',
                    resourceId: mockArticle.id,
                    helpCenterId: 1,
                    locale: 'en-US',
                    versionId: mockHistoricalVersion.versionId,
                    versionNumber: mockHistoricalVersion.version,
                    publishedDatetime: mockHistoricalVersion.publishedDatetime,
                },
            )
        })

        it('should not track version restored event when response has no data', async () => {
            mockMutateAsync.mockResolvedValue({ data: null })

            const { result } = renderHook(() => useRestoreVersionModal())

            await act(async () => {
                await result.current.onRestore()
            })

            expect(mockLogEvent).not.toHaveBeenCalledWith(
                SegmentEvent.AiAgentVersionHistoryVersionRestored,
                expect.anything(),
            )
        })

        it('should not track version restored event on failure', async () => {
            mockMutateAsync.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(() => useRestoreVersionModal())

            await act(async () => {
                await result.current.onRestore()
            })

            expect(mockLogEvent).not.toHaveBeenCalledWith(
                SegmentEvent.AiAgentVersionHistoryVersionRestored,
                expect.anything(),
            )
        })
    })
})
