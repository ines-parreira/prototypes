import { act, renderHook } from '@repo/testing'

import { useNotify } from 'hooks/useNotify'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import type { GuidanceArticle } from 'pages/aiAgent/types'

import { useGuidanceContext } from '../../context'
import type { GuidanceState } from '../../context/types'
import { useDeleteModal } from '../useDeleteModal'

jest.mock('hooks/useNotify', () => ({
    useNotify: jest.fn(),
}))

jest.mock('pages/aiAgent/hooks/useGuidanceArticleMutation', () => ({
    useGuidanceArticleMutation: jest.fn(),
}))

jest.mock('../../context', () => ({
    useGuidanceContext: jest.fn(),
}))

describe('useDeleteModal', () => {
    const mockDispatch = jest.fn()
    const mockNotifyError = jest.fn()
    const mockDeleteGuidanceArticle = jest.fn()
    const mockOnClose = jest.fn()
    const mockOnDeleteFn = jest.fn()

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
        autoSaveError: false,
        isFromTemplate: false,
        hasTemplateChanges: false,
        versionStatus: 'latest_draft',
        activeModal: 'delete',
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
        onDeleteFn: mockOnDeleteFn,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useNotify as jest.Mock).mockReturnValue({
            error: mockNotifyError,
        })
        ;(useGuidanceArticleMutation as jest.Mock).mockReturnValue({
            deleteGuidanceArticle: mockDeleteGuidanceArticle,
        })
        ;(useGuidanceContext as jest.Mock).mockReturnValue({
            state: defaultState,
            dispatch: mockDispatch,
            config: defaultConfig,
        })
    })

    describe('isOpen', () => {
        it('should return true when activeModal is delete', () => {
            const { result } = renderHook(() => useDeleteModal())

            expect(result.current.isOpen).toBe(true)
        })

        it('should return false when activeModal is null', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, activeModal: null },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useDeleteModal())

            expect(result.current.isOpen).toBe(false)
        })

        it('should return false when activeModal is different', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, activeModal: 'unsaved' },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useDeleteModal())

            expect(result.current.isOpen).toBe(false)
        })

        it('should return false when activeModal is discard', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, activeModal: 'discard' },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useDeleteModal())

            expect(result.current.isOpen).toBe(false)
        })
    })

    describe('isDeleting', () => {
        it('should return false when isUpdating is false', () => {
            const { result } = renderHook(() => useDeleteModal())

            expect(result.current.isDeleting).toBe(false)
        })

        it('should return true when isUpdating is true', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, isUpdating: true },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useDeleteModal())

            expect(result.current.isDeleting).toBe(true)
        })
    })

    describe('onClose', () => {
        it('should dispatch CLOSE_MODAL action', () => {
            const { result } = renderHook(() => useDeleteModal())

            act(() => {
                result.current.onClose()
            })

            expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' })
        })
    })

    describe('onDelete', () => {
        it('should early return when guidance id is undefined', async () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, guidance: undefined },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useDeleteModal())

            await act(async () => {
                await result.current.onDelete()
            })

            expect(mockDeleteGuidanceArticle).not.toHaveBeenCalled()
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

            const { result } = renderHook(() => useDeleteModal())

            await act(async () => {
                await result.current.onDelete()
            })

            expect(mockDeleteGuidanceArticle).not.toHaveBeenCalled()
            expect(mockDispatch).not.toHaveBeenCalled()
        })

        it('should dispatch SET_UPDATING true at start', async () => {
            mockDeleteGuidanceArticle.mockResolvedValue(undefined)

            const { result } = renderHook(() => useDeleteModal())

            await act(async () => {
                await result.current.onDelete()
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: true,
            })
        })

        it('should call deleteGuidanceArticle with correct id', async () => {
            mockDeleteGuidanceArticle.mockResolvedValue(undefined)

            const { result } = renderHook(() => useDeleteModal())

            await act(async () => {
                await result.current.onDelete()
            })

            expect(mockDeleteGuidanceArticle).toHaveBeenCalledWith(123)
        })

        it('should call onDeleteFn callback on success', async () => {
            mockDeleteGuidanceArticle.mockResolvedValue(undefined)

            const { result } = renderHook(() => useDeleteModal())

            await act(async () => {
                await result.current.onDelete()
            })

            expect(mockOnDeleteFn).toHaveBeenCalled()
        })

        it('should not throw when onDeleteFn is undefined', async () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: defaultState,
                dispatch: mockDispatch,
                config: { ...defaultConfig, onDeleteFn: undefined },
            })
            mockDeleteGuidanceArticle.mockResolvedValue(undefined)

            const { result } = renderHook(() => useDeleteModal())

            await expect(
                act(async () => {
                    await result.current.onDelete()
                }),
            ).resolves.not.toThrow()
        })

        it('should show error notification on failure', async () => {
            mockDeleteGuidanceArticle.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(() => useDeleteModal())

            await act(async () => {
                await result.current.onDelete()
            })

            expect(mockNotifyError).toHaveBeenCalledWith(
                'An error occurred while deleting guidance.',
            )
        })

        it('should not call onDeleteFn on failure', async () => {
            mockDeleteGuidanceArticle.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(() => useDeleteModal())

            await act(async () => {
                await result.current.onDelete()
            })

            expect(mockOnDeleteFn).not.toHaveBeenCalled()
        })

        it('should dispatch SET_UPDATING false in finally block on success', async () => {
            mockDeleteGuidanceArticle.mockResolvedValue(undefined)

            const { result } = renderHook(() => useDeleteModal())

            await act(async () => {
                await result.current.onDelete()
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: false,
            })
        })

        it('should dispatch SET_UPDATING false in finally block on error', async () => {
            mockDeleteGuidanceArticle.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(() => useDeleteModal())

            await act(async () => {
                await result.current.onDelete()
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: false,
            })
        })

        it('should dispatch CLOSE_MODAL in finally block on success', async () => {
            mockDeleteGuidanceArticle.mockResolvedValue(undefined)

            const { result } = renderHook(() => useDeleteModal())

            await act(async () => {
                await result.current.onDelete()
            })

            expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' })
        })

        it('should dispatch CLOSE_MODAL in finally block on error', async () => {
            mockDeleteGuidanceArticle.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(() => useDeleteModal())

            await act(async () => {
                await result.current.onDelete()
            })

            expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' })
        })

        it('should call config.onClose in finally block on success', async () => {
            mockDeleteGuidanceArticle.mockResolvedValue(undefined)

            const { result } = renderHook(() => useDeleteModal())

            await act(async () => {
                await result.current.onDelete()
            })

            expect(mockOnClose).toHaveBeenCalled()
        })

        it('should call config.onClose in finally block on error', async () => {
            mockDeleteGuidanceArticle.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(() => useDeleteModal())

            await act(async () => {
                await result.current.onDelete()
            })

            expect(mockOnClose).toHaveBeenCalled()
        })

        it('should not throw when config.onClose is undefined', async () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: defaultState,
                dispatch: mockDispatch,
                config: { ...defaultConfig, onClose: undefined },
            })
            mockDeleteGuidanceArticle.mockResolvedValue(undefined)

            const { result } = renderHook(() => useDeleteModal())

            await expect(
                act(async () => {
                    await result.current.onDelete()
                }),
            ).resolves.not.toThrow()
        })
    })

    describe('useGuidanceArticleMutation initialization', () => {
        it('should pass correct guidanceHelpCenterId to useGuidanceArticleMutation', () => {
            renderHook(() => useDeleteModal())

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

            renderHook(() => useDeleteModal())

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

            renderHook(() => useDeleteModal())

            expect(useGuidanceArticleMutation).toHaveBeenCalledWith({
                guidanceHelpCenterId: 0,
            })
        })
    })

    describe('hasBothVersions', () => {
        it('should return true when both draft and published versions exist', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    guidance: {
                        ...mockGuidance,
                        publishedVersionId: 1,
                        draftVersionId: 2,
                    },
                },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useDeleteModal())

            expect(result.current.hasBothVersions).toBe(true)
        })

        it('should return false when only draft version exists', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    guidance: {
                        ...mockGuidance,
                        publishedVersionId: null,
                        draftVersionId: 1,
                    },
                },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useDeleteModal())

            expect(result.current.hasBothVersions).toBe(false)
        })

        it('should return false when draft and published are the same', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    guidance: {
                        ...mockGuidance,
                        publishedVersionId: 1,
                        draftVersionId: 1,
                    },
                },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useDeleteModal())

            expect(result.current.hasBothVersions).toBe(false)
        })

        it('should return false when guidance is undefined', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    guidance: undefined,
                },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useDeleteModal())

            expect(result.current.hasBothVersions).toBe(false)
        })
    })

    describe('return value shape', () => {
        it('should return all expected properties', () => {
            const { result } = renderHook(() => useDeleteModal())

            expect(result.current).toHaveProperty('isOpen')
            expect(result.current).toHaveProperty('isDeleting')
            expect(result.current).toHaveProperty('hasBothVersions')
            expect(result.current).toHaveProperty('onClose')
            expect(result.current).toHaveProperty('onDelete')
            expect(typeof result.current.onClose).toBe('function')
            expect(typeof result.current.onDelete).toBe('function')
        })
    })
})
