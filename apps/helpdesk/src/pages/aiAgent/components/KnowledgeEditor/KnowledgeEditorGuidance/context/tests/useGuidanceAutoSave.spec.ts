import { useDebouncedCallback } from '@repo/hooks'
import { act, renderHook } from '@repo/testing'

import { useNotify } from 'hooks/useNotify'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import type { GuidanceArticle } from 'pages/aiAgent/types'

import { useGuidanceContext } from '../KnowledgeEditorGuidanceContext'
import type { GuidanceState } from '../types'
import { useGuidanceAutoSave } from '../useGuidanceAutoSave'
import {
    fromArticleTranslation,
    fromArticleTranslationResponse,
} from '../utils'

jest.mock('@repo/hooks', () => ({
    useDebouncedCallback: jest.fn((fn) => fn),
}))

jest.mock('hooks/useNotify', () => ({
    useNotify: jest.fn(),
}))

jest.mock('pages/aiAgent/hooks/useGuidanceArticleMutation', () => ({
    useGuidanceArticleMutation: jest.fn(),
}))

jest.mock('../KnowledgeEditorGuidanceContext', () => ({
    useGuidanceContext: jest.fn(),
}))

jest.mock('../utils', () => ({
    ...jest.requireActual<typeof import('../utils')>('../utils'),
    fromArticleTranslation: jest.fn(),
    fromArticleTranslationResponse: jest.fn(),
}))

describe('useGuidanceAutoSave', () => {
    const mockDispatch = jest.fn()
    const mockNotifyError = jest.fn()
    const mockCreateGuidanceArticle = jest.fn()
    const mockUpdateGuidanceArticle = jest.fn()
    const mockOnCreateFn = jest.fn()
    const mockOnUpdateFn = jest.fn()

    const defaultState: GuidanceState = {
        guidanceMode: 'edit',
        isFullscreen: false,
        isDetailsView: true,
        title: 'Test Title',
        content: 'Test Content',
        visibility: true,
        savedSnapshot: { title: 'Test Title', content: 'Test Content' },
        guidance: {
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
            publishedVersionId: null,
        },
        isAutoSaving: false,
        hasAutoSavedInSession: false,
        isFromTemplate: false,
        hasTemplateChanges: false,
        versionStatus: 'latest_draft',
        activeModal: null,
        isUpdating: false,
        historicalVersion: null,
        comparisonVersion: null,
    }

    const defaultConfig = {
        shopName: 'test-shop',
        shopType: 'shopify',
        guidanceTemplate: undefined,
        initialMode: 'edit' as const,
        guidanceHelpCenter: { id: 1, default_locale: 'en' },
        onClose: jest.fn(),
        onCreateFn: mockOnCreateFn,
        onUpdateFn: mockOnUpdateFn,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useNotify as jest.Mock).mockReturnValue({
            error: mockNotifyError,
        })
        ;(useGuidanceArticleMutation as jest.Mock).mockReturnValue({
            createGuidanceArticle: mockCreateGuidanceArticle,
            updateGuidanceArticle: mockUpdateGuidanceArticle,
        })
        ;(useGuidanceContext as jest.Mock).mockReturnValue({
            state: defaultState,
            dispatch: mockDispatch,
            config: defaultConfig,
        })
    })

    describe('onChangeField', () => {
        it('should dispatch SET_TITLE when field is title', () => {
            const { result } = renderHook(() => useGuidanceAutoSave())

            act(() => {
                result.current.onChangeField('title', 'New Title')
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_TITLE',
                payload: 'New Title',
            })
        })

        it('should dispatch SET_CONTENT when field is content', () => {
            const { result } = renderHook(() => useGuidanceAutoSave())

            act(() => {
                result.current.onChangeField('content', 'New Content')
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_CONTENT',
                payload: 'New Content',
            })
        })

        it('should not trigger autosave when in read mode', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, guidanceMode: 'read' },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useGuidanceAutoSave())

            act(() => {
                result.current.onChangeField('title', 'New Title')
            })

            // Should not dispatch anything when in read mode (early return)
            expect(mockDispatch).not.toHaveBeenCalled()
        })

        it('should use "Untitled" as title when title is empty but content is present', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    title: '',
                    savedSnapshot: { title: '', content: '' },
                },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useGuidanceAutoSave())

            act(() => {
                result.current.onChangeField('content', 'New Content')
            })

            // Should set title to "Untitled"
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_TITLE',
                payload: 'Untitled',
            })

            // Should trigger autosave with "Untitled" as title
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_AUTO_SAVING',
                payload: true,
            })
        })

        it('should not trigger autosave when content is empty', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, content: '' },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useGuidanceAutoSave())

            act(() => {
                result.current.onChangeField('title', 'New Title')
            })

            expect(mockDispatch).not.toHaveBeenCalledWith({
                type: 'SET_AUTO_SAVING',
                payload: true,
            })
        })

        it('should not trigger autosave when both title and content are whitespace only', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, title: '   ', content: '   ' },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useGuidanceAutoSave())

            act(() => {
                result.current.onChangeField('title', '   ')
            })

            expect(mockDispatch).not.toHaveBeenCalledWith({
                type: 'SET_AUTO_SAVING',
                payload: true,
            })
        })

        it('should trigger autosave when form is valid in edit mode', () => {
            const { result } = renderHook(() => useGuidanceAutoSave())

            act(() => {
                result.current.onChangeField('title', 'New Title')
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_AUTO_SAVING',
                payload: true,
            })
        })

        it('should trigger autosave when form is valid in create mode', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    guidanceMode: 'create',
                    guidance: undefined,
                },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useGuidanceAutoSave())

            act(() => {
                result.current.onChangeField('content', 'New Content')
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_AUTO_SAVING',
                payload: true,
            })
        })
    })

    describe('performAutoSave in create mode', () => {
        beforeEach(() => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    guidanceMode: 'create',
                    guidance: undefined,
                    savedSnapshot: { title: '', content: '' },
                },
                dispatch: mockDispatch,
                config: {
                    ...defaultConfig,
                    guidanceHelpCenter: { id: 1, default_locale: 'en-US' },
                },
            })
        })

        it('should create article and dispatch MARK_AS_SAVED on success', async () => {
            const mockResponse = {
                id: 456,
                translation: {
                    title: 'New Title',
                    content: 'New Content',
                    locale: 'en',
                    visibility_status: 'PUBLIC',
                    created_datetime: '2024-01-01T00:00:00Z',
                    updated_datetime: '2024-01-01T00:00:00Z',
                    draft_version_id: 1,
                    published_version_id: null,
                    is_current: false,
                },
                template_key: null,
            }

            const mockGuidance: GuidanceArticle = {
                id: 456,
                title: 'New Title',
                content: 'New Content',
                locale: 'en-US',
                visibility: 'PUBLIC',
                createdDatetime: '2024-01-01T00:00:00Z',
                lastUpdated: '2024-01-01T00:00:00Z',
                templateKey: null,
                isCurrent: false,
                draftVersionId: 1,
                publishedVersionId: null,
            }

            mockCreateGuidanceArticle.mockResolvedValue(mockResponse)
            ;(fromArticleTranslation as jest.Mock).mockReturnValue(mockGuidance)

            const { result } = renderHook(() => useGuidanceAutoSave())

            await act(async () => {
                result.current.onChangeField('title', 'New Title')
            })

            expect(mockCreateGuidanceArticle).toHaveBeenCalled()
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'MARK_AS_SAVED',
                payload: {
                    title: 'New Title',
                    content: 'Test Content',
                    guidance: mockGuidance,
                },
            })
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_MODE',
                payload: 'edit',
            })
            expect(mockOnCreateFn).toHaveBeenCalled()
        })

        it('should include template key when guidanceTemplate is provided', async () => {
            const mockTemplate = { id: 'template-1', name: 'Test Template' }
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    guidanceMode: 'create',
                    guidance: undefined,
                    savedSnapshot: { title: '', content: '' },
                },
                dispatch: mockDispatch,
                config: { ...defaultConfig, guidanceTemplate: mockTemplate },
            })

            mockCreateGuidanceArticle.mockResolvedValue({
                id: 456,
                translation: {
                    title: 'New Title',
                    content: 'New Content',
                    locale: 'en',
                },
            })
            ;(fromArticleTranslation as jest.Mock).mockReturnValue({
                id: 456,
            })

            const { result } = renderHook(() => useGuidanceAutoSave())

            await act(async () => {
                result.current.onChangeField('title', 'New Title')
            })

            expect(mockCreateGuidanceArticle).toHaveBeenCalledWith(
                expect.objectContaining({
                    templateKey: 'template_guidance_template-1',
                }),
            )
        })
    })

    describe('performAutoSave in edit mode', () => {
        it('should update article and dispatch MARK_AS_SAVED on success', async () => {
            const mockResponse = {
                title: 'Updated Title',
                content: 'Updated Content',
                locale: 'en',
                visibility_status: 'PUBLIC',
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-02T00:00:00Z',
                draft_version_id: 2,
                published_version_id: null,
                is_current: false,
            }

            const mockGuidance: GuidanceArticle = {
                id: 123,
                title: 'Updated Title',
                content: 'Updated Content',
                locale: 'en-US',
                visibility: 'PUBLIC',
                createdDatetime: '2024-01-01T00:00:00Z',
                lastUpdated: '2024-01-02T00:00:00Z',
                templateKey: null,
                isCurrent: false,
                draftVersionId: 2,
                publishedVersionId: null,
            }

            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    savedSnapshot: {
                        title: 'Old Title',
                        content: 'Old Content',
                    },
                },
                dispatch: mockDispatch,
                config: {
                    ...defaultConfig,
                    guidanceHelpCenter: { id: 1, default_locale: 'en-US' },
                },
            })

            mockUpdateGuidanceArticle.mockResolvedValue(mockResponse)
            ;(fromArticleTranslationResponse as jest.Mock).mockReturnValue(
                mockGuidance,
            )

            const { result } = renderHook(() => useGuidanceAutoSave())

            await act(async () => {
                result.current.onChangeField('title', 'Updated Title')
            })

            expect(mockUpdateGuidanceArticle).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Updated Title',
                    content: 'Test Content',
                }),
                {
                    articleId: 123,
                    locale: 'en-US',
                },
            )
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'MARK_AS_SAVED',
                payload: expect.objectContaining({
                    title: 'Updated Title',
                    content: 'Test Content',
                    guidance: mockGuidance,
                }),
            })
            expect(mockOnUpdateFn).toHaveBeenCalled()
        })

        it('should early return if articleId is undefined in edit mode', async () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    guidance: undefined,
                    savedSnapshot: {
                        title: 'Old Title',
                        content: 'Old Content',
                    },
                },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useGuidanceAutoSave())

            await act(async () => {
                result.current.onChangeField('title', 'New Title')
            })

            expect(mockUpdateGuidanceArticle).not.toHaveBeenCalled()
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_AUTO_SAVING',
                payload: false,
            })
        })
    })

    describe('performAutoSave - early returns', () => {
        it('should not save if guidanceHelpCenterId is null', async () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    savedSnapshot: { title: 'Old', content: 'Old' },
                },
                dispatch: mockDispatch,
                config: {
                    ...defaultConfig,
                    guidanceHelpCenter: { id: null, default_locale: 'en' },
                },
            })

            const { result } = renderHook(() => useGuidanceAutoSave())

            await act(async () => {
                result.current.onChangeField('title', 'New Title')
            })

            expect(mockCreateGuidanceArticle).not.toHaveBeenCalled()
            expect(mockUpdateGuidanceArticle).not.toHaveBeenCalled()
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_AUTO_SAVING',
                payload: false,
            })
        })

        it('should not save if locale is null', async () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    savedSnapshot: { title: 'Old', content: 'Old' },
                },
                dispatch: mockDispatch,
                config: {
                    ...defaultConfig,
                    guidanceHelpCenter: { id: 1, default_locale: null },
                },
            })

            const { result } = renderHook(() => useGuidanceAutoSave())

            await act(async () => {
                result.current.onChangeField('title', 'New Title')
            })

            expect(mockCreateGuidanceArticle).not.toHaveBeenCalled()
            expect(mockUpdateGuidanceArticle).not.toHaveBeenCalled()
        })

        it('should not save if title and content match savedSnapshot', async () => {
            const { result } = renderHook(() => useGuidanceAutoSave())

            await act(async () => {
                result.current.onChangeField('title', 'Test Title')
            })

            expect(mockUpdateGuidanceArticle).not.toHaveBeenCalled()
        })
    })

    describe('error handling', () => {
        it('should show error notification on create failure', async () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    guidanceMode: 'create',
                    guidance: undefined,
                    savedSnapshot: { title: '', content: '' },
                },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            mockCreateGuidanceArticle.mockRejectedValue(
                new Error('Create failed'),
            )

            const { result } = renderHook(() => useGuidanceAutoSave())

            await act(async () => {
                result.current.onChangeField('title', 'New Title')
            })

            expect(mockNotifyError).toHaveBeenCalledWith(
                'An error occurred while creating guidance.',
            )
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_AUTO_SAVING',
                payload: false,
            })
        })

        it('should show error notification on update failure', async () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    savedSnapshot: { title: 'Old', content: 'Old' },
                },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            mockUpdateGuidanceArticle.mockRejectedValue(
                new Error('Update failed'),
            )

            const { result } = renderHook(() => useGuidanceAutoSave())

            await act(async () => {
                result.current.onChangeField('title', 'New Title')
            })

            expect(mockNotifyError).toHaveBeenCalledWith(
                'An error occurred while saving guidance.',
            )
        })

        it('should always set isAutoSaving to false in finally block', async () => {
            mockUpdateGuidanceArticle.mockRejectedValue(
                new Error('Update failed'),
            )
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    savedSnapshot: { title: 'Old', content: 'Old' },
                },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useGuidanceAutoSave())

            await act(async () => {
                result.current.onChangeField('title', 'New Title')
            })

            const setAutoSavingFalseCalls = mockDispatch.mock.calls.filter(
                (call) =>
                    call[0].type === 'SET_AUTO_SAVING' &&
                    call[0].payload === false,
            )
            expect(setAutoSavingFalseCalls.length).toBeGreaterThanOrEqual(1)
        })
    })

    describe('debouncing', () => {
        it('should use useDebouncedCallback with 1000ms delay', () => {
            renderHook(() => useGuidanceAutoSave())

            expect(useDebouncedCallback).toHaveBeenCalledWith(
                expect.any(Function),
                1000,
            )
        })
    })

    describe('callback functions', () => {
        it('should not call onCreateFn when it is undefined', async () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    guidanceMode: 'create',
                    guidance: undefined,
                    savedSnapshot: { title: '', content: '' },
                },
                dispatch: mockDispatch,
                config: { ...defaultConfig, onCreateFn: undefined },
            })

            mockCreateGuidanceArticle.mockResolvedValue({
                id: 456,
                translation: { title: 'New Title', content: 'New Content' },
            })
            ;(fromArticleTranslation as jest.Mock).mockReturnValue({ id: 456 })

            const { result } = renderHook(() => useGuidanceAutoSave())

            await act(async () => {
                result.current.onChangeField('title', 'New Title')
            })

            expect(mockOnCreateFn).not.toHaveBeenCalled()
        })

        it('should not call onUpdateFn when it is undefined', async () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    savedSnapshot: { title: 'Old', content: 'Old' },
                },
                dispatch: mockDispatch,
                config: { ...defaultConfig, onUpdateFn: undefined },
            })

            mockUpdateGuidanceArticle.mockResolvedValue({
                title: 'New Title',
                content: 'Old',
            })
            ;(fromArticleTranslationResponse as jest.Mock).mockReturnValue({
                id: 123,
            })

            const { result } = renderHook(() => useGuidanceAutoSave())

            await act(async () => {
                result.current.onChangeField('title', 'New Title')
            })

            expect(mockOnUpdateFn).not.toHaveBeenCalled()
        })
    })

    describe('visibility handling', () => {
        it('should pass visibility correctly when autosaving', async () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    visibility: false,
                    savedSnapshot: { title: 'Old', content: 'Old' },
                },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            mockUpdateGuidanceArticle.mockResolvedValue({
                title: 'New Title',
                content: 'Old',
            })
            ;(fromArticleTranslationResponse as jest.Mock).mockReturnValue({
                id: 123,
            })

            const { result } = renderHook(() => useGuidanceAutoSave())

            await act(async () => {
                result.current.onChangeField('title', 'New Title')
            })

            expect(mockUpdateGuidanceArticle).toHaveBeenCalledWith(
                expect.objectContaining({
                    visibility: 'UNLISTED',
                }),
                expect.any(Object),
            )
        })
    })

    describe('whitespace handling', () => {
        it('should not trigger autosave when title has only trailing whitespace changes', async () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    title: 'Test Title',
                    content: 'Test Content',
                    savedSnapshot: {
                        title: 'Test Title   ',
                        content: 'Test Content',
                    },
                },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useGuidanceAutoSave())

            await act(async () => {
                result.current.onChangeField('title', 'Test Title')
            })

            expect(mockDispatch).not.toHaveBeenCalledWith({
                type: 'SET_AUTO_SAVING',
                payload: true,
            })
        })

        it('should not trigger autosave when title has only leading whitespace changes', async () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    title: 'Test Title',
                    content: 'Test Content',
                    savedSnapshot: {
                        title: '   Test Title',
                        content: 'Test Content',
                    },
                },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useGuidanceAutoSave())

            await act(async () => {
                result.current.onChangeField('title', 'Test Title')
            })

            expect(mockDispatch).not.toHaveBeenCalledWith({
                type: 'SET_AUTO_SAVING',
                payload: true,
            })
        })

        it('should trigger autosave when meaningful title changes exist', async () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    title: 'New Title',
                    content: 'Test Content',
                    savedSnapshot: {
                        title: 'Old Title   ',
                        content: 'Test Content',
                    },
                },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            mockUpdateGuidanceArticle.mockResolvedValue({
                title: 'New Title',
                content: 'Test Content',
            })
            ;(fromArticleTranslationResponse as jest.Mock).mockReturnValue({
                id: 123,
                title: 'New Title',
                content: 'Test Content',
            })

            const { result } = renderHook(() => useGuidanceAutoSave())

            await act(async () => {
                result.current.onChangeField('title', 'New Title')
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_AUTO_SAVING',
                payload: true,
            })
        })
    })
})
