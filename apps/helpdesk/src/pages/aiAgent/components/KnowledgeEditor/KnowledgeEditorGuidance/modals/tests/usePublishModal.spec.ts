import { act, renderHook } from '@repo/testing'

import { useNotify } from 'hooks/useNotify'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import type { GuidanceArticle } from 'pages/aiAgent/types'

import {
    fromArticleTranslationResponse,
    useGuidanceContext,
} from '../../context'
import type { GuidanceState } from '../../context/types'
import { usePublishModal } from '../usePublishModal'

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

describe('usePublishModal', () => {
    const mockDispatch = jest.fn()
    const mockNotifyError = jest.fn()
    const mockNotifySuccess = jest.fn()
    const mockUpdateGuidanceArticle = jest.fn()
    const mockOnUpdateFn = jest.fn()

    const mockGuidance: GuidanceArticle = {
        id: 123,
        title: 'Test Title',
        content: 'Test Content',
        locale: 'en-US',
        visibility: 'PUBLIC',
        createdDatetime: '2024-01-01T00:00:00Z',
        lastUpdated: '2024-01-01T00:00:00Z',
        templateKey: 'test-template',
        isCurrent: false,
        draftVersionId: 1,
        publishedVersionId: 2,
    }

    const defaultState: GuidanceState = {
        guidanceMode: 'edit',
        isFullscreen: false,
        isDetailsView: true,
        title: 'Test Title',
        content: 'Test Content',
        visibility: true,
        savedSnapshot: { title: 'Test Title', content: 'Test Content' },
        guidance: mockGuidance,
        isAutoSaving: false,
        hasAutoSavedInSession: false,
        autoSaveError: false,
        isFromTemplate: false,
        hasTemplateChanges: false,
        versionStatus: 'latest_draft',
        activeModal: 'publish',
        isUpdating: false,
        historicalVersion: null,
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
        ;(fromArticleTranslationResponse as jest.Mock).mockImplementation(
            (response, options) => ({
                ...response,
                ...options,
            }),
        )
    })

    describe('isOpen', () => {
        it('should return true when activeModal is publish and not first publish', () => {
            const { result } = renderHook(() => usePublishModal())

            expect(result.current.isOpen).toBe(true)
        })

        it('should return false when activeModal is publish but is first publish', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    guidance: { ...mockGuidance, publishedVersionId: null },
                },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => usePublishModal())

            expect(result.current.isOpen).toBe(false)
        })

        it('should return false when activeModal is null', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, activeModal: null },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => usePublishModal())

            expect(result.current.isOpen).toBe(false)
        })

        it('should return false when activeModal is different', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, activeModal: 'delete' },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => usePublishModal())

            expect(result.current.isOpen).toBe(false)
        })

        it('should return false when activeModal is unsaved', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, activeModal: 'unsaved' },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => usePublishModal())

            expect(result.current.isOpen).toBe(false)
        })
    })

    describe('first publish', () => {
        it('should auto-publish with empty commit message on first publish', async () => {
            mockUpdateGuidanceArticle.mockResolvedValue({
                title: 'Updated Title',
                content: 'Updated Content',
            })
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    guidance: { ...mockGuidance, publishedVersionId: null },
                },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            renderHook(() => usePublishModal())

            await act(async () => {
                await Promise.resolve()
            })

            expect(mockUpdateGuidanceArticle).toHaveBeenCalledWith(
                {
                    isCurrent: true,
                    commitMessage: undefined,
                },
                {
                    articleId: 123,
                    locale: 'en-US',
                },
            )
        })

        it('should not auto-publish when not first publish', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    guidance: { ...mockGuidance, publishedVersionId: 2 },
                },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            renderHook(() => usePublishModal())

            expect(mockUpdateGuidanceArticle).not.toHaveBeenCalled()
        })

        it('should not auto-publish when activeModal is not publish', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    activeModal: null,
                    guidance: { ...mockGuidance, publishedVersionId: null },
                },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            renderHook(() => usePublishModal())

            expect(mockUpdateGuidanceArticle).not.toHaveBeenCalled()
        })
    })

    describe('isPublishing', () => {
        it('should return false when isUpdating is false', () => {
            const { result } = renderHook(() => usePublishModal())

            expect(result.current.isPublishing).toBe(false)
        })

        it('should return true when isUpdating is true', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, isUpdating: true },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => usePublishModal())

            expect(result.current.isPublishing).toBe(true)
        })
    })

    describe('onClose', () => {
        it('should dispatch CLOSE_MODAL action', () => {
            const { result } = renderHook(() => usePublishModal())

            act(() => {
                result.current.onClose()
            })

            expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' })
        })
    })

    describe('onPublish', () => {
        it('should early return when guidance id is undefined', async () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, guidance: undefined },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockUpdateGuidanceArticle).not.toHaveBeenCalled()
            expect(mockDispatch).not.toHaveBeenCalled()
        })

        it('should early return when guidance.id is null', async () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    guidance: { ...mockGuidance, id: undefined },
                },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
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

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockUpdateGuidanceArticle).not.toHaveBeenCalled()
            expect(mockDispatch).not.toHaveBeenCalled()
        })

        it('should dispatch SET_UPDATING true at start', async () => {
            mockUpdateGuidanceArticle.mockResolvedValue({
                title: 'Updated Title',
                content: 'Updated Content',
            })

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: true,
            })
        })

        it('should call updateGuidanceArticle with correct params', async () => {
            mockUpdateGuidanceArticle.mockResolvedValue({
                title: 'Updated Title',
                content: 'Updated Content',
            })

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockUpdateGuidanceArticle).toHaveBeenCalledWith(
                {
                    isCurrent: true,
                    commitMessage: 'Test commit message',
                },
                {
                    articleId: 123,
                    locale: 'en-US',
                },
            )
        })

        it('should pass undefined commitMessage when empty string provided', async () => {
            mockUpdateGuidanceArticle.mockResolvedValue({
                title: 'Updated Title',
                content: 'Updated Content',
            })

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('')
            })

            expect(mockUpdateGuidanceArticle).toHaveBeenCalledWith(
                {
                    isCurrent: true,
                    commitMessage: undefined,
                },
                {
                    articleId: 123,
                    locale: 'en-US',
                },
            )
        })

        it('should dispatch MARK_AS_SAVED on success', async () => {
            const mockResponse = {
                title: 'Updated Title',
                content: 'Updated Content',
            }
            mockUpdateGuidanceArticle.mockResolvedValue(mockResponse)
            ;(fromArticleTranslationResponse as jest.Mock).mockReturnValue({
                ...mockResponse,
                id: 123,
                templateKey: 'test-template',
            })

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'MARK_AS_SAVED',
                payload: {
                    title: 'Updated Title',
                    content: 'Updated Content',
                    guidance: {
                        title: 'Updated Title',
                        content: 'Updated Content',
                        id: 123,
                        templateKey: 'test-template',
                    },
                },
            })
        })

        it('should dispatch SET_MODE to read on success', async () => {
            mockUpdateGuidanceArticle.mockResolvedValue({
                title: 'Updated Title',
                content: 'Updated Content',
            })

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_MODE',
                payload: 'read',
            })
        })

        it('should show success notification on success', async () => {
            mockUpdateGuidanceArticle.mockResolvedValue({
                title: 'Updated Title',
                content: 'Updated Content',
            })

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockNotifySuccess).toHaveBeenCalledWith(
                'Guidance published successfully.',
            )
        })

        it('should call onUpdateFn callback on success', async () => {
            mockUpdateGuidanceArticle.mockResolvedValue({
                title: 'Updated Title',
                content: 'Updated Content',
            })

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockOnUpdateFn).toHaveBeenCalled()
        })

        it('should not throw when onUpdateFn is undefined', async () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: defaultState,
                dispatch: mockDispatch,
                config: { ...defaultConfig, onUpdateFn: undefined },
            })
            mockUpdateGuidanceArticle.mockResolvedValue({
                title: 'Updated Title',
                content: 'Updated Content',
            })

            const { result } = renderHook(() => usePublishModal())

            await expect(
                act(async () => {
                    await result.current.onPublish('Test commit message')
                }),
            ).resolves.not.toThrow()
        })

        it('should show error notification on failure', async () => {
            mockUpdateGuidanceArticle.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockNotifyError).toHaveBeenCalledWith(
                'An error occurred while publishing guidance.',
            )
        })

        it('should show formatted API message on 409 conflict error with a single intent', async () => {
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
            mockUpdateGuidanceArticle.mockRejectedValue(conflictError)

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockNotifyError).toHaveBeenCalledWith(
                'The following intents are already used by other published articles in this help center: Marketing/unsubscribe',
            )
        })

        it('should format multiple intents in 409 conflict error', async () => {
            const conflictError = {
                isAxiosError: true,
                response: {
                    status: 409,
                    data: {
                        error: {
                            msg: 'The following intents are already used by other published articles in this help center: marketing::unsubscribe, order::status',
                        },
                    },
                },
            }
            mockUpdateGuidanceArticle.mockRejectedValue(conflictError)

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockNotifyError).toHaveBeenCalledWith(
                'The following intents are already used by other published articles in this help center: Marketing/unsubscribe, Order/status',
            )
        })

        it('should show generic error for non-409 API errors', async () => {
            const serverError = {
                isAxiosError: true,
                response: {
                    status: 500,
                    data: {
                        error: {
                            msg: 'Internal server error',
                        },
                    },
                },
            }
            mockUpdateGuidanceArticle.mockRejectedValue(serverError)

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockNotifyError).toHaveBeenCalledWith(
                'An error occurred while publishing guidance.',
            )
        })

        it('should not call onUpdateFn on failure', async () => {
            mockUpdateGuidanceArticle.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockOnUpdateFn).not.toHaveBeenCalled()
        })

        it('should not dispatch MARK_AS_SAVED on failure', async () => {
            mockUpdateGuidanceArticle.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockDispatch).not.toHaveBeenCalledWith(
                expect.objectContaining({ type: 'MARK_AS_SAVED' }),
            )
        })

        it('should not dispatch SET_MODE on failure', async () => {
            mockUpdateGuidanceArticle.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockDispatch).not.toHaveBeenCalledWith(
                expect.objectContaining({ type: 'SET_MODE' }),
            )
        })

        it('should dispatch SET_UPDATING false in finally block on success', async () => {
            mockUpdateGuidanceArticle.mockResolvedValue({
                title: 'Updated Title',
                content: 'Updated Content',
            })

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: false,
            })
        })

        it('should dispatch SET_UPDATING false in finally block on error', async () => {
            mockUpdateGuidanceArticle.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: false,
            })
        })

        it('should dispatch CLOSE_MODAL in finally block on success', async () => {
            mockUpdateGuidanceArticle.mockResolvedValue({
                title: 'Updated Title',
                content: 'Updated Content',
            })

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' })
        })

        it('should dispatch CLOSE_MODAL in finally block on error', async () => {
            mockUpdateGuidanceArticle.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' })
        })

        it('should not dispatch success actions when response is falsy', async () => {
            mockUpdateGuidanceArticle.mockResolvedValue(null)

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockDispatch).not.toHaveBeenCalledWith(
                expect.objectContaining({ type: 'MARK_AS_SAVED' }),
            )
            expect(mockDispatch).not.toHaveBeenCalledWith(
                expect.objectContaining({ type: 'SET_MODE' }),
            )
            expect(mockNotifySuccess).not.toHaveBeenCalled()
            expect(mockOnUpdateFn).not.toHaveBeenCalled()
        })

        it('should handle null templateKey in guidance', async () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    guidance: { ...mockGuidance, templateKey: null },
                },
                dispatch: mockDispatch,
                config: defaultConfig,
            })
            const mockResponse = {
                title: 'Updated Title',
                content: 'Updated Content',
            }
            mockUpdateGuidanceArticle.mockResolvedValue(mockResponse)

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(fromArticleTranslationResponse).toHaveBeenCalledWith(
                mockResponse,
                {
                    id: 123,
                    templateKey: null,
                },
            )
        })
    })

    describe('useGuidanceArticleMutation initialization', () => {
        it('should pass correct guidanceHelpCenterId to useGuidanceArticleMutation', () => {
            renderHook(() => usePublishModal())

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

            renderHook(() => usePublishModal())

            expect(useGuidanceArticleMutation).toHaveBeenCalledWith({
                guidanceHelpCenterId: 0,
            })
        })

        it('should pass 0 when guidanceHelpCenter.id is undefined', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: defaultState,
                dispatch: mockDispatch,
                config: {
                    ...defaultConfig,
                    guidanceHelpCenter: { default_locale: 'en-US' },
                },
            })

            renderHook(() => usePublishModal())

            expect(useGuidanceArticleMutation).toHaveBeenCalledWith({
                guidanceHelpCenterId: 0,
            })
        })
    })

    describe('return value shape', () => {
        it('should return all expected properties', () => {
            const { result } = renderHook(() => usePublishModal())

            expect(result.current).toHaveProperty('isOpen')
            expect(result.current).toHaveProperty('isPublishing')
            expect(result.current).toHaveProperty('onClose')
            expect(result.current).toHaveProperty('onPublish')
            expect(typeof result.current.onClose).toBe('function')
            expect(typeof result.current.onPublish).toBe('function')
        })
    })
})
