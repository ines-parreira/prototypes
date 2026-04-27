import { renderHook } from '@repo/testing'

import { useSkillAutoSave } from './useSkillAutoSave'

const mockDispatch = jest.fn()
const mockOnChangeField = jest.fn()
const mockNotifyError = jest.fn()

const mockStoreApi = {
    getState: jest.fn(() => ({
        state: {
            mode: 'edit',
            title: 'Test',
            content: '<p>content</p>',
            savedSnapshot: { title: 'Test', content: '<p>content</p>' },
            skill: { id: 42 },
            visibility: true,
            intents: ['order::status'],
        },
    })),
}

jest.mock('../context/KnowledgeEditorSkillContext', () => ({
    useSkillEditorStore: jest.fn((selector: Function) =>
        selector(mockStoreState),
    ),
    useSkillEditorStoreApi: () => mockStoreApi,
}))

jest.mock('./useSkillNotify', () => ({
    useSkillNotify: () => ({
        success: jest.fn(),
        error: mockNotifyError,
    }),
}))

jest.mock('pages/aiAgent/hooks/useGuidanceArticleMutation', () => ({
    useGuidanceArticleMutation: () => ({
        createGuidanceArticle: jest.fn(),
        updateGuidanceArticle: jest.fn(),
    }),
}))

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/shared/use-editor-auto-save',
    () => ({
        useEditorAutoSave: jest.fn((config: Record<string, unknown>) => {
            capturedConfig = config
            return { onChangeField: mockOnChangeField }
        }),
    }),
)

jest.mock(
    'pages/aiAgent/components/GuidanceEditor/guidanceTextContent.utils',
    () => ({
        getPlainTextLength: jest.fn(() => 100),
        textLimit: 5000,
    }),
)

jest.mock('pages/aiAgent/utils/guidance.utils', () => ({
    mapGuidanceFormFieldsToGuidanceArticle: jest.fn(
        (fields: Record<string, unknown>) => fields,
    ),
}))

jest.mock('../../KnowledgeEditorGuidance/context/utils', () => ({
    fromArticleTranslation: jest.fn((article: unknown) => article),
    fromArticleTranslationResponse: jest.fn((response: unknown) => response),
}))

let mockStoreState: Record<string, unknown>
let capturedConfig: Record<string, unknown> | undefined

const createStoreState = () => ({
    state: {
        mode: 'edit',
        title: 'Test',
        content: '<p>content</p>',
        savedSnapshot: { title: 'Test', content: '<p>content</p>' },
        skill: { id: 42 },
        visibility: true,
        intents: ['order::status'],
    },
    config: {
        skillTemplate: null,
        onCreateFn: jest.fn(),
        onUpdateFn: jest.fn(),
        helpCenter: { id: 1, default_locale: 'en-US' },
    },
    dispatch: mockDispatch,
})

describe('useSkillAutoSave', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        capturedConfig = undefined
        mockStoreState = createStoreState()
    })

    it('returns onChangeField from useEditorAutoSave', () => {
        const { result } = renderHook(() => useSkillAutoSave())

        expect(result.current.onChangeField).toBe(mockOnChangeField)
    })

    it('passes dispatch callbacks that dispatch title changes', () => {
        renderHook(() => useSkillAutoSave())

        expect(capturedConfig).toBeDefined()
        const dispatch = capturedConfig!.dispatch as Record<string, Function>

        dispatch.setTitle('New Title')

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_TITLE',
            payload: 'New Title',
        })
    })

    it('passes dispatch callbacks that dispatch content changes', () => {
        renderHook(() => useSkillAutoSave())

        expect(capturedConfig).toBeDefined()
        const dispatch = capturedConfig!.dispatch as Record<string, Function>

        dispatch.setContent('<p>new content</p>')

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_CONTENT',
            payload: '<p>new content</p>',
        })
    })

    it('passes dispatch callbacks that dispatch auto-saving state', () => {
        renderHook(() => useSkillAutoSave())

        const dispatch = capturedConfig!.dispatch as Record<string, Function>

        dispatch.setAutoSaving(true)

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_AUTO_SAVING',
            payload: true,
        })
    })

    it('passes dispatch callbacks that dispatch MARK_AS_SAVED', () => {
        renderHook(() => useSkillAutoSave())

        const dispatch = capturedConfig!.dispatch as Record<string, Function>

        const snapshot = { title: 'T', content: '<p>C</p>' }
        const article = { id: 1, title: 'T' }
        dispatch.markAsSaved(snapshot, article)

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'MARK_AS_SAVED',
            payload: {
                title: 'T',
                content: '<p>C</p>',
                article: { id: 1, title: 'T' },
            },
        })
    })

    it('passes dispatch callbacks that dispatch SET_MODE', () => {
        renderHook(() => useSkillAutoSave())

        const dispatch = capturedConfig!.dispatch as Record<string, Function>

        dispatch.setMode('read')

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_MODE',
            payload: 'read',
        })
    })

    it('passes dispatch callbacks that dispatch SET_AUTO_SAVE_ERROR', () => {
        renderHook(() => useSkillAutoSave())

        const dispatch = capturedConfig!.dispatch as Record<string, Function>

        dispatch.setAutoSaveError(true)

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_AUTO_SAVE_ERROR',
            payload: true,
        })
    })

    it('passes an onError callback that calls notifyError for create mode', () => {
        renderHook(() => useSkillAutoSave())

        const onError = capturedConfig!.onError as Function
        onError('create')

        expect(mockNotifyError).toHaveBeenCalledWith(
            'An error occurred while creating the skill.',
        )
    })

    it('passes an onError callback that calls notifyError for edit mode', () => {
        renderHook(() => useSkillAutoSave())

        const onError = capturedConfig!.onError as Function
        onError('edit')

        expect(mockNotifyError).toHaveBeenCalledWith(
            'An error occurred while saving the skill.',
        )
    })

    it('configures debounce delay of 1000ms', () => {
        renderHook(() => useSkillAutoSave())

        expect(capturedConfig!.debounceDelay).toBe(1000)
    })
})
