import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { useSkillDeleteModal } from './useSkillDeleteModal'

const mockDispatch = jest.fn()
const mockDeleteGuidanceArticle = jest.fn()
const mockNotifySuccess = jest.fn()
const mockNotifyError = jest.fn()
const mockOnDeleteFn = jest.fn()
const mockOnClose = jest.fn()

jest.mock('../context', () => ({
    useSkillEditorStore: jest.fn((selector: Function) =>
        selector(mockStoreState),
    ),
}))

jest.mock('../hooks/useSkillNotify', () => ({
    useSkillNotify: () => ({
        success: mockNotifySuccess,
        error: mockNotifyError,
    }),
}))

jest.mock('pages/aiAgent/hooks/useGuidanceArticleMutation', () => ({
    useGuidanceArticleMutation: () => ({
        deleteGuidanceArticle: mockDeleteGuidanceArticle,
    }),
}))

let mockStoreState: Record<string, unknown>

const createStoreState = (overrides: Record<string, unknown> = {}) => ({
    state: {
        skill: {
            id: 42,
            publishedVersionId: 10,
            draftVersionId: 20,
        },
        activeModal: null as string | null,
        isUpdating: false,
        intents: ['order::status', 'order::cancel'],
        ...overrides,
    },
    config: {
        helpCenter: { id: 1 },
        onDeleteFn: mockOnDeleteFn,
        onClose: mockOnClose,
    },
    dispatch: mockDispatch,
})

describe('useSkillDeleteModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockStoreState = createStoreState()
    })

    it('returns isOpen true when activeModal is delete', () => {
        mockStoreState = createStoreState({
            activeModal: 'delete',
        })

        const { result } = renderHook(() => useSkillDeleteModal())

        expect(result.current.isOpen).toBe(true)
    })

    it('returns isOpen false when activeModal is not delete', () => {
        mockStoreState = createStoreState({
            activeModal: 'publish',
        })

        const { result } = renderHook(() => useSkillDeleteModal())

        expect(result.current.isOpen).toBe(false)
    })

    it('returns isOpen false when activeModal is null', () => {
        const { result } = renderHook(() => useSkillDeleteModal())

        expect(result.current.isOpen).toBe(false)
    })

    it('returns hasBothVersions true when publishedVersionId exists and differs from draftVersionId', () => {
        const { result } = renderHook(() => useSkillDeleteModal())

        expect(result.current.hasBothVersions).toBe(true)
    })

    it('returns hasBothVersions false when publishedVersionId equals draftVersionId', () => {
        mockStoreState = createStoreState({
            skill: { id: 42, publishedVersionId: 10, draftVersionId: 10 },
        })

        const { result } = renderHook(() => useSkillDeleteModal())

        expect(result.current.hasBothVersions).toBe(false)
    })

    it('returns hasBothVersions false when publishedVersionId is null', () => {
        mockStoreState = createStoreState({
            skill: { id: 42, publishedVersionId: null, draftVersionId: 20 },
        })

        const { result } = renderHook(() => useSkillDeleteModal())

        expect(result.current.hasBothVersions).toBe(false)
    })

    it('returns intents from store state', () => {
        const { result } = renderHook(() => useSkillDeleteModal())

        expect(result.current.intents).toEqual([
            'order::status',
            'order::cancel',
        ])
    })

    it('calls deleteGuidanceArticle and dispatches correct actions on success', async () => {
        mockDeleteGuidanceArticle.mockResolvedValue(undefined)

        const { result } = renderHook(() => useSkillDeleteModal())

        await act(async () => {
            await result.current.onDelete()
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_UPDATING',
            payload: true,
        })
        expect(mockDeleteGuidanceArticle).toHaveBeenCalledWith(42)
        expect(mockNotifySuccess).toHaveBeenCalledWith('Skill deleted')
        expect(mockOnDeleteFn).toHaveBeenCalled()
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_UPDATING',
            payload: false,
        })
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' })
        expect(mockOnClose).toHaveBeenCalled()
    })

    it('calls notifyError on delete failure', async () => {
        mockDeleteGuidanceArticle.mockRejectedValue(new Error('Network error'))

        const { result } = renderHook(() => useSkillDeleteModal())

        await act(async () => {
            await result.current.onDelete()
        })

        expect(mockNotifyError).toHaveBeenCalledWith(
            'An error occurred while deleting the skill.',
        )
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_UPDATING',
            payload: false,
        })
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' })
        expect(mockOnClose).toHaveBeenCalled()
    })

    it('does nothing when skillId is undefined', async () => {
        mockStoreState = createStoreState({
            skill: undefined,
        })

        const { result } = renderHook(() => useSkillDeleteModal())

        await act(async () => {
            await result.current.onDelete()
        })

        expect(mockDeleteGuidanceArticle).not.toHaveBeenCalled()
    })

    it('onClose dispatches CLOSE_MODAL', () => {
        const { result } = renderHook(() => useSkillDeleteModal())

        result.current.onClose()

        expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' })
    })
})
