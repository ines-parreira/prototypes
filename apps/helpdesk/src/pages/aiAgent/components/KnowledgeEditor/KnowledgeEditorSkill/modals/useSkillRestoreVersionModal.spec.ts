import { act, renderHook } from '@testing-library/react'

import { useSkillRestoreVersionModal } from './useSkillRestoreVersionModal'

const mockDispatch = jest.fn()
const mockUpdateGuidanceArticle = jest.fn()
const mockNotifySuccess = jest.fn()
const mockNotifyError = jest.fn()
const mockOnUpdateFn = jest.fn()
const mockOnVersionRestored = jest.fn()

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

jest.mock(
    '../../shared/useVersionHistoryTracking/useVersionHistoryTracking',
    () => ({
        useVersionHistoryTracking: () => ({
            onVersionRestored: mockOnVersionRestored,
        }),
    }),
)

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

const mockHistoricalVersion = {
    title: 'Historical Title',
    content: '<p>historical content</p>',
    intents: ['order::status'],
    useSupportingContent: true,
    versionId: 100,
    version: 3,
    publishedDatetime: '2024-01-01T00:00:00Z',
}

const createStoreState = (overrides: Record<string, unknown> = {}) => ({
    state: {
        skill: { id: 42, templateKey: 'template_1' },
        activeModal: null as string | null,
        isUpdating: false,
        historicalVersion: mockHistoricalVersion,
        ...overrides,
    },
    config: {
        shopName: 'test-shop',
        helpCenter: { id: 1, default_locale: 'en-US' },
        onUpdateFn: mockOnUpdateFn,
    },
    dispatch: mockDispatch,
})

describe('useSkillRestoreVersionModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockStoreState = createStoreState()
    })

    it('returns isOpen true when activeModal is restore', () => {
        mockStoreState = createStoreState({ activeModal: 'restore' })

        const { result } = renderHook(() => useSkillRestoreVersionModal())

        expect(result.current.isOpen).toBe(true)
    })

    it('returns isOpen false when activeModal is not restore', () => {
        mockStoreState = createStoreState({ activeModal: 'publish' })

        const { result } = renderHook(() => useSkillRestoreVersionModal())

        expect(result.current.isOpen).toBe(false)
    })

    it('calls updateGuidanceArticle with historical version data', async () => {
        mockUpdateGuidanceArticle.mockResolvedValue({
            title: 'Historical Title',
            content: '<p>historical content</p>',
        })

        const { result } = renderHook(() => useSkillRestoreVersionModal())

        await act(async () => {
            await result.current.onRestore()
        })

        expect(mockUpdateGuidanceArticle).toHaveBeenCalledWith(
            {
                isCurrent: false,
                title: 'Historical Title',
                content: '<p>historical content</p>',
                intents: ['order::status'],
                useSupportingContent: true,
            },
            { articleId: 42, locale: 'en-US' },
        )
    })

    it('dispatches MARK_AS_SAVED, CLEAR_HISTORICAL_VERSION, and SET_MODE on success', async () => {
        mockUpdateGuidanceArticle.mockResolvedValue({
            title: 'Historical Title',
            content: '<p>historical content</p>',
        })

        const { result } = renderHook(() => useSkillRestoreVersionModal())

        await act(async () => {
            await result.current.onRestore()
        })

        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'MARK_AS_SAVED' }),
        )
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'CLEAR_HISTORICAL_VERSION',
        })
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_MODE',
            payload: 'edit',
        })
    })

    it('calls notifySuccess with correct message on success', async () => {
        mockUpdateGuidanceArticle.mockResolvedValue({
            title: 'Historical Title',
            content: '<p>historical content</p>',
        })

        const { result } = renderHook(() => useSkillRestoreVersionModal())

        await act(async () => {
            await result.current.onRestore()
        })

        expect(mockNotifySuccess).toHaveBeenCalledWith(
            'Version restored as draft.',
        )
    })

    it('calls onVersionRestored with correct version info on success', async () => {
        mockUpdateGuidanceArticle.mockResolvedValue({
            title: 'Historical Title',
            content: '<p>historical content</p>',
        })

        const { result } = renderHook(() => useSkillRestoreVersionModal())

        await act(async () => {
            await result.current.onRestore()
        })

        expect(mockOnVersionRestored).toHaveBeenCalledWith({
            versionId: 100,
            versionNumber: 3,
            publishedDatetime: '2024-01-01T00:00:00Z',
        })
    })

    it('calls onUpdateFn on success', async () => {
        mockUpdateGuidanceArticle.mockResolvedValue({
            title: 'Historical Title',
            content: '<p>historical content</p>',
        })

        const { result } = renderHook(() => useSkillRestoreVersionModal())

        await act(async () => {
            await result.current.onRestore()
        })

        expect(mockOnUpdateFn).toHaveBeenCalled()
    })

    it('calls notifyError on failure', async () => {
        mockUpdateGuidanceArticle.mockRejectedValue(new Error('Network error'))

        const { result } = renderHook(() => useSkillRestoreVersionModal())

        await act(async () => {
            await result.current.onRestore()
        })

        expect(mockNotifyError).toHaveBeenCalledWith(
            'An error occurred while restoring version.',
        )
    })

    it('dispatches SET_UPDATING and CLOSE_MODAL in finally block', async () => {
        mockUpdateGuidanceArticle.mockResolvedValue({
            title: 'Historical Title',
            content: '<p>historical content</p>',
        })

        const { result } = renderHook(() => useSkillRestoreVersionModal())

        await act(async () => {
            await result.current.onRestore()
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_UPDATING',
            payload: false,
        })
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' })
    })

    it('does nothing when skillId is undefined', async () => {
        mockStoreState = createStoreState({ skill: undefined })

        const { result } = renderHook(() => useSkillRestoreVersionModal())

        await act(async () => {
            await result.current.onRestore()
        })

        expect(mockUpdateGuidanceArticle).not.toHaveBeenCalled()
    })

    it('does nothing when historicalVersion is null', async () => {
        mockStoreState = createStoreState({ historicalVersion: null })

        const { result } = renderHook(() => useSkillRestoreVersionModal())

        await act(async () => {
            await result.current.onRestore()
        })

        expect(mockUpdateGuidanceArticle).not.toHaveBeenCalled()
    })

    it('does not dispatch success actions when response is falsy', async () => {
        mockUpdateGuidanceArticle.mockResolvedValue(null)

        const { result } = renderHook(() => useSkillRestoreVersionModal())

        await act(async () => {
            await result.current.onRestore()
        })

        expect(mockDispatch).not.toHaveBeenCalledWith(
            expect.objectContaining({ type: 'MARK_AS_SAVED' }),
        )
        expect(mockNotifySuccess).not.toHaveBeenCalled()
    })

    it('onClose dispatches CLOSE_MODAL', () => {
        const { result } = renderHook(() => useSkillRestoreVersionModal())

        result.current.onClose()

        expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' })
    })
})
