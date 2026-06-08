import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { useSkillEnableModal } from './useSkillEnableModal'

const mockDispatch = jest.fn()
const mockUpdateGuidanceArticle = jest.fn()
const mockNotifySuccess = jest.fn()
const mockNotifyError = jest.fn()
const mockOnUpdateFn = jest.fn()
const mockHandleVisibilityUpdate = jest.fn()
const mockResolveAllConflicts = jest.fn()
const mockInvalidateAffectedCaches = jest.fn()

let mockHasConflicts = true

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

jest.mock('./useSkillConflicts', () => ({
    useSkillConflicts: () => ({
        hasConflicts: mockHasConflicts,
        bannerType: 'none',
        skillsToDisableInfo: [],
        resolveAllConflicts: mockResolveAllConflicts,
        invalidateAffectedCaches: mockInvalidateAffectedCaches,
    }),
}))

jest.mock('models/api/types', () => ({
    isGorgiasApiError: jest.fn(),
}))

jest.mock('../../KnowledgeEditorGuidance/context/utils', () => ({
    fromArticleTranslationResponse: jest.fn(
        (response: Record<string, unknown>) => ({
            id: 42,
            title: response.title,
            content: response.content,
        }),
    ),
}))

let mockStoreState: Record<string, unknown>

const createStoreState = (overrides: Record<string, unknown> = {}) => ({
    state: {
        skill: { id: 42 },
        title: 'My skill',
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

describe('useSkillEnableModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockHasConflicts = true
        mockStoreState = createStoreState()
        mockResolveAllConflicts.mockResolvedValue(undefined)
        mockUpdateGuidanceArticle.mockResolvedValue({
            title: 'Test',
            content: '<p>content</p>',
        })
    })

    it('returns isOpen true when activeModal is enable AND hasConflicts is true', () => {
        mockStoreState = createStoreState({ activeModal: 'enable' })

        const { result } = renderHook(() => useSkillEnableModal())

        expect(result.current.isOpen).toBe(true)
    })

    it('returns isOpen false when activeModal is enable but hasConflicts is false', () => {
        mockHasConflicts = false
        mockStoreState = createStoreState({ activeModal: 'enable' })

        const { result } = renderHook(() => useSkillEnableModal())

        expect(result.current.isOpen).toBe(false)
    })

    it('returns isOpen false when activeModal is not enable', () => {
        mockStoreState = createStoreState({ activeModal: 'delete' })

        const { result } = renderHook(() => useSkillEnableModal())

        expect(result.current.isOpen).toBe(false)
    })

    it('calls resolveAllConflicts then updateGuidanceArticle with PUBLIC visibility and isCurrent true', async () => {
        const { result } = renderHook(() => useSkillEnableModal())

        await act(async () => {
            await result.current.onEnable()
        })

        expect(mockResolveAllConflicts).toHaveBeenCalled()
        expect(mockUpdateGuidanceArticle).toHaveBeenCalledWith(
            { isCurrent: true, visibility: 'PUBLIC' },
            { articleId: 42, locale: 'en-US' },
        )
    })

    it('dispatches SET_VISIBILITY true on success', async () => {
        const { result } = renderHook(() => useSkillEnableModal())

        await act(async () => {
            await result.current.onEnable()
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_VISIBILITY',
            payload: true,
        })
    })

    it('dispatches MARK_AS_SAVED and SET_MODE on success with response', async () => {
        const { result } = renderHook(() => useSkillEnableModal())

        await act(async () => {
            await result.current.onEnable()
        })

        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'MARK_AS_SAVED' }),
        )
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_MODE',
            payload: 'edit',
        })
    })

    it('notifies success and calls callbacks on success', async () => {
        const { result } = renderHook(() => useSkillEnableModal())

        await act(async () => {
            await result.current.onEnable()
        })

        expect(mockNotifySuccess).toHaveBeenCalledWith('Skill enabled')
        expect(mockOnUpdateFn).toHaveBeenCalled()
        expect(mockHandleVisibilityUpdate).toHaveBeenCalledWith('PUBLIC')
        expect(mockInvalidateAffectedCaches).toHaveBeenCalled()
    })

    it('calls notifyError with generic message on non-409 failure', async () => {
        const { isGorgiasApiError } = jest.requireMock('models/api/types')
        isGorgiasApiError.mockReturnValue(false)
        mockUpdateGuidanceArticle.mockRejectedValue(new Error('Network error'))

        const { result } = renderHook(() => useSkillEnableModal())

        await act(async () => {
            await result.current.onEnable()
        })

        expect(mockNotifyError).toHaveBeenCalledWith(
            'An error occurred while enabling the skill.',
        )
    })

    it('calls notifyError with formatted message on 409 conflict error', async () => {
        const { isGorgiasApiError } = jest.requireMock('models/api/types')
        isGorgiasApiError.mockReturnValue(true)

        const conflictError = {
            response: {
                status: 409,
                data: { error: { msg: 'order::cancel conflict' } },
            },
        }
        mockUpdateGuidanceArticle.mockRejectedValue(conflictError)

        const { result } = renderHook(() => useSkillEnableModal())

        await act(async () => {
            await result.current.onEnable()
        })

        expect(mockNotifyError).toHaveBeenCalledWith('Order/cancel conflict')
    })

    it('calls notifyError with a skill-specific message on duplicate title error', async () => {
        const { isGorgiasApiError } = jest.requireMock('models/api/types')
        isGorgiasApiError.mockReturnValue(true)
        mockStoreState = createStoreState({ title: 'Damaged item' })

        const duplicateError = {
            response: {
                status: 400,
                data: {
                    error: {
                        msg: 'An article with the title "Damaged item" already exists in this help center',
                    },
                },
            },
        }
        mockUpdateGuidanceArticle.mockRejectedValue(duplicateError)

        const { result } = renderHook(() => useSkillEnableModal())

        await act(async () => {
            await result.current.onEnable()
        })

        expect(mockNotifyError).toHaveBeenCalledWith(
            'Another resource with name "Damaged item" already exists',
        )
    })

    it('dispatches SET_UPDATING false and CLOSE_MODAL in finally block', async () => {
        const { result } = renderHook(() => useSkillEnableModal())

        await act(async () => {
            await result.current.onEnable()
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_UPDATING',
            payload: false,
        })
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' })
    })

    it('does nothing when skillId is undefined', async () => {
        mockStoreState = createStoreState({ skill: undefined })

        const { result } = renderHook(() => useSkillEnableModal())

        await act(async () => {
            await result.current.onEnable()
        })

        expect(mockResolveAllConflicts).not.toHaveBeenCalled()
        expect(mockUpdateGuidanceArticle).not.toHaveBeenCalled()
    })

    it('requestEnable opens the modal when there are conflicts', () => {
        mockHasConflicts = true
        mockStoreState = createStoreState()

        const { result } = renderHook(() => useSkillEnableModal())

        act(() => {
            result.current.requestEnable()
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_MODAL',
            payload: 'enable',
        })
        expect(mockUpdateGuidanceArticle).not.toHaveBeenCalled()
    })

    it('requestEnable enables directly without opening the modal when there are no conflicts', async () => {
        mockHasConflicts = false
        mockStoreState = createStoreState()

        const { result } = renderHook(() => useSkillEnableModal())

        await act(async () => {
            await result.current.requestEnable()
        })

        expect(mockDispatch).not.toHaveBeenCalledWith({
            type: 'SET_MODAL',
            payload: 'enable',
        })
        expect(mockResolveAllConflicts).toHaveBeenCalled()
        expect(mockUpdateGuidanceArticle).toHaveBeenCalled()
    })

    it('onClose dispatches CLOSE_MODAL', () => {
        const { result } = renderHook(() => useSkillEnableModal())

        result.current.onClose()

        expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' })
    })

    it('returns isFirstTimeEnable true when skill has no publishedVersionId', () => {
        mockStoreState = createStoreState({
            skill: { id: 42, publishedVersionId: null },
        })

        const { result } = renderHook(() => useSkillEnableModal())

        expect(result.current.isFirstTimeEnable).toBe(true)
    })

    it('returns isFirstTimeEnable true when skill is undefined', () => {
        mockStoreState = createStoreState({ skill: undefined })

        const { result } = renderHook(() => useSkillEnableModal())

        expect(result.current.isFirstTimeEnable).toBe(true)
    })

    it('returns isFirstTimeEnable false when skill has a publishedVersionId', () => {
        mockStoreState = createStoreState({
            skill: { id: 42, publishedVersionId: 7 },
        })

        const { result } = renderHook(() => useSkillEnableModal())

        expect(result.current.isFirstTimeEnable).toBe(false)
    })
})
