import { renderHook } from '@repo/testing'
import { act, waitFor } from '@testing-library/react'

import { usePersistLinkedIntentsSkill } from './usePersistLinkedIntentsSkill'

const mockUpdateGuidanceArticle = jest.fn()
const mockDispatch = jest.fn()
const mockAppDispatch = jest.fn()
const mockOnUpdateFn = jest.fn()

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
    NotificationStatus: { Success: 'success', Error: 'error' },
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
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context/utils',
    () => ({
        fromArticleTranslationResponse: (
            response: Record<string, unknown>,
            article: Record<string, unknown>,
        ) => ({
            ...article,
            intents: response.intents,
        }),
    }),
)

type MockStoreState = {
    state: {
        skill: {
            id: number
            locale: string
            templateKey: string | null
            intents: string[]
        }
        intents: string[]
        isUpdating: boolean
        isAutoSaving: boolean
    }
    config: {
        helpCenter: { id: number }
        onUpdateFn: jest.Mock
    }
    dispatch: jest.Mock
}

let mockStoreState: MockStoreState

jest.mock('../../context/KnowledgeEditorSkillContext', () => ({
    useSkillEditorStore: (selector: Function) => selector(mockStoreState),
}))

const createMockStoreState = (): MockStoreState => ({
    state: {
        skill: {
            id: 100,
            locale: 'en',
            templateKey: null,
            intents: ['order::status', 'order::cancel'],
        },
        intents: ['order::status', 'order::cancel'],
        isUpdating: false,
        isAutoSaving: false,
    },
    config: {
        helpCenter: { id: 456 },
        onUpdateFn: mockOnUpdateFn,
    },
    dispatch: mockDispatch,
})

const createUpdateResponse = (intents: string[]) => ({
    title: 'Skill',
    content: 'content',
    locale: 'en',
    visibility_status: 'PUBLIC' as const,
    created_datetime: '2025-01-01T00:00:00.000Z',
    updated_datetime: '2025-01-02T00:00:00.000Z',
    draft_version_id: 2,
    published_version_id: 1,
    is_current: false,
    intents,
})

describe('usePersistLinkedIntentsSkill', () => {
    beforeEach(() => {
        mockStoreState = createMockStoreState()
        mockUpdateGuidanceArticle.mockImplementation(
            async ({ intents }: { intents?: string[] }) =>
                createUpdateResponse(intents ?? []),
        )
    })

    afterEach(() => jest.clearAllMocks())

    it('persists linked intents and dispatches MARK_AS_SAVED', async () => {
        const onSuccess = jest.fn()
        const { result } = renderHook(() => usePersistLinkedIntentsSkill())

        await act(async () => {
            result.current.persistLinkedIntents(['order::status'], onSuccess)
        })

        await waitFor(() => {
            expect(mockUpdateGuidanceArticle).toHaveBeenCalledWith(
                expect.objectContaining({
                    intents: ['order::status'],
                    isCurrent: false,
                }),
                { articleId: 100, locale: 'en' },
            )
        })
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'MARK_AS_SAVED' }),
        )
        expect(onSuccess).toHaveBeenCalled()
    })

    it('unlinks non-last intent and creates a draft', async () => {
        const onSuccess = jest.fn()
        const { result } = renderHook(() => usePersistLinkedIntentsSkill())

        await act(async () => {
            result.current.unlinkIntent(
                'order::cancel',
                ['order::status', 'order::cancel'],
                onSuccess,
            )
        })

        await waitFor(() => {
            expect(mockUpdateGuidanceArticle).toHaveBeenCalledWith(
                expect.objectContaining({
                    intents: ['order::status'],
                    isCurrent: false,
                }),
                { articleId: 100, locale: 'en' },
            )
        })
    })

    it('unlinks last intent with empty intents array', async () => {
        mockStoreState.state.skill.intents = ['order::status']
        mockStoreState.state.intents = ['order::status']
        const onSuccess = jest.fn()
        const { result } = renderHook(() => usePersistLinkedIntentsSkill())

        await act(async () => {
            result.current.unlinkIntent(
                'order::status',
                ['order::status'],
                onSuccess,
            )
        })

        await waitFor(() => {
            expect(mockUpdateGuidanceArticle).toHaveBeenCalledWith(
                expect.objectContaining({
                    intents: [],
                    isCurrent: false,
                }),
                { articleId: 100, locale: 'en' },
            )
        })
    })

    it('does not persist when already updating', async () => {
        mockStoreState.state.isUpdating = true
        const onSuccess = jest.fn()
        const { result } = renderHook(() => usePersistLinkedIntentsSkill())

        await act(async () => {
            result.current.persistLinkedIntents(['order::status'], onSuccess)
        })

        expect(mockUpdateGuidanceArticle).not.toHaveBeenCalled()
    })
})
