import { act, renderHook } from '@testing-library/react'

import { useSkillPublishModal } from './useSkillPublishModal'

const mockDispatch = jest.fn()
const mockUpdateGuidanceArticle = jest.fn()
const mockNotifySuccess = jest.fn()
const mockNotifyError = jest.fn()
const mockOnUpdateFn = jest.fn()
const mockHandleVisibilityUpdate = jest.fn()
const mockResolveAllConflicts = jest.fn()
const mockInvalidateAffectedCaches = jest.fn()

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
        skill: { id: 42, templateKey: 'template_1' },
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

describe('useSkillPublishModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockStoreState = createStoreState()
        mockResolveAllConflicts.mockResolvedValue(undefined)
    })

    it('returns isOpen true when activeModal is publish', () => {
        mockStoreState = createStoreState({ activeModal: 'publish' })

        const { result } = renderHook(() => useSkillPublishModal())

        expect(result.current.isOpen).toBe(true)
    })

    it('returns isOpen false when activeModal is not publish', () => {
        mockStoreState = createStoreState({ activeModal: 'delete' })

        const { result } = renderHook(() => useSkillPublishModal())

        expect(result.current.isOpen).toBe(false)
    })

    it('calls resolveAllConflicts then updateGuidanceArticle on publish', async () => {
        mockUpdateGuidanceArticle.mockResolvedValue({
            title: 'Test',
            content: '<p>content</p>',
        })

        const { result } = renderHook(() => useSkillPublishModal())

        await act(async () => {
            await result.current.onPublish('Initial publish')
        })

        expect(mockResolveAllConflicts).toHaveBeenCalled()
        expect(mockUpdateGuidanceArticle).toHaveBeenCalledWith(
            {
                isCurrent: true,
                visibility: 'PUBLIC',
                commitMessage: 'Initial publish',
            },
            { articleId: 42, locale: 'en-US' },
        )
    })

    it('passes commitMessage to updateGuidanceArticle', async () => {
        mockUpdateGuidanceArticle.mockResolvedValue({
            title: 'Test',
            content: '<p>c</p>',
        })

        const { result } = renderHook(() => useSkillPublishModal())

        await act(async () => {
            await result.current.onPublish('My commit message')
        })

        expect(mockUpdateGuidanceArticle).toHaveBeenCalledWith(
            expect.objectContaining({ commitMessage: 'My commit message' }),
            expect.any(Object),
        )
    })

    it('sends commitMessage as undefined when empty string', async () => {
        mockUpdateGuidanceArticle.mockResolvedValue({
            title: 'Test',
            content: '<p>c</p>',
        })

        const { result } = renderHook(() => useSkillPublishModal())

        await act(async () => {
            await result.current.onPublish('')
        })

        expect(mockUpdateGuidanceArticle).toHaveBeenCalledWith(
            expect.objectContaining({ commitMessage: undefined }),
            expect.any(Object),
        )
    })

    it('dispatches MARK_AS_SAVED, SET_VISIBILITY, and SET_MODE on success', async () => {
        mockUpdateGuidanceArticle.mockResolvedValue({
            title: 'Published Title',
            content: '<p>published</p>',
        })

        const { result } = renderHook(() => useSkillPublishModal())

        await act(async () => {
            await result.current.onPublish('msg')
        })

        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'MARK_AS_SAVED' }),
        )
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_VISIBILITY',
            payload: true,
        })
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_MODE',
            payload: 'edit',
        })
    })

    it('calls invalidateAffectedCaches on success', async () => {
        mockUpdateGuidanceArticle.mockResolvedValue({
            title: 'Test',
            content: '<p>c</p>',
        })

        const { result } = renderHook(() => useSkillPublishModal())

        await act(async () => {
            await result.current.onPublish('msg')
        })

        expect(mockInvalidateAffectedCaches).toHaveBeenCalled()
    })

    it('notifies success on successful publish', async () => {
        mockUpdateGuidanceArticle.mockResolvedValue({
            title: 'Test',
            content: '<p>c</p>',
        })

        const { result } = renderHook(() => useSkillPublishModal())

        await act(async () => {
            await result.current.onPublish('msg')
        })

        expect(mockNotifySuccess).toHaveBeenCalledWith(
            'Skill published successfully.',
        )
        expect(mockOnUpdateFn).toHaveBeenCalled()
        expect(mockHandleVisibilityUpdate).toHaveBeenCalledWith('PUBLIC')
    })

    it('calls notifyError with generic message on non-409 failure', async () => {
        const { isGorgiasApiError } = jest.requireMock('models/api/types')
        isGorgiasApiError.mockReturnValue(false)
        mockUpdateGuidanceArticle.mockRejectedValue(new Error('Network error'))

        const { result } = renderHook(() => useSkillPublishModal())

        await act(async () => {
            await result.current.onPublish('msg')
        })

        expect(mockNotifyError).toHaveBeenCalledWith(
            'An error occurred while publishing the skill.',
        )
    })

    it('calls notifyError with formatted message on 409 conflict error', async () => {
        const { isGorgiasApiError } = jest.requireMock('models/api/types')
        isGorgiasApiError.mockReturnValue(true)

        const conflictError = {
            response: {
                status: 409,
                data: {
                    error: {
                        msg: 'order::status conflict',
                    },
                },
            },
        }
        mockUpdateGuidanceArticle.mockRejectedValue(conflictError)

        const { result } = renderHook(() => useSkillPublishModal())

        await act(async () => {
            await result.current.onPublish('msg')
        })

        expect(mockNotifyError).toHaveBeenCalledWith('Order/status conflict')
    })

    it('dispatches SET_UPDATING false and CLOSE_MODAL in finally block', async () => {
        mockUpdateGuidanceArticle.mockResolvedValue({
            title: 'Test',
            content: '<p>c</p>',
        })

        const { result } = renderHook(() => useSkillPublishModal())

        await act(async () => {
            await result.current.onPublish('msg')
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_UPDATING',
            payload: false,
        })
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' })
    })

    it('does nothing when skillId is undefined', async () => {
        mockStoreState = createStoreState({ skill: undefined })

        const { result } = renderHook(() => useSkillPublishModal())

        await act(async () => {
            await result.current.onPublish('msg')
        })

        expect(mockResolveAllConflicts).not.toHaveBeenCalled()
        expect(mockUpdateGuidanceArticle).not.toHaveBeenCalled()
    })

    it('onClose dispatches CLOSE_MODAL', () => {
        const { result } = renderHook(() => useSkillPublishModal())

        result.current.onClose()

        expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' })
    })
})
