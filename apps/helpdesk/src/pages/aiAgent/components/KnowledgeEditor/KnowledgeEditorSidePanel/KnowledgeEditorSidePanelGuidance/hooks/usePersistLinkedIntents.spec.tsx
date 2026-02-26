import { act, renderHook, waitFor } from '@testing-library/react'

import { usePersistLinkedIntents } from './usePersistLinkedIntents'

const mockUpdateGuidanceArticle = jest.fn()
const mockNotifyError = jest.fn()

type MockGuidanceStoreState = {
    config: {
        guidanceHelpCenter: {
            id: number
        }
        onUpdateFn?: jest.Mock
    }
    dispatch: jest.Mock
    state: {
        guidance:
            | {
                  id: number
                  locale: string
                  title: string
                  content: string
                  templateKey: string | null
              }
            | undefined
        isUpdating: boolean
        isAutoSaving: boolean
    }
}

jest.mock('hooks/useNotify', () => ({
    useNotify: () => ({
        error: mockNotifyError,
    }),
}))

jest.mock('pages/aiAgent/hooks/useGuidanceArticleMutation', () => ({
    useGuidanceArticleMutation: () => ({
        updateGuidanceArticle: mockUpdateGuidanceArticle,
    }),
}))

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context',
    () => ({
        useGuidanceStore: (selector: (state: unknown) => unknown) =>
            selector(mockGuidanceStoreState),
    }),
)

const createMockGuidanceStoreState = (): MockGuidanceStoreState => ({
    config: { guidanceHelpCenter: { id: 456 }, onUpdateFn: jest.fn() },
    dispatch: jest.fn(),
    state: {
        guidance: {
            id: 123,
            locale: 'en',
            title: 'Guidance title',
            content: 'Guidance content',
            templateKey: null,
        },
        isUpdating: false,
        isAutoSaving: false,
    },
})

let mockGuidanceStoreState = createMockGuidanceStoreState()

const createUpdateResponse = (intents: string[]) => ({
    title: mockGuidanceStoreState.state.guidance?.title ?? '',
    content: mockGuidanceStoreState.state.guidance?.content ?? '',
    locale: mockGuidanceStoreState.state.guidance?.locale ?? 'en',
    visibility_status: 'PUBLIC' as const,
    created_datetime: '2025-01-01T00:00:00.000Z',
    updated_datetime: '2025-01-02T00:00:00.000Z',
    draft_version_id: 790,
    published_version_id: 789,
    is_current: true,
    intents,
})

describe('usePersistLinkedIntents', () => {
    beforeEach(() => {
        mockGuidanceStoreState = createMockGuidanceStoreState()
        mockGuidanceStoreState.dispatch.mockImplementation((action) => {
            if (action.type === 'SET_UPDATING') {
                mockGuidanceStoreState.state.isUpdating = action.payload
            }

            if (
                action.type === 'MARK_AS_SAVED' &&
                action.payload?.guidance !== undefined
            ) {
                mockGuidanceStoreState.state.guidance = action.payload.guidance
            }
        })

        mockUpdateGuidanceArticle.mockImplementation(
            async ({ intents }: { intents?: string[] }) =>
                createUpdateResponse(intents ?? []),
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('persists linked intents and dispatches MARK_AS_SAVED', async () => {
        const onSuccess = jest.fn()
        const { result } = renderHook(() => usePersistLinkedIntents())

        await act(async () => {
            result.current.persistLinkedIntents(['order-status'], onSuccess)
        })

        await waitFor(() => {
            expect(mockUpdateGuidanceArticle).toHaveBeenCalledWith(
                {
                    intents: ['order-status'],
                    isCurrent: false,
                },
                {
                    articleId: 123,
                    locale: 'en',
                },
            )
        })
        expect(mockGuidanceStoreState.dispatch).toHaveBeenCalledWith({
            type: 'SET_UPDATING',
            payload: true,
        })
        expect(mockGuidanceStoreState.dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'MARK_AS_SAVED',
                payload: expect.objectContaining({
                    guidance: expect.objectContaining({
                        intents: ['order-status'],
                    }),
                }),
            }),
        )
        expect(mockGuidanceStoreState.config.onUpdateFn).toHaveBeenCalled()
        expect(onSuccess).toHaveBeenCalled()
    })

    it('does not persist intents while editor is already updating', async () => {
        mockGuidanceStoreState.state.isUpdating = true
        const onSuccess = jest.fn()
        const { result } = renderHook(() => usePersistLinkedIntents())

        await act(async () => {
            result.current.persistLinkedIntents(['order-status'], onSuccess)
        })

        expect(mockUpdateGuidanceArticle).not.toHaveBeenCalled()
        expect(onSuccess).not.toHaveBeenCalled()
    })

    it('does not persist intents while editor is autosaving', async () => {
        mockGuidanceStoreState.state.isAutoSaving = true
        const onSuccess = jest.fn()
        const { result } = renderHook(() => usePersistLinkedIntents())

        await act(async () => {
            result.current.persistLinkedIntents(['order-status'], onSuccess)
        })

        expect(mockUpdateGuidanceArticle).not.toHaveBeenCalled()
        expect(onSuccess).not.toHaveBeenCalled()
    })

    it('does not persist intents when guidance id is falsy', async () => {
        if (mockGuidanceStoreState.state.guidance) {
            mockGuidanceStoreState.state.guidance.id = 0
        }
        const onSuccess = jest.fn()
        const { result } = renderHook(() => usePersistLinkedIntents())

        await act(async () => {
            result.current.persistLinkedIntents(['order-status'], onSuccess)
        })

        expect(mockUpdateGuidanceArticle).not.toHaveBeenCalled()
    })

    it('does not persist intents when guidance locale is empty', async () => {
        if (mockGuidanceStoreState.state.guidance) {
            mockGuidanceStoreState.state.guidance.locale = ''
        }
        const onSuccess = jest.fn()
        const { result } = renderHook(() => usePersistLinkedIntents())

        await act(async () => {
            result.current.persistLinkedIntents(['order-status'], onSuccess)
        })

        expect(mockUpdateGuidanceArticle).not.toHaveBeenCalled()
    })

    it('handles empty mutation response without marking as saved', async () => {
        mockUpdateGuidanceArticle.mockResolvedValue(undefined)
        const onSuccess = jest.fn()
        const { result } = renderHook(() => usePersistLinkedIntents())

        await act(async () => {
            result.current.persistLinkedIntents(['order-status'], onSuccess)
        })

        await waitFor(() => {
            expect(mockGuidanceStoreState.dispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: true,
            })
        })
        expect(mockGuidanceStoreState.dispatch).not.toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'MARK_AS_SAVED',
            }),
        )
        expect(mockGuidanceStoreState.dispatch).toHaveBeenCalledWith({
            type: 'SET_UPDATING',
            payload: false,
        })
    })

    it('notifies when persisting linked intents fails', async () => {
        mockUpdateGuidanceArticle.mockRejectedValue(new Error('failed'))
        const onSuccess = jest.fn()
        const { result } = renderHook(() => usePersistLinkedIntents())

        await act(async () => {
            result.current.persistLinkedIntents(['order-status'], onSuccess)
        })

        await waitFor(() => {
            expect(mockNotifyError).toHaveBeenCalledWith(
                'An error occurred while saving linked intents.',
            )
        })
        expect(mockGuidanceStoreState.dispatch).toHaveBeenCalledWith({
            type: 'SET_UPDATING',
            payload: false,
        })
        expect(onSuccess).not.toHaveBeenCalled()
    })

    it('persists linked intents when onUpdateFn is not provided', async () => {
        mockGuidanceStoreState.config.onUpdateFn = undefined
        const onSuccess = jest.fn()
        const { result } = renderHook(() => usePersistLinkedIntents())

        await act(async () => {
            result.current.persistLinkedIntents(['order-status'], onSuccess)
        })

        await waitFor(() => {
            expect(mockUpdateGuidanceArticle).toHaveBeenCalled()
        })
        expect(onSuccess).toHaveBeenCalled()
    })
})
