import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { useSkillDisableModal } from './useSkillDisableModal'

const mockDispatch = jest.fn()
const mockUpdateGuidanceArticle = jest.fn()
const mockNotifySuccess = jest.fn()
const mockNotifyError = jest.fn()
const mockOnUpdateFn = jest.fn()
const mockHandleVisibilityUpdate = jest.fn()

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
        updateGuidanceArticle: mockUpdateGuidanceArticle,
    }),
}))

let mockStoreState: Record<string, unknown>

const createStoreState = (overrides: Record<string, unknown> = {}) => ({
    state: {
        skill: { id: 42 },
        activeModal: null as string | null,
        isUpdating: false,
        ...overrides,
    },
    config: {
        helpCenter: { id: 1, default_locale: 'en-US' },
        onUpdateFn: mockOnUpdateFn,
        handleVisibilityUpdate: mockHandleVisibilityUpdate,
    },
    dispatch: mockDispatch,
})

describe('useSkillDisableModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockStoreState = createStoreState()
    })

    it('returns isOpen true when activeModal is disable', () => {
        mockStoreState = createStoreState({ activeModal: 'disable' })

        const { result } = renderHook(() => useSkillDisableModal())

        expect(result.current.isOpen).toBe(true)
    })

    it('returns isOpen false when activeModal is not disable', () => {
        mockStoreState = createStoreState({ activeModal: 'publish' })

        const { result } = renderHook(() => useSkillDisableModal())

        expect(result.current.isOpen).toBe(false)
    })

    it('calls updateGuidanceArticle with UNLISTED visibility and isCurrent false', async () => {
        mockUpdateGuidanceArticle.mockResolvedValue({ title: 'Test' })

        const { result } = renderHook(() => useSkillDisableModal())

        await act(async () => {
            await result.current.onDisable()
        })

        expect(mockUpdateGuidanceArticle).toHaveBeenCalledWith(
            { visibility: 'UNLISTED', isCurrent: false },
            { articleId: 42, locale: 'en-US' },
        )
    })

    it('dispatches SET_VISIBILITY false and notifies success on successful disable', async () => {
        mockUpdateGuidanceArticle.mockResolvedValue({ title: 'Test' })

        const { result } = renderHook(() => useSkillDisableModal())

        await act(async () => {
            await result.current.onDisable()
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_VISIBILITY',
            payload: false,
        })
        expect(mockNotifySuccess).toHaveBeenCalledWith('Skill disabled')
        expect(mockOnUpdateFn).toHaveBeenCalled()
        expect(mockHandleVisibilityUpdate).toHaveBeenCalledWith('UNLISTED')
    })

    it('dispatches SET_UPDATING true before the call and false after', async () => {
        mockUpdateGuidanceArticle.mockResolvedValue({ title: 'Test' })

        const { result } = renderHook(() => useSkillDisableModal())

        await act(async () => {
            await result.current.onDisable()
        })

        const setUpdatingCalls = mockDispatch.mock.calls.filter(
            ([action]: [{ type: string; payload?: unknown }]) =>
                action.type === 'SET_UPDATING',
        )
        expect(setUpdatingCalls[0]).toEqual([
            { type: 'SET_UPDATING', payload: true },
        ])
        expect(setUpdatingCalls[1]).toEqual([
            { type: 'SET_UPDATING', payload: false },
        ])
    })

    it('calls notifyError on failure', async () => {
        mockUpdateGuidanceArticle.mockRejectedValue(new Error('Network error'))

        const { result } = renderHook(() => useSkillDisableModal())

        await act(async () => {
            await result.current.onDisable()
        })

        expect(mockNotifyError).toHaveBeenCalledWith(
            'An error occurred while disabling the skill.',
        )
        expect(mockNotifySuccess).not.toHaveBeenCalled()
    })

    it('dispatches CLOSE_MODAL in finally block', async () => {
        mockUpdateGuidanceArticle.mockResolvedValue({ title: 'Test' })

        const { result } = renderHook(() => useSkillDisableModal())

        await act(async () => {
            await result.current.onDisable()
        })

        expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' })
    })

    it('does not dispatch SET_VISIBILITY when response is falsy', async () => {
        mockUpdateGuidanceArticle.mockResolvedValue(null)

        const { result } = renderHook(() => useSkillDisableModal())

        await act(async () => {
            await result.current.onDisable()
        })

        expect(mockDispatch).not.toHaveBeenCalledWith({
            type: 'SET_VISIBILITY',
            payload: false,
        })
        expect(mockNotifySuccess).not.toHaveBeenCalled()
    })

    it('does nothing when skillId is undefined', async () => {
        mockStoreState = createStoreState({ skill: undefined })

        const { result } = renderHook(() => useSkillDisableModal())

        await act(async () => {
            await result.current.onDisable()
        })

        expect(mockUpdateGuidanceArticle).not.toHaveBeenCalled()
    })

    it('onClose dispatches CLOSE_MODAL', () => {
        const { result } = renderHook(() => useSkillDisableModal())

        result.current.onClose()

        expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' })
    })
})
