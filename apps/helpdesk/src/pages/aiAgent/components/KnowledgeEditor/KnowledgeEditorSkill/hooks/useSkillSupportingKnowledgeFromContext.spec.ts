import { act, renderHook, waitFor } from '@testing-library/react'

import { useSkillSupportingKnowledgeFromContext } from './useSkillSupportingKnowledgeFromContext'

const mockUpdateGuidanceArticle = jest.fn()
const mockDispatch = jest.fn()
const mockAppDispatch = jest.fn()
const mockOnUpdateFn = jest.fn()
const mockInvalidateQueries = jest.fn()

jest.mock('reapop', () => ({
    POSITIONS: { bottomRight: 'bottom-right' },
}))

jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    default: () => mockAppDispatch,
}))

jest.mock('state/notifications/actions', () => ({
    notify: (config: unknown) => ({ type: 'NOTIFY', payload: config }),
}))

jest.mock('state/notifications/types', () => ({
    NotificationStatus: { Error: 'error' },
}))

jest.mock('@tanstack/react-query', () => ({
    useQueryClient: () => ({
        invalidateQueries: mockInvalidateQueries,
    }),
}))

jest.mock('pages/aiAgent/hooks/useGuidanceArticleMutation', () => ({
    useGuidanceArticleMutation: () => ({
        updateGuidanceArticle: mockUpdateGuidanceArticle,
    }),
}))

jest.mock('models/helpCenter/queries', () => ({
    helpCenterKeys: {
        intents: (id: number) => ['intents', id],
    },
}))

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context',
    () => ({
        fromArticleTranslationResponse: (
            response: Record<string, unknown>,
            article: Record<string, unknown>,
        ) => ({ ...article, ...response }),
    }),
)

type MockStoreState = {
    state: {
        skill:
            | {
                  id: number
                  locale: string
                  templateKey: string | null
              }
            | undefined
        isUpdating: boolean
        isAutoSaving: boolean
        useSupportingContent: boolean
    }
    config: {
        helpCenter: { id: number }
        onUpdateFn: jest.Mock | undefined
    }
    dispatch: jest.Mock
}

let mockStoreState: MockStoreState

jest.mock('../context/KnowledgeEditorSkillContext', () => ({
    useSkillEditorStore: (selector: Function) => selector(mockStoreState),
}))

const createMockStoreState = (): MockStoreState => ({
    state: {
        skill: { id: 42, locale: 'en', templateKey: null },
        isUpdating: false,
        isAutoSaving: false,
        useSupportingContent: true,
    },
    config: {
        helpCenter: { id: 100 },
        onUpdateFn: mockOnUpdateFn,
    },
    dispatch: mockDispatch,
})

const createUpdateResponse = () => ({
    title: 'Skill title',
    content: 'Skill content',
    locale: 'en',
    visibility_status: 'PUBLIC' as const,
    created_datetime: '2025-01-01T00:00:00.000Z',
    updated_datetime: '2025-01-02T00:00:00.000Z',
    draft_version_id: 2,
    published_version_id: 1,
    is_current: false,
})

describe('useSkillSupportingKnowledgeFromContext', () => {
    beforeEach(() => {
        mockStoreState = createMockStoreState()
        mockUpdateGuidanceArticle.mockResolvedValue(createUpdateResponse())
    })

    afterEach(() => jest.clearAllMocks())

    describe('return values', () => {
        it('returns useSupportingKnowledge as true when useSupportingContent is true', () => {
            const { result } = renderHook(() =>
                useSkillSupportingKnowledgeFromContext(),
            )

            expect(result.current.useSupportingKnowledge).toBe(true)
        })

        it('returns useSupportingKnowledge as false when useSupportingContent is false', () => {
            mockStoreState.state.useSupportingContent = false

            const { result } = renderHook(() =>
                useSkillSupportingKnowledgeFromContext(),
            )

            expect(result.current.useSupportingKnowledge).toBe(false)
        })

        it('returns isUpdating from store state', () => {
            mockStoreState.state.isUpdating = true

            const { result } = renderHook(() =>
                useSkillSupportingKnowledgeFromContext(),
            )

            expect(result.current.isUpdating).toBe(true)
        })

        it('returns isAutoSaving from store state', () => {
            mockStoreState.state.isAutoSaving = true

            const { result } = renderHook(() =>
                useSkillSupportingKnowledgeFromContext(),
            )

            expect(result.current.isAutoSaving).toBe(true)
        })
    })

    describe('updateUseSupportingKnowledge', () => {
        it('calls updateGuidanceArticle with correct payload', async () => {
            const onSuccess = jest.fn()
            const { result } = renderHook(() =>
                useSkillSupportingKnowledgeFromContext(),
            )

            await act(async () => {
                result.current.updateUseSupportingKnowledge(false, onSuccess)
            })

            await waitFor(() => {
                expect(mockUpdateGuidanceArticle).toHaveBeenCalledWith(
                    { useSupportingContent: false, isCurrent: false },
                    { articleId: 42, locale: 'en' },
                )
            })
        })

        it('dispatches SET_UPDATING true before the request and false after', async () => {
            const onSuccess = jest.fn()
            const { result } = renderHook(() =>
                useSkillSupportingKnowledgeFromContext(),
            )

            await act(async () => {
                result.current.updateUseSupportingKnowledge(true, onSuccess)
            })

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalledWith({
                    type: 'SET_UPDATING',
                    payload: true,
                })
                expect(mockDispatch).toHaveBeenCalledWith({
                    type: 'SET_UPDATING',
                    payload: false,
                })
            })
        })

        it('dispatches MARK_AS_SAVED after a successful update', async () => {
            const onSuccess = jest.fn()
            const { result } = renderHook(() =>
                useSkillSupportingKnowledgeFromContext(),
            )

            await act(async () => {
                result.current.updateUseSupportingKnowledge(true, onSuccess)
            })

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalledWith(
                    expect.objectContaining({ type: 'MARK_AS_SAVED' }),
                )
            })
        })

        it('invalidates queries after a successful update', async () => {
            const onSuccess = jest.fn()
            const { result } = renderHook(() =>
                useSkillSupportingKnowledgeFromContext(),
            )

            await act(async () => {
                result.current.updateUseSupportingKnowledge(true, onSuccess)
            })

            await waitFor(() => {
                expect(mockInvalidateQueries).toHaveBeenCalledWith({
                    queryKey: ['intents', 100],
                })
            })
        })

        it('calls onUpdateFn and onSuccess after a successful update', async () => {
            const onSuccess = jest.fn()
            const { result } = renderHook(() =>
                useSkillSupportingKnowledgeFromContext(),
            )

            await act(async () => {
                result.current.updateUseSupportingKnowledge(true, onSuccess)
            })

            await waitFor(() => {
                expect(mockOnUpdateFn).toHaveBeenCalled()
                expect(onSuccess).toHaveBeenCalled()
            })
        })

        it('dispatches an error notification and does not call onSuccess when update fails', async () => {
            mockUpdateGuidanceArticle.mockRejectedValue(
                new Error('Network error'),
            )
            const onSuccess = jest.fn()

            const { result } = renderHook(() =>
                useSkillSupportingKnowledgeFromContext(),
            )

            await act(async () => {
                result.current.updateUseSupportingKnowledge(true, onSuccess)
            })

            await waitFor(() => {
                expect(mockAppDispatch).toHaveBeenCalledWith(
                    expect.objectContaining({ type: 'NOTIFY' }),
                )
            })
            expect(onSuccess).not.toHaveBeenCalled()
        })

        it('does nothing when skillId is undefined', async () => {
            mockStoreState.state.skill = undefined
            const onSuccess = jest.fn()

            const { result } = renderHook(() =>
                useSkillSupportingKnowledgeFromContext(),
            )

            await act(async () => {
                result.current.updateUseSupportingKnowledge(true, onSuccess)
            })

            expect(mockUpdateGuidanceArticle).not.toHaveBeenCalled()
            expect(onSuccess).not.toHaveBeenCalled()
        })

        it('does nothing when isUpdating is true', async () => {
            mockStoreState.state.isUpdating = true
            const onSuccess = jest.fn()

            const { result } = renderHook(() =>
                useSkillSupportingKnowledgeFromContext(),
            )

            await act(async () => {
                result.current.updateUseSupportingKnowledge(true, onSuccess)
            })

            expect(mockUpdateGuidanceArticle).not.toHaveBeenCalled()
        })

        it('does nothing when isAutoSaving is true', async () => {
            mockStoreState.state.isAutoSaving = true
            const onSuccess = jest.fn()

            const { result } = renderHook(() =>
                useSkillSupportingKnowledgeFromContext(),
            )

            await act(async () => {
                result.current.updateUseSupportingKnowledge(true, onSuccess)
            })

            expect(mockUpdateGuidanceArticle).not.toHaveBeenCalled()
        })

        it('dispatches SET_UPDATING false in finally block even on error', async () => {
            mockUpdateGuidanceArticle.mockRejectedValue(
                new Error('Network error'),
            )
            const onSuccess = jest.fn()

            const { result } = renderHook(() =>
                useSkillSupportingKnowledgeFromContext(),
            )

            await act(async () => {
                result.current.updateUseSupportingKnowledge(true, onSuccess)
            })

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalledWith({
                    type: 'SET_UPDATING',
                    payload: false,
                })
            })
        })
    })
})
