import { logEvent, SegmentEvent } from '@repo/logging'
import { act, renderHook } from '@repo/testing'

import { useNotify } from 'hooks/useNotify'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import type { GuidanceArticle } from 'pages/aiAgent/types'

import {
    fromArticleTranslationResponse,
    useGuidanceContext,
} from '../../context'
import type { GuidanceState, HistoricalVersionState } from '../../context/types'
import { useRestoreVersionModal } from '../useRestoreVersionModal'

jest.mock('@repo/logging')

jest.mock('hooks/useNotify', () => ({
    useNotify: jest.fn(),
}))

jest.mock('pages/aiAgent/hooks/useGuidanceArticleMutation', () => ({
    useGuidanceArticleMutation: jest.fn(),
}))

jest.mock('../../context', () => ({
    useGuidanceContext: jest.fn(),
    fromArticleTranslationResponse: jest.fn(),
}))

const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>

describe('useRestoreVersionModal', () => {
    const mockDispatch = jest.fn()
    const mockNotifyError = jest.fn()
    const mockNotifySuccess = jest.fn()
    const mockUpdateGuidanceArticle = jest.fn()
    const mockOnUpdateFn = jest.fn()

    const mockGuidance: GuidanceArticle = {
        id: 123,
        title: 'Current Title',
        content: 'Current Content',
        locale: 'en-US',
        visibility: 'PUBLIC',
        createdDatetime: '2024-01-01T00:00:00Z',
        lastUpdated: '2024-01-15T00:00:00Z',
        templateKey: 'test-template',
        isCurrent: false,
        draftVersionId: 1,
        publishedVersionId: 2,
    }

    const mockHistoricalVersion: NonNullable<HistoricalVersionState> = {
        versionId: 5,
        version: 3,
        title: 'Historical Title',
        content: 'Historical Content',
        publishedDatetime: '2024-01-10T00:00:00Z',
        publisherUserId: 42,
        commitMessage: 'Published version 3',
        impactDateRange: {
            start_datetime: '2024-01-01T00:00:00Z',
            end_datetime: '2024-01-10T00:00:00Z',
        },
    }

    const defaultState: GuidanceState = {
        guidanceMode: 'read',
        isFullscreen: false,
        isDetailsView: true,
        title: 'Current Title',
        content: 'Current Content',
        visibility: true,
        savedSnapshot: { title: 'Current Title', content: 'Current Content' },
        guidance: mockGuidance,
        isAutoSaving: false,
        hasAutoSavedInSession: false,
        autoSaveError: false,
        isFromTemplate: false,
        hasTemplateChanges: false,
        versionStatus: 'latest_draft',
        activeModal: 'restore',
        isUpdating: false,
        historicalVersion: mockHistoricalVersion,
        comparisonVersion: null,
    }

    const defaultConfig = {
        shopName: 'test-shop',
        shopType: 'shopify',
        guidanceTemplate: undefined,
        initialMode: 'edit' as const,
        guidanceHelpCenter: { id: 1, default_locale: 'en-US' },
        onUpdateFn: mockOnUpdateFn,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useNotify as jest.Mock).mockReturnValue({
            error: mockNotifyError,
            success: mockNotifySuccess,
        })
        ;(useGuidanceArticleMutation as jest.Mock).mockReturnValue({
            updateGuidanceArticle: mockUpdateGuidanceArticle,
        })
        ;(useGuidanceContext as jest.Mock).mockReturnValue({
            state: defaultState,
            dispatch: mockDispatch,
            config: defaultConfig,
        })
    })

    describe('isOpen', () => {
        it('should return true when activeModal is restore', () => {
            const { result } = renderHook(() => useRestoreVersionModal())

            expect(result.current.isOpen).toBe(true)
        })

        it('should return false when activeModal is null', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, activeModal: null },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useRestoreVersionModal())

            expect(result.current.isOpen).toBe(false)
        })

        it('should return false when activeModal is different', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, activeModal: 'discard' },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useRestoreVersionModal())

            expect(result.current.isOpen).toBe(false)
        })
    })

    describe('isRestoring', () => {
        it('should return false when isUpdating is false', () => {
            const { result } = renderHook(() => useRestoreVersionModal())

            expect(result.current.isRestoring).toBe(false)
        })

        it('should return true when isUpdating is true', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, isUpdating: true },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useRestoreVersionModal())

            expect(result.current.isRestoring).toBe(true)
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
        it('should early return when guidance id is undefined', async () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, guidance: undefined },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useRestoreVersionModal())

            await act(async () => {
                await result.current.onRestore()
            })

            expect(mockUpdateGuidanceArticle).not.toHaveBeenCalled()
            expect(mockDispatch).not.toHaveBeenCalled()
        })

        it('should early return when default_locale is undefined', async () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: defaultState,
                dispatch: mockDispatch,
                config: {
                    ...defaultConfig,
                    guidanceHelpCenter: { id: 1, default_locale: undefined },
                },
            })

            const { result } = renderHook(() => useRestoreVersionModal())

            await act(async () => {
                await result.current.onRestore()
            })

            expect(mockUpdateGuidanceArticle).not.toHaveBeenCalled()
            expect(mockDispatch).not.toHaveBeenCalled()
        })

        it('should early return when guidanceHelpCenter is undefined', async () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: defaultState,
                dispatch: mockDispatch,
                config: { ...defaultConfig, guidanceHelpCenter: undefined },
            })

            const { result } = renderHook(() => useRestoreVersionModal())

            await act(async () => {
                await result.current.onRestore()
            })

            expect(mockUpdateGuidanceArticle).not.toHaveBeenCalled()
            expect(mockDispatch).not.toHaveBeenCalled()
        })

        it('should early return when historicalVersion is null', async () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, historicalVersion: null },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useRestoreVersionModal())

            await act(async () => {
                await result.current.onRestore()
            })

            expect(mockUpdateGuidanceArticle).not.toHaveBeenCalled()
            expect(mockDispatch).not.toHaveBeenCalled()
        })

        it('should dispatch SET_UPDATING true at start', async () => {
            mockUpdateGuidanceArticle.mockResolvedValue({
                title: 'Restored Title',
                content: 'Restored Content',
            })
            ;(fromArticleTranslationResponse as jest.Mock).mockReturnValue(
                mockGuidance,
            )

            const { result } = renderHook(() => useRestoreVersionModal())

            await act(async () => {
                await result.current.onRestore()
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: true,
            })
        })

        it('should call updateGuidanceArticle with correct params', async () => {
            mockUpdateGuidanceArticle.mockResolvedValue({
                title: 'Restored Title',
                content: 'Restored Content',
            })
            ;(fromArticleTranslationResponse as jest.Mock).mockReturnValue(
                mockGuidance,
            )

            const { result } = renderHook(() => useRestoreVersionModal())

            await act(async () => {
                await result.current.onRestore()
            })

            expect(mockUpdateGuidanceArticle).toHaveBeenCalledWith(
                {
                    isCurrent: false,
                    title: mockHistoricalVersion.title,
                    content: mockHistoricalVersion.content,
                },
                {
                    articleId: mockGuidance.id,
                    locale: 'en-US',
                },
            )
        })

        it('should show success notification on successful restore', async () => {
            mockUpdateGuidanceArticle.mockResolvedValue({
                title: 'Restored Title',
                content: 'Restored Content',
            })
            ;(fromArticleTranslationResponse as jest.Mock).mockReturnValue(
                mockGuidance,
            )

            const { result } = renderHook(() => useRestoreVersionModal())

            await act(async () => {
                await result.current.onRestore()
            })

            expect(mockNotifySuccess).toHaveBeenCalledWith(
                'Version restored as draft.',
            )
        })

        it('should dispatch MARK_AS_SAVED when response is successful', async () => {
            const mockResponse = {
                title: 'Restored Title',
                content: 'Restored Content',
            }
            const mockTransformed: GuidanceArticle = {
                ...mockGuidance,
                title: 'Restored Title',
                content: 'Restored Content',
            }

            mockUpdateGuidanceArticle.mockResolvedValue(mockResponse)
            ;(fromArticleTranslationResponse as jest.Mock).mockReturnValue(
                mockTransformed,
            )

            const { result } = renderHook(() => useRestoreVersionModal())

            await act(async () => {
                await result.current.onRestore()
            })

            expect(fromArticleTranslationResponse).toHaveBeenCalledWith(
                mockResponse,
                { id: mockGuidance.id, templateKey: mockGuidance.templateKey },
            )
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'MARK_AS_SAVED',
                payload: {
                    title: mockResponse.title,
                    content: mockResponse.content,
                    guidance: mockTransformed,
                },
            })
        })

        it('should dispatch CLEAR_HISTORICAL_VERSION on successful restore', async () => {
            mockUpdateGuidanceArticle.mockResolvedValue({
                title: 'Restored Title',
                content: 'Restored Content',
            })
            ;(fromArticleTranslationResponse as jest.Mock).mockReturnValue(
                mockGuidance,
            )

            const { result } = renderHook(() => useRestoreVersionModal())

            await act(async () => {
                await result.current.onRestore()
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'CLEAR_HISTORICAL_VERSION',
            })
        })

        it('should dispatch SET_MODE to read on successful restore', async () => {
            mockUpdateGuidanceArticle.mockResolvedValue({
                title: 'Restored Title',
                content: 'Restored Content',
            })
            ;(fromArticleTranslationResponse as jest.Mock).mockReturnValue(
                mockGuidance,
            )

            const { result } = renderHook(() => useRestoreVersionModal())

            await act(async () => {
                await result.current.onRestore()
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_MODE',
                payload: 'read',
            })
        })

        it('should call config.onUpdateFn on successful restore', async () => {
            mockUpdateGuidanceArticle.mockResolvedValue({
                title: 'Restored Title',
                content: 'Restored Content',
            })
            ;(fromArticleTranslationResponse as jest.Mock).mockReturnValue(
                mockGuidance,
            )

            const { result } = renderHook(() => useRestoreVersionModal())

            await act(async () => {
                await result.current.onRestore()
            })

            expect(mockOnUpdateFn).toHaveBeenCalled()
        })

        it('should not call config.onUpdateFn when it is undefined', async () => {
            mockUpdateGuidanceArticle.mockResolvedValue({
                title: 'Restored Title',
                content: 'Restored Content',
            })
            ;(fromArticleTranslationResponse as jest.Mock).mockReturnValue(
                mockGuidance,
            )
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: defaultState,
                dispatch: mockDispatch,
                config: { ...defaultConfig, onUpdateFn: undefined },
            })

            const { result } = renderHook(() => useRestoreVersionModal())

            await act(async () => {
                await result.current.onRestore()
            })

            // Should not throw error and should complete successfully
            expect(mockNotifySuccess).toHaveBeenCalledWith(
                'Version restored as draft.',
            )
        })

        it('should not dispatch success actions when response is falsy', async () => {
            mockUpdateGuidanceArticle.mockResolvedValue(null)

            const { result } = renderHook(() => useRestoreVersionModal())

            await act(async () => {
                await result.current.onRestore()
            })

            expect(mockDispatch).not.toHaveBeenCalledWith(
                expect.objectContaining({ type: 'MARK_AS_SAVED' }),
            )
            expect(mockDispatch).not.toHaveBeenCalledWith({
                type: 'CLEAR_HISTORICAL_VERSION',
            })
            expect(mockNotifySuccess).not.toHaveBeenCalled()
        })

        it('should show error notification on failure', async () => {
            mockUpdateGuidanceArticle.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(() => useRestoreVersionModal())

            await act(async () => {
                await result.current.onRestore()
            })

            expect(mockNotifyError).toHaveBeenCalledWith(
                'An error occurred while restoring version.',
            )
        })

        it('should dispatch SET_UPDATING false in finally block on success', async () => {
            mockUpdateGuidanceArticle.mockResolvedValue({
                title: 'Restored Title',
                content: 'Restored Content',
            })
            ;(fromArticleTranslationResponse as jest.Mock).mockReturnValue(
                mockGuidance,
            )

            const { result } = renderHook(() => useRestoreVersionModal())

            await act(async () => {
                await result.current.onRestore()
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: false,
            })
        })

        it('should dispatch SET_UPDATING false in finally block on error', async () => {
            mockUpdateGuidanceArticle.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(() => useRestoreVersionModal())

            await act(async () => {
                await result.current.onRestore()
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: false,
            })
        })

        it('should dispatch CLOSE_MODAL in finally block on success', async () => {
            mockUpdateGuidanceArticle.mockResolvedValue({
                title: 'Restored Title',
                content: 'Restored Content',
            })
            ;(fromArticleTranslationResponse as jest.Mock).mockReturnValue(
                mockGuidance,
            )

            const { result } = renderHook(() => useRestoreVersionModal())

            await act(async () => {
                await result.current.onRestore()
            })

            expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' })
        })

        it('should dispatch CLOSE_MODAL in finally block on error', async () => {
            mockUpdateGuidanceArticle.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(() => useRestoreVersionModal())

            await act(async () => {
                await result.current.onRestore()
            })

            expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' })
        })

        it('should handle guidance without templateKey', async () => {
            const guidanceWithoutTemplate: GuidanceArticle = {
                ...mockGuidance,
                templateKey: null,
            }
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, guidance: guidanceWithoutTemplate },
                dispatch: mockDispatch,
                config: defaultConfig,
            })
            mockUpdateGuidanceArticle.mockResolvedValue({
                title: 'Restored Title',
                content: 'Restored Content',
            })
            ;(fromArticleTranslationResponse as jest.Mock).mockReturnValue(
                guidanceWithoutTemplate,
            )

            const { result } = renderHook(() => useRestoreVersionModal())

            await act(async () => {
                await result.current.onRestore()
            })

            expect(fromArticleTranslationResponse).toHaveBeenCalledWith(
                expect.anything(),
                { id: guidanceWithoutTemplate.id, templateKey: null },
            )
        })

        it('should track version restored event on successful restore', async () => {
            mockUpdateGuidanceArticle.mockResolvedValue({
                title: 'Restored Title',
                content: 'Restored Content',
            })
            ;(fromArticleTranslationResponse as jest.Mock).mockReturnValue(
                mockGuidance,
            )

            const { result } = renderHook(() => useRestoreVersionModal())

            await act(async () => {
                await result.current.onRestore()
            })

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentVersionHistoryVersionRestored,
                {
                    shopName: 'test-shop',
                    resourceType: 'guidance',
                    resourceId: mockGuidance.id,
                    helpCenterId: 1,
                    locale: 'en-US',
                    versionId: mockHistoricalVersion.versionId,
                    versionNumber: mockHistoricalVersion.version,
                    publishedDatetime: mockHistoricalVersion.publishedDatetime,
                },
            )
        })

        it('should not track version restored event when response is falsy', async () => {
            mockUpdateGuidanceArticle.mockResolvedValue(null)

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
            mockUpdateGuidanceArticle.mockRejectedValue(new Error('API Error'))

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

    describe('useGuidanceArticleMutation initialization', () => {
        it('should pass correct guidanceHelpCenterId to useGuidanceArticleMutation', () => {
            renderHook(() => useRestoreVersionModal())

            expect(useGuidanceArticleMutation).toHaveBeenCalledWith({
                guidanceHelpCenterId: 1,
            })
        })

        it('should pass 0 when guidanceHelpCenter is undefined', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: defaultState,
                dispatch: mockDispatch,
                config: { ...defaultConfig, guidanceHelpCenter: undefined },
            })

            renderHook(() => useRestoreVersionModal())

            expect(useGuidanceArticleMutation).toHaveBeenCalledWith({
                guidanceHelpCenterId: 0,
            })
        })
    })

    describe('return value shape', () => {
        it('should return all expected properties', () => {
            const { result } = renderHook(() => useRestoreVersionModal())

            expect(result.current).toHaveProperty('isOpen')
            expect(result.current).toHaveProperty('isRestoring')
            expect(result.current).toHaveProperty('onClose')
            expect(result.current).toHaveProperty('onRestore')
            expect(typeof result.current.onClose).toBe('function')
            expect(typeof result.current.onRestore).toBe('function')
        })
    })
})
