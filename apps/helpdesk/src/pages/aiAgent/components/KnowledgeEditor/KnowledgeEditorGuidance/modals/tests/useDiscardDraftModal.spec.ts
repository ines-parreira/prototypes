import { act, renderHook } from '@repo/testing'

import { useNotify } from 'hooks/useNotify'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import type { GuidanceArticle } from 'pages/aiAgent/types'

import {
    fromArticleTranslationResponse,
    useGuidanceContext,
} from '../../context'
import type { GuidanceState } from '../../context/types'
import { useDiscardDraftModal } from '../useDiscardDraftModal'

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

describe('useDiscardDraftModal', () => {
    const mockDispatch = jest.fn()
    const mockNotifyError = jest.fn()
    const mockNotifySuccess = jest.fn()
    const mockDiscardGuidanceDraft = jest.fn()
    const mockOnClose = jest.fn()

    const mockGuidance: GuidanceArticle = {
        id: 123,
        title: 'Test Title',
        content: 'Test Content',
        locale: 'en-US',
        visibility: 'PUBLIC',
        createdDatetime: '2024-01-01T00:00:00Z',
        lastUpdated: '2024-01-01T00:00:00Z',
        templateKey: null,
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
        isFromTemplate: false,
        hasTemplateChanges: false,
        versionStatus: 'latest_draft',
        activeModal: 'discard',
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
        onClose: mockOnClose,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useNotify as jest.Mock).mockReturnValue({
            error: mockNotifyError,
            success: mockNotifySuccess,
        })
        ;(useGuidanceArticleMutation as jest.Mock).mockReturnValue({
            discardGuidanceDraft: mockDiscardGuidanceDraft,
        })
        ;(useGuidanceContext as jest.Mock).mockReturnValue({
            state: defaultState,
            dispatch: mockDispatch,
            config: defaultConfig,
        })
    })

    describe('isOpen', () => {
        it('should return true when activeModal is discard', () => {
            const { result } = renderHook(() => useDiscardDraftModal())

            expect(result.current.isOpen).toBe(true)
        })

        it('should return false when activeModal is null', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, activeModal: null },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useDiscardDraftModal())

            expect(result.current.isOpen).toBe(false)
        })

        it('should return false when activeModal is different', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, activeModal: 'unsaved' },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useDiscardDraftModal())

            expect(result.current.isOpen).toBe(false)
        })
    })

    describe('isDiscarding', () => {
        it('should return false when isUpdating is false', () => {
            const { result } = renderHook(() => useDiscardDraftModal())

            expect(result.current.isDiscarding).toBe(false)
        })

        it('should return true when isUpdating is true', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, isUpdating: true },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useDiscardDraftModal())

            expect(result.current.isDiscarding).toBe(true)
        })
    })

    describe('onClose', () => {
        it('should dispatch CLOSE_MODAL action', () => {
            const { result } = renderHook(() => useDiscardDraftModal())

            act(() => {
                result.current.onClose()
            })

            expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' })
        })
    })

    describe('onDiscard', () => {
        it('should early return when guidance id is undefined', async () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, guidance: undefined },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useDiscardDraftModal())

            await act(async () => {
                await result.current.onDiscard()
            })

            expect(mockDiscardGuidanceDraft).not.toHaveBeenCalled()
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

            const { result } = renderHook(() => useDiscardDraftModal())

            await act(async () => {
                await result.current.onDiscard()
            })

            expect(mockDiscardGuidanceDraft).not.toHaveBeenCalled()
            expect(mockDispatch).not.toHaveBeenCalled()
        })

        it('should early return when guidanceHelpCenter is undefined', async () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: defaultState,
                dispatch: mockDispatch,
                config: { ...defaultConfig, guidanceHelpCenter: undefined },
            })

            const { result } = renderHook(() => useDiscardDraftModal())

            await act(async () => {
                await result.current.onDiscard()
            })

            expect(mockDiscardGuidanceDraft).not.toHaveBeenCalled()
            expect(mockDispatch).not.toHaveBeenCalled()
        })

        it('should dispatch SET_UPDATING true at start', async () => {
            mockDiscardGuidanceDraft.mockResolvedValue({ title: 'Published' })
            ;(fromArticleTranslationResponse as jest.Mock).mockReturnValue(
                fromArticleTranslationResponse,
            )

            const { result } = renderHook(() => useDiscardDraftModal())

            await act(async () => {
                await result.current.onDiscard()
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: true,
            })
        })

        it('should call discardGuidanceDraft with correct params', async () => {
            mockDiscardGuidanceDraft.mockResolvedValue({ title: 'Published' })
            ;(fromArticleTranslationResponse as jest.Mock).mockReturnValue(
                fromArticleTranslationResponse,
            )

            const { result } = renderHook(() => useDiscardDraftModal())

            await act(async () => {
                await result.current.onDiscard()
            })

            expect(mockDiscardGuidanceDraft).toHaveBeenCalledWith(123, 'en-US')
        })

        it('should show success notification on successful discard', async () => {
            mockDiscardGuidanceDraft.mockResolvedValue({ title: 'Published' })
            ;(fromArticleTranslationResponse as jest.Mock).mockReturnValue(
                fromArticleTranslationResponse,
            )

            const { result } = renderHook(() => useDiscardDraftModal())

            await act(async () => {
                await result.current.onDiscard()
            })

            expect(mockNotifySuccess).toHaveBeenCalledWith('Draft discarded')
        })

        it('should dispatch SWITCH_VERSION when response has title', async () => {
            const mockResponse = {
                title: 'Published Title',
                content: 'Published Content',
            }
            const mockTransformed: GuidanceArticle = {
                ...mockGuidance,
                title: 'Published Title',
                content: 'Published Content',
                isCurrent: true,
            }

            mockDiscardGuidanceDraft.mockResolvedValue(mockResponse)
            ;(fromArticleTranslationResponse as jest.Mock).mockReturnValue(
                mockTransformed,
            )

            const { result } = renderHook(() => useDiscardDraftModal())

            await act(async () => {
                await result.current.onDiscard()
            })

            expect(fromArticleTranslationResponse).toHaveBeenCalledWith(
                mockResponse,
                { id: mockGuidance.id },
            )
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SWITCH_VERSION',
                payload: mockTransformed,
            })
        })

        it('should call config.onClose when response has no title (article deleted)', async () => {
            mockDiscardGuidanceDraft.mockResolvedValue({})

            const { result } = renderHook(() => useDiscardDraftModal())

            await act(async () => {
                await result.current.onDiscard()
            })

            expect(mockOnClose).toHaveBeenCalled()
            expect(mockDispatch).not.toHaveBeenCalledWith(
                expect.objectContaining({ type: 'SWITCH_VERSION' }),
            )
        })

        it('should call config.onClose when response is null', async () => {
            mockDiscardGuidanceDraft.mockResolvedValue(null)

            const { result } = renderHook(() => useDiscardDraftModal())

            await act(async () => {
                await result.current.onDiscard()
            })

            expect(mockOnClose).toHaveBeenCalled()
        })

        it('should call config.onClose when response is undefined', async () => {
            mockDiscardGuidanceDraft.mockResolvedValue(undefined)

            const { result } = renderHook(() => useDiscardDraftModal())

            await act(async () => {
                await result.current.onDiscard()
            })

            expect(mockOnClose).toHaveBeenCalled()
        })

        it('should call config.onUpdateFn when discard is successful and response has title', async () => {
            const mockOnUpdateFn = jest.fn()
            const mockResponse = {
                title: 'Published Title',
                content: 'Published Content',
            }
            const mockTransformed: GuidanceArticle = {
                ...mockGuidance,
                title: 'Published Title',
                content: 'Published Content',
                isCurrent: true,
            }

            mockDiscardGuidanceDraft.mockResolvedValue(mockResponse)
            ;(fromArticleTranslationResponse as jest.Mock).mockReturnValue(
                mockTransformed,
            )
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: defaultState,
                dispatch: mockDispatch,
                config: { ...defaultConfig, onUpdateFn: mockOnUpdateFn },
            })

            const { result } = renderHook(() => useDiscardDraftModal())

            await act(async () => {
                await result.current.onDiscard()
            })

            expect(mockOnUpdateFn).toHaveBeenCalled()
        })

        it('should call config.onUpdateFn when discard is successful and response has no title', async () => {
            const mockOnUpdateFn = jest.fn()

            mockDiscardGuidanceDraft.mockResolvedValue(null)
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: defaultState,
                dispatch: mockDispatch,
                config: { ...defaultConfig, onUpdateFn: mockOnUpdateFn },
            })

            const { result } = renderHook(() => useDiscardDraftModal())

            await act(async () => {
                await result.current.onDiscard()
            })

            expect(mockOnUpdateFn).toHaveBeenCalled()
        })

        it('should not call config.onUpdateFn when it is undefined', async () => {
            const mockResponse = {
                title: 'Published Title',
                content: 'Published Content',
            }

            mockDiscardGuidanceDraft.mockResolvedValue(mockResponse)
            ;(fromArticleTranslationResponse as jest.Mock).mockReturnValue(
                mockGuidance,
            )

            const { result } = renderHook(() => useDiscardDraftModal())

            await act(async () => {
                await result.current.onDiscard()
            })

            // Should not throw error and should complete successfully
            expect(mockNotifySuccess).toHaveBeenCalledWith('Draft discarded')
        })

        it('should show error notification on failure', async () => {
            mockDiscardGuidanceDraft.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(() => useDiscardDraftModal())

            await act(async () => {
                await result.current.onDiscard()
            })

            expect(mockNotifyError).toHaveBeenCalledWith(
                'An error occurred while discarding draft.',
            )
        })

        it('should dispatch SET_UPDATING false in finally block on success', async () => {
            mockDiscardGuidanceDraft.mockResolvedValue({ title: 'Published' })
            ;(fromArticleTranslationResponse as jest.Mock).mockReturnValue(
                mockGuidance,
            )

            const { result } = renderHook(() => useDiscardDraftModal())

            await act(async () => {
                await result.current.onDiscard()
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: false,
            })
        })

        it('should dispatch SET_UPDATING false in finally block on error', async () => {
            mockDiscardGuidanceDraft.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(() => useDiscardDraftModal())

            await act(async () => {
                await result.current.onDiscard()
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: false,
            })
        })

        it('should dispatch CLOSE_MODAL in finally block on success', async () => {
            mockDiscardGuidanceDraft.mockResolvedValue({ title: 'Published' })
            ;(fromArticleTranslationResponse as jest.Mock).mockReturnValue(
                mockGuidance,
            )

            const { result } = renderHook(() => useDiscardDraftModal())

            await act(async () => {
                await result.current.onDiscard()
            })

            expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' })
        })

        it('should dispatch CLOSE_MODAL in finally block on error', async () => {
            mockDiscardGuidanceDraft.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(() => useDiscardDraftModal())

            await act(async () => {
                await result.current.onDiscard()
            })

            expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' })
        })
    })

    describe('useGuidanceArticleMutation initialization', () => {
        it('should pass correct guidanceHelpCenterId to useGuidanceArticleMutation', () => {
            renderHook(() => useDiscardDraftModal())

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

            renderHook(() => useDiscardDraftModal())

            expect(useGuidanceArticleMutation).toHaveBeenCalledWith({
                guidanceHelpCenterId: 0,
            })
        })
    })

    describe('return value shape', () => {
        it('should return all expected properties', () => {
            const { result } = renderHook(() => useDiscardDraftModal())

            expect(result.current).toHaveProperty('isOpen')
            expect(result.current).toHaveProperty('isDiscarding')
            expect(result.current).toHaveProperty('onClose')
            expect(result.current).toHaveProperty('onDiscard')
            expect(typeof result.current.onClose).toBe('function')
            expect(typeof result.current.onDiscard).toBe('function')
        })
    })
})
