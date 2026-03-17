import { act, renderHook } from '@testing-library/react'

import { NEW_GUIDANCE_ARTICLE_LIMIT } from 'pages/aiAgent/constants'
import type { FilteredKnowledgeHubArticle } from 'pages/aiAgent/KnowledgeHub/types'
import type { GuidanceArticle } from 'pages/aiAgent/types'

import * as GuidanceContext from '../KnowledgeEditorGuidanceContext'
import type { GuidanceContextConfig, GuidanceState } from '../types'
import { useToggleVisibility } from '../useToggleVisibility'

const mockNotifyError = jest.fn()
const mockUpdateGuidanceArticle = jest.fn()
const mockRebasePublishGuidanceArticle = jest.fn()
const mockGetGuidanceArticleTranslation = jest.fn()
const mockIsGorgiasApiError = jest.fn()

// Mock dependencies
jest.mock('hooks/useNotify', () => ({
    useNotify: jest.fn(() => ({
        error: mockNotifyError,
        success: jest.fn(),
    })),
}))

jest.mock('pages/aiAgent/hooks/useGuidanceArticleMutation', () => ({
    useGuidanceArticleMutation: jest.fn(() => ({
        updateGuidanceArticle: mockUpdateGuidanceArticle,
        rebasePublishGuidanceArticle: mockRebasePublishGuidanceArticle,
        getGuidanceArticleTranslation: mockGetGuidanceArticleTranslation,
    })),
}))

jest.mock('models/api/types', () => ({
    ...jest.requireActual('models/api/types'),
    isGorgiasApiError: (error: unknown) => mockIsGorgiasApiError(error),
}))

describe('useToggleVisibility', () => {
    const createMockFilteredGuidanceArticle = (
        id: number,
        visibility: 'PUBLIC' | 'UNLISTED',
    ): FilteredKnowledgeHubArticle => ({
        id,
        title: `Guidance ${id}`,
        visibility,
        draftVersionId: null,
        publishedVersionId: null,
    })

    const createMockGuidanceArticle = (
        id: number,
        visibility: 'PUBLIC' | 'UNLISTED',
    ): GuidanceArticle => ({
        id,
        title: `Guidance ${id}`,
        content: 'Test content',
        locale: 'en-US',
        visibility,
        createdDatetime: '2024-01-01T00:00:00Z',
        lastUpdated: '2024-01-01T00:00:00Z',
        templateKey: null,
        isCurrent: true,
        draftVersionId: null,
        publishedVersionId: null,
        intents: ['marketing::unsubscribe', 'order::status'],
    })

    const mockConfig: GuidanceContextConfig = {
        shopName: 'test-shop',
        shopType: 'shopify',
        guidanceArticle: createMockGuidanceArticle(1, 'UNLISTED'),
        guidanceArticles: [],
        initialMode: 'edit',
        guidanceHelpCenter: {
            id: 1,
            default_locale: 'en-US',
        } as any,
        onClose: jest.fn(),
        onUpdateFn: jest.fn(),
    }

    const mockState: GuidanceState = {
        guidanceMode: 'edit',
        isFullscreen: false,
        isDetailsView: true,
        title: 'Test',
        content: 'Test content',
        visibility: false, // Currently UNLISTED
        savedSnapshot: { title: 'Test', content: 'Test content' },
        guidance: createMockGuidanceArticle(1, 'UNLISTED'),
        isAutoSaving: false,
        hasAutoSavedInSession: false,
        autoSaveError: false,
        isFromTemplate: false,
        hasTemplateChanges: false,
        versionStatus: 'latest_draft',
        activeModal: null,
        isUpdating: false,
        historicalVersion: null,
        comparisonVersion: null,
    }

    const setGuidanceStore = (storeValueOverride: any) => {
        const storeValue = {
            state: mockState,
            dispatch: jest.fn(),
            config: mockConfig,
            guidanceArticle: mockConfig.guidanceArticle,
            playground: {} as any,
            setConfig: jest.fn(),
            setGuidanceArticle: jest.fn(),
            setPlayground: jest.fn(),
            ...storeValueOverride,
        }

        jest.spyOn(GuidanceContext, 'useGuidanceStore').mockImplementation(
            (selector) => selector(storeValue),
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockNotifyError.mockClear()
        mockIsGorgiasApiError.mockReturnValue(false)
        mockUpdateGuidanceArticle.mockResolvedValue({
            id: 1,
            title: 'Test',
            content: 'Test content',
            visibility: 'PUBLIC',
        })
        mockRebasePublishGuidanceArticle.mockResolvedValue({
            locale: 'en-US',
            title: 'Test',
            content: 'Test content',
            visibility_status: 'UNLISTED',
            created_datetime: '2024-01-01T00:00:00Z',
            updated_datetime: '2024-01-01T00:00:00Z',
            is_current: true,
            draft_version_id: null,
            published_version_id: 1,
            intents: ['order::status'],
        })
        mockGetGuidanceArticleTranslation.mockResolvedValue({
            locale: 'en-US',
            intents: ['marketing::unsubscribe', 'order::status'],
        })
    })

    it('returns isAtLimit=false when below limit', () => {
        const guidanceArticles = Array.from({ length: 50 }, (_, i) =>
            createMockFilteredGuidanceArticle(i, 'PUBLIC'),
        )

        setGuidanceStore({
            state: mockState,
            dispatch: jest.fn(),
            config: { ...mockConfig, guidanceArticles },
            canEdit: true,
            guidanceArticle: mockConfig.guidanceArticle,
            hasPendingChanges: false,
            playground: {} as any,
            isFormValid: true,
            hasDraft: false,
        })

        const { result } = renderHook(() => useToggleVisibility())

        expect(result.current.isAtLimit).toBe(false)
    })

    it('returns isAtLimit=true when at limit', () => {
        const guidanceArticles = Array.from(
            { length: NEW_GUIDANCE_ARTICLE_LIMIT },
            (_, i) => createMockFilteredGuidanceArticle(i, 'PUBLIC'),
        )

        setGuidanceStore({
            state: mockState,
            dispatch: jest.fn(),
            config: { ...mockConfig, guidanceArticles },
            canEdit: true,
            guidanceArticle: mockConfig.guidanceArticle,
            hasPendingChanges: false,
            playground: {} as any,
            isFormValid: true,
            hasDraft: false,
        })

        const { result } = renderHook(() => useToggleVisibility())

        expect(result.current.isAtLimit).toBe(true)
        expect(result.current.limitMessage).toContain(
            `You've reached the limit of 100 enabled Guidance. Disable Guidance to enable more.`,
        )
    })

    it('prevents enabling guidance when at limit', async () => {
        const dispatch = jest.fn()

        const guidanceArticles = Array.from(
            { length: NEW_GUIDANCE_ARTICLE_LIMIT },
            (_, i) => createMockFilteredGuidanceArticle(i, 'PUBLIC'),
        )

        setGuidanceStore({
            state: mockState,
            dispatch,
            config: { ...mockConfig, guidanceArticles },
            canEdit: true,
            guidanceArticle: mockConfig.guidanceArticle,
            hasPendingChanges: false,
            playground: {} as any,
            isFormValid: false,
            hasDraft: false,
        })

        const { result } = renderHook(() => useToggleVisibility())

        await act(async () => {
            await result.current.toggleVisibility()
        })

        expect(mockNotifyError).toHaveBeenCalledWith(
            expect.stringContaining('reached the limit'),
        )

        expect(dispatch).not.toHaveBeenCalled()
    })

    it('allows disabling guidance even when at limit', async () => {
        const dispatch = jest.fn()
        mockUpdateGuidanceArticle.mockResolvedValue({
            id: 1,
            title: 'Test',
            content: 'Test content',
            visibility: 'UNLISTED',
        })

        const guidanceArticles = Array.from(
            { length: NEW_GUIDANCE_ARTICLE_LIMIT },
            (_, i) => createMockFilteredGuidanceArticle(i, 'PUBLIC'),
        )

        const stateWithPublicGuidance = {
            ...mockState,
            visibility: true,
            guidance: createMockGuidanceArticle(1, 'PUBLIC'),
        }

        setGuidanceStore({
            state: stateWithPublicGuidance,
            dispatch,
            config: { ...mockConfig, guidanceArticles },
            canEdit: true,
            guidanceArticle: createMockGuidanceArticle(1, 'PUBLIC'),
            hasPendingChanges: false,
            playground: {} as any,
            isFormValid: true,
            hasDraft: false,
        })

        const { result } = renderHook(() => useToggleVisibility())

        await act(async () => {
            await result.current.toggleVisibility()
        })

        expect(mockUpdateGuidanceArticle).toHaveBeenCalledWith(
            expect.objectContaining({ visibility: 'UNLISTED' }),
            expect.any(Object),
        )

        expect(dispatch).toHaveBeenCalledWith({
            type: 'SET_UPDATING',
            payload: true,
        })
    })

    it('allows enabling guidance when below limit', async () => {
        const dispatch = jest.fn()
        mockUpdateGuidanceArticle.mockResolvedValue({
            id: 1,
            title: 'Test',
            content: 'Test content',
            visibility: 'PUBLIC',
        })

        const guidanceArticles = Array.from({ length: 50 }, (_, i) =>
            createMockFilteredGuidanceArticle(i, 'PUBLIC'),
        )

        setGuidanceStore({
            state: mockState,
            dispatch,
            config: { ...mockConfig, guidanceArticles },
            canEdit: true,
            guidanceArticle: mockConfig.guidanceArticle,
            hasPendingChanges: false,
            playground: {} as any,
            isFormValid: false,
            hasDraft: false,
        })

        const { result } = renderHook(() => useToggleVisibility())

        await act(async () => {
            await result.current.toggleVisibility()
        })

        expect(mockUpdateGuidanceArticle).toHaveBeenCalledWith(
            expect.objectContaining({ visibility: 'PUBLIC' }),
            expect.any(Object),
        )

        expect(dispatch).toHaveBeenCalledWith({
            type: 'SET_UPDATING',
            payload: true,
        })
    })

    it('does not dispatch MARK_AS_SAVED when toggling visibility', async () => {
        const dispatch = jest.fn()
        mockUpdateGuidanceArticle.mockResolvedValue({
            id: 1,
            title: 'Test',
            content: 'Test content',
            visibility: 'PUBLIC',
        })

        setGuidanceStore({
            state: mockState,
            dispatch,
            config: mockConfig,
            canEdit: true,
            guidanceArticle: mockConfig.guidanceArticle,
            hasPendingChanges: false,
            playground: {} as any,
            isFormValid: true,
            hasDraft: false,
        })

        const { result } = renderHook(() => useToggleVisibility())

        await act(async () => {
            await result.current.toggleVisibility()
        })

        expect(dispatch).not.toHaveBeenCalledWith(
            expect.objectContaining({ type: 'MARK_AS_SAVED' }),
        )

        expect(dispatch).toHaveBeenCalledWith({
            type: 'SET_VISIBILITY',
            payload: true,
        })
    })

    it('opens intent conflict modal when enabling visibility fails with 409 conflict', async () => {
        const dispatch = jest.fn()
        const conflictError = {
            isAxiosError: true,
            response: {
                status: 409,
                data: {
                    error: {
                        msg: 'The following intents are already used by other published articles in this help center: marketing::unsubscribe',
                        conflicts: [
                            {
                                intent: 'marketing::unsubscribe',
                                articleId: 42,
                                articleTranslationId: 87,
                                title: 'Order tracking guide',
                            },
                        ],
                    },
                },
            },
        }

        mockIsGorgiasApiError.mockReturnValue(true)
        mockUpdateGuidanceArticle.mockRejectedValue(conflictError)

        setGuidanceStore({
            state: mockState,
            dispatch,
            config: mockConfig,
        })

        const { result } = renderHook(() => useToggleVisibility())

        await act(async () => {
            await result.current.toggleVisibility()
        })

        expect(result.current.visibilityConflict.isOpen).toBe(true)
        expect(result.current.visibilityConflict.message).toContain(
            'Marketing/unsubscribe',
        )
        expect(mockNotifyError).not.toHaveBeenCalledWith(
            'An error occurred while updating visibility.',
        )
    })

    it('opens intent conflict modal when conflicts are at response root', async () => {
        const dispatch = jest.fn()
        const conflictError = {
            isAxiosError: true,
            response: {
                status: 409,
                data: {
                    error: {
                        msg: 'The following intents are already used by other published articles in this help center: account::other',
                    },
                    conflicts: [
                        {
                            intent: 'account::other',
                            articleId: 42,
                            articleTranslationId: 87,
                            title: 'Order tracking guide',
                        },
                    ],
                },
            },
        }

        mockIsGorgiasApiError.mockReturnValue(true)
        mockUpdateGuidanceArticle.mockRejectedValue(conflictError)

        setGuidanceStore({
            state: mockState,
            dispatch,
            config: mockConfig,
        })

        const { result } = renderHook(() => useToggleVisibility())

        await act(async () => {
            await result.current.toggleVisibility()
        })

        expect(result.current.visibilityConflict.isOpen).toBe(true)
        expect(result.current.visibilityConflict.message).toContain(
            'Account/other',
        )
        expect(result.current.visibilityConflict.conflictingGuidances).toEqual([
            {
                articleId: 42,
                title: 'Order tracking guide',
                conflictingIntents: ['account::other'],
            },
        ])
        expect(mockNotifyError).not.toHaveBeenCalledWith(
            'An error occurred while updating visibility.',
        )
    })

    it('rebases conflicting intents and retries visibility update', async () => {
        const dispatch = jest.fn()
        const conflictError = {
            isAxiosError: true,
            response: {
                status: 409,
                data: {
                    error: {
                        msg: 'The following intents are already used by other published articles in this help center: marketing::unsubscribe',
                        conflicts: [
                            {
                                intent: 'marketing::unsubscribe',
                                articleId: 42,
                                articleTranslationId: 87,
                                title: 'Order tracking guide',
                            },
                        ],
                    },
                },
            },
        }

        mockIsGorgiasApiError.mockReturnValue(true)
        mockUpdateGuidanceArticle
            .mockRejectedValueOnce(conflictError)
            .mockResolvedValueOnce({
                id: 1,
                title: 'Test',
                content: 'Test content',
                visibility: 'PUBLIC',
            })

        setGuidanceStore({
            state: mockState,
            dispatch,
            config: mockConfig,
        })

        const { result } = renderHook(() => useToggleVisibility())

        await act(async () => {
            await result.current.toggleVisibility()
        })

        await act(async () => {
            await result.current.rebaseAndEnableVisibility()
        })

        expect(mockGetGuidanceArticleTranslation).toHaveBeenCalledWith({
            articleId: 42,
            locale: 'en-US',
        })
        expect(mockRebasePublishGuidanceArticle).toHaveBeenCalledWith(
            {
                intents: ['order::status'],
            },
            {
                articleId: 42,
                locale: 'en-US',
            },
        )
        expect(mockUpdateGuidanceArticle).toHaveBeenCalledTimes(2)
        expect(mockUpdateGuidanceArticle).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({ visibility: 'PUBLIC' }),
            expect.any(Object),
        )
        expect(result.current.visibilityConflict.isOpen).toBe(false)
    })

    it('rebases all conflicting guidances before retrying visibility update', async () => {
        const dispatch = jest.fn()
        const conflictError = {
            isAxiosError: true,
            response: {
                status: 409,
                data: {
                    error: {
                        msg: 'The following intents are already used by other published articles in this help center: marketing::unsubscribe, order::status',
                        conflicts: [
                            {
                                intent: 'marketing::unsubscribe',
                                articleId: 42,
                                articleTranslationId: 87,
                                title: 'Order tracking guide',
                            },
                            {
                                intent: 'order::status',
                                articleId: 84,
                                articleTranslationId: 88,
                                title: 'Shipping updates',
                            },
                        ],
                    },
                },
            },
        }

        mockIsGorgiasApiError.mockReturnValue(true)
        mockUpdateGuidanceArticle
            .mockRejectedValueOnce(conflictError)
            .mockResolvedValueOnce({
                id: 1,
                title: 'Current guidance',
                visibility: 'PUBLIC',
            })
        mockGetGuidanceArticleTranslation
            .mockResolvedValueOnce({
                locale: 'en-US',
                intents: ['marketing::unsubscribe', 'return::status'],
            })
            .mockResolvedValueOnce({
                locale: 'en-US',
                intents: ['order::status', 'shipping::tracking'],
            })

        setGuidanceStore({
            state: mockState,
            dispatch,
            config: mockConfig,
        })

        const { result } = renderHook(() => useToggleVisibility())

        await act(async () => {
            await result.current.toggleVisibility()
        })

        await act(async () => {
            await result.current.rebaseAndEnableVisibility()
        })

        expect(mockRebasePublishGuidanceArticle).toHaveBeenNthCalledWith(
            1,
            {
                intents: ['return::status'],
            },
            {
                articleId: 42,
                locale: 'en-US',
            },
        )
        expect(mockRebasePublishGuidanceArticle).toHaveBeenNthCalledWith(
            2,
            {
                intents: ['shipping::tracking'],
            },
            {
                articleId: 84,
                locale: 'en-US',
            },
        )
        expect(mockUpdateGuidanceArticle).toHaveBeenCalledTimes(2)
        expect(mockUpdateGuidanceArticle).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({ visibility: 'PUBLIC' }),
            expect.any(Object),
        )
    })

    it('falls back to publish override when conflicting guidance cannot be rebased', async () => {
        const dispatch = jest.fn()
        const conflictError = {
            isAxiosError: true,
            response: {
                status: 409,
                data: {
                    error: {
                        msg: 'The following intents are already used by other published articles in this help center: marketing::unsubscribe',
                        conflicts: [
                            {
                                intent: 'marketing::unsubscribe',
                                articleId: 42,
                                articleTranslationId: 87,
                                title: 'Order tracking guide',
                            },
                        ],
                    },
                },
            },
        }
        const rebaseError = {
            isAxiosError: true,
            response: {
                status: 409,
                data: {
                    error: {
                        msg: 'Cannot rebase draft: translation has no unpublished draft.',
                    },
                },
            },
        }

        mockIsGorgiasApiError.mockReturnValue(true)
        mockUpdateGuidanceArticle
            .mockRejectedValueOnce(conflictError)
            .mockResolvedValueOnce({
                id: 42,
                title: 'Conflicting guidance',
            })
            .mockResolvedValueOnce({
                id: 1,
                title: 'Current guidance',
                visibility: 'PUBLIC',
            })
        mockRebasePublishGuidanceArticle.mockRejectedValueOnce(rebaseError)

        setGuidanceStore({
            state: mockState,
            dispatch,
            config: mockConfig,
        })

        const { result } = renderHook(() => useToggleVisibility())

        await act(async () => {
            await result.current.toggleVisibility()
        })

        await act(async () => {
            await result.current.rebaseAndEnableVisibility()
        })

        expect(mockUpdateGuidanceArticle).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                intents: ['order::status'],
                isCurrent: true,
            }),
            {
                articleId: 42,
                locale: 'en-US',
            },
        )
        expect(mockUpdateGuidanceArticle).toHaveBeenNthCalledWith(
            3,
            expect.objectContaining({ visibility: 'PUBLIC' }),
            expect.any(Object),
        )
        expect(result.current.visibilityConflict.isOpen).toBe(false)
    })

    it('groups and deduplicates conflicting intents from conflict details', async () => {
        const dispatch = jest.fn()
        const conflictError = {
            isAxiosError: true,
            response: {
                status: 409,
                data: {
                    error: {
                        msg: 'Conflicting intents',
                        conflicts: [
                            {
                                intent: 'marketing::unsubscribe',
                                articleId: 1,
                                articleTranslationId: 10,
                                title: 'Current guidance',
                            },
                            {
                                intent: 'marketing::unsubscribe',
                                articleId: 42,
                                articleTranslationId: 87,
                                title: 'Order tracking guide',
                            },
                            {
                                intent: 'order::status',
                                articleId: 42,
                                articleTranslationId: 88,
                                title: 'Order tracking guide',
                            },
                            {
                                intent: 'order::status',
                                articleId: 42,
                                articleTranslationId: 89,
                                title: 'Order tracking guide',
                            },
                            {
                                articleId: 99,
                            },
                        ],
                    },
                },
            },
        }

        mockIsGorgiasApiError.mockReturnValue(true)
        mockUpdateGuidanceArticle.mockRejectedValueOnce(conflictError)

        setGuidanceStore({
            state: mockState,
            dispatch,
            config: mockConfig,
        })

        const { result } = renderHook(() => useToggleVisibility())

        await act(async () => {
            await result.current.toggleVisibility()
        })

        expect(result.current.visibilityConflict.conflictingGuidances).toEqual([
            {
                articleId: 42,
                title: 'Order tracking guide',
                conflictingIntents: ['marketing::unsubscribe', 'order::status'],
            },
        ])
        expect(result.current.visibilityConflict.conflictingIntents).toEqual([
            'marketing::unsubscribe',
            'order::status',
        ])
    })

    it('shows generic update visibility error when conflict details are unavailable', async () => {
        const conflictError = {
            isAxiosError: true,
            response: {
                status: 409,
                data: {
                    error: {
                        msg: 'The following intents are already used by other published articles in this help center: marketing::unsubscribe',
                    },
                },
            },
        }

        mockIsGorgiasApiError.mockReturnValue(true)
        mockUpdateGuidanceArticle.mockRejectedValueOnce(conflictError)

        setGuidanceStore({
            state: mockState,
            dispatch: jest.fn(),
            config: mockConfig,
        })

        const { result } = renderHook(() => useToggleVisibility())

        await act(async () => {
            await result.current.toggleVisibility()
        })

        expect(result.current.visibilityConflict.isOpen).toBe(false)
        expect(mockNotifyError).toHaveBeenCalledWith(
            'An error occurred while updating visibility.',
        )
    })

    it('closes visibility conflict modal when requested', async () => {
        const conflictError = {
            isAxiosError: true,
            response: {
                status: 409,
                data: {
                    error: {
                        msg: 'The following intents are already used by other published articles in this help center: marketing::unsubscribe',
                        conflicts: [
                            {
                                intent: 'marketing::unsubscribe',
                                articleId: 42,
                                articleTranslationId: 87,
                                title: 'Order tracking guide',
                            },
                        ],
                    },
                },
            },
        }

        mockIsGorgiasApiError.mockReturnValue(true)
        mockUpdateGuidanceArticle.mockRejectedValueOnce(conflictError)

        setGuidanceStore({
            state: mockState,
            dispatch: jest.fn(),
            config: mockConfig,
        })

        const { result } = renderHook(() => useToggleVisibility())

        await act(async () => {
            await result.current.toggleVisibility()
        })

        expect(result.current.visibilityConflict.isOpen).toBe(true)

        act(() => {
            result.current.closeVisibilityConflictModal()
        })

        expect(result.current.visibilityConflict.isOpen).toBe(false)
    })

    it('shows generic rebase error when conflict cannot be rebased and no fallback is available', async () => {
        const dispatch = jest.fn()
        const conflictError = {
            isAxiosError: true,
            response: {
                status: 409,
                data: {
                    error: {
                        msg: 'The following intents are already used by other published articles in this help center: marketing::unsubscribe',
                        conflicts: [
                            {
                                intent: 'marketing::unsubscribe',
                                articleId: 42,
                                articleTranslationId: 87,
                                title: 'Order tracking guide',
                            },
                        ],
                    },
                },
            },
        }
        const rebaseError = new Error('Rebase failed unexpectedly')

        mockIsGorgiasApiError.mockImplementation(
            (error) => error === conflictError,
        )
        mockUpdateGuidanceArticle.mockRejectedValueOnce(conflictError)
        mockRebasePublishGuidanceArticle.mockRejectedValueOnce(rebaseError)

        setGuidanceStore({
            state: mockState,
            dispatch,
            config: mockConfig,
        })

        const { result } = renderHook(() => useToggleVisibility())

        await act(async () => {
            await result.current.toggleVisibility()
        })

        await act(async () => {
            await result.current.rebaseAndEnableVisibility()
        })

        expect(mockNotifyError).toHaveBeenCalledWith(
            'An error occurred while rebasing guidance visibility.',
        )
        expect(mockUpdateGuidanceArticle).toHaveBeenCalledTimes(1)
    })

    it('shows generic update visibility error when conflict array is empty', async () => {
        const conflictError = {
            isAxiosError: true,
            response: {
                status: 409,
                data: {
                    error: {
                        msg: 'Intent conflict detected for order::status_update.',
                        conflicts: [],
                    },
                },
            },
        }

        mockIsGorgiasApiError.mockReturnValue(true)
        mockUpdateGuidanceArticle.mockRejectedValueOnce(conflictError)

        setGuidanceStore({
            state: mockState,
            dispatch: jest.fn(),
            config: mockConfig,
        })

        const { result } = renderHook(() => useToggleVisibility())

        await act(async () => {
            await result.current.toggleVisibility()
        })

        expect(result.current.visibilityConflict.isOpen).toBe(false)
        expect(mockNotifyError).toHaveBeenCalledWith(
            'An error occurred while updating visibility.',
        )
    })

    it('shows generic update visibility error for non-conflict failures', async () => {
        const updateError = new Error('Unexpected update failure')

        mockIsGorgiasApiError.mockReturnValue(false)
        mockUpdateGuidanceArticle.mockRejectedValueOnce(updateError)

        setGuidanceStore({
            state: mockState,
            dispatch: jest.fn(),
            config: mockConfig,
        })

        const { result } = renderHook(() => useToggleVisibility())

        await act(async () => {
            await result.current.toggleVisibility()
        })

        expect(mockNotifyError).toHaveBeenCalledWith(
            'An error occurred while updating visibility.',
        )
    })
})
