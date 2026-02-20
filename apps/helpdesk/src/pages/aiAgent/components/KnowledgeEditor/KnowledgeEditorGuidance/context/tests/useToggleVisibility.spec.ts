import { act, renderHook } from '@testing-library/react'

import { NEW_GUIDANCE_ARTICLE_LIMIT } from 'pages/aiAgent/constants'
import type { FilteredKnowledgeHubArticle } from 'pages/aiAgent/KnowledgeHub/types'
import type { GuidanceArticle } from 'pages/aiAgent/types'

import * as GuidanceContext from '../KnowledgeEditorGuidanceContext'
import type { GuidanceContextConfig, GuidanceState } from '../types'
import { useToggleVisibility } from '../useToggleVisibility'

const mockNotifyError = jest.fn()
const mockUpdateGuidanceArticle = jest.fn()

// Mock dependencies
jest.mock('hooks/useNotify', () => ({
    useNotify: jest.fn(() => ({
        error: mockNotifyError,
        success: jest.fn(),
    })),
}))

jest.mock('pages/aiAgent/hooks/useGuidanceArticleMutation', () => ({
    useGuidanceArticleMutation: jest.fn(() => ({
        updateGuidanceArticle: mockUpdateGuidanceArticle,
    })),
}))

describe('useToggleVisibility', () => {
    const createMockFilteredGuidanceArticle = (
        id: number,
        visibility: 'PUBLIC' | 'UNLISTED',
    ): FilteredKnowledgeHubArticle => ({
        id,
        title: `Guidance ${id}`,
        visibility,
        draftVersionId: null,
        publishedVersionId: null,
    })

    const createMockGuidanceArticle = (
        id: number,
        visibility: 'PUBLIC' | 'UNLISTED',
    ): GuidanceArticle => ({
        id,
        title: `Guidance ${id}`,
        content: 'Test content',
        locale: 'en-US',
        visibility,
        createdDatetime: '2024-01-01T00:00:00Z',
        lastUpdated: '2024-01-01T00:00:00Z',
        templateKey: null,
        isCurrent: true,
        draftVersionId: null,
        publishedVersionId: null,
    })

    const mockConfig: GuidanceContextConfig = {
        shopName: 'test-shop',
        shopType: 'shopify',
        guidanceArticle: createMockGuidanceArticle(1, 'UNLISTED'),
        guidanceArticles: [],
        initialMode: 'edit',
        guidanceHelpCenter: {
            id: 1,
            default_locale: 'en-US',
        } as any,
        onClose: jest.fn(),
        onUpdateFn: jest.fn(),
    }

    const mockState: GuidanceState = {
        guidanceMode: 'edit',
        isFullscreen: false,
        isDetailsView: true,
        title: 'Test',
        content: 'Test content',
        visibility: false, // Currently UNLISTED
        savedSnapshot: { title: 'Test', content: 'Test content' },
        guidance: createMockGuidanceArticle(1, 'UNLISTED'),
        isAutoSaving: false,
        hasAutoSavedInSession: false,
        autoSaveError: false,
        isFromTemplate: false,
        hasTemplateChanges: false,
        versionStatus: 'latest_draft',
        activeModal: null,
        isUpdating: false,
        historicalVersion: null,
        comparisonVersion: null,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockNotifyError.mockClear()
        mockUpdateGuidanceArticle.mockResolvedValue({
            id: 1,
            title: 'Test',
            content: 'Test content',
            visibility: 'PUBLIC',
        })
    })

    it('returns isAtLimit=false when below limit', () => {
        const guidanceArticles = Array.from({ length: 50 }, (_, i) =>
            createMockFilteredGuidanceArticle(i, 'PUBLIC'),
        )

        jest.spyOn(GuidanceContext, 'useGuidanceContext').mockReturnValue({
            state: mockState,
            dispatch: jest.fn(),
            config: { ...mockConfig, guidanceArticles },
            canEdit: true,
            guidanceArticle: mockConfig.guidanceArticle,
            hasPendingChanges: false,
            playground: {} as any,
            isFormValid: true,
            hasDraft: false,
        })

        const { result } = renderHook(() => useToggleVisibility())

        expect(result.current.isAtLimit).toBe(false)
    })

    it('returns isAtLimit=true when at limit', () => {
        const guidanceArticles = Array.from(
            { length: NEW_GUIDANCE_ARTICLE_LIMIT },
            (_, i) => createMockFilteredGuidanceArticle(i, 'PUBLIC'),
        )

        jest.spyOn(GuidanceContext, 'useGuidanceContext').mockReturnValue({
            state: mockState,
            dispatch: jest.fn(),
            config: { ...mockConfig, guidanceArticles },
            canEdit: true,
            guidanceArticle: mockConfig.guidanceArticle,
            hasPendingChanges: false,
            playground: {} as any,
            isFormValid: true,
            hasDraft: false,
        })

        const { result } = renderHook(() => useToggleVisibility())

        expect(result.current.isAtLimit).toBe(true)
        expect(result.current.limitMessage).toContain(
            `You've reached the limit of 100 enabled Guidance. Disable Guidance to enable more.`,
        )
    })

    it('prevents enabling guidance when at limit', async () => {
        const dispatch = jest.fn()

        const guidanceArticles = Array.from(
            { length: NEW_GUIDANCE_ARTICLE_LIMIT },
            (_, i) => createMockFilteredGuidanceArticle(i, 'PUBLIC'),
        )

        jest.spyOn(GuidanceContext, 'useGuidanceContext').mockReturnValue({
            state: mockState,
            dispatch,
            config: { ...mockConfig, guidanceArticles },
            canEdit: true,
            guidanceArticle: mockConfig.guidanceArticle,
            hasPendingChanges: false,
            playground: {} as any,
            isFormValid: false,
            hasDraft: false,
        })

        const { result } = renderHook(() => useToggleVisibility())

        await act(async () => {
            await result.current.toggleVisibility()
        })

        expect(mockNotifyError).toHaveBeenCalledWith(
            expect.stringContaining('reached the limit'),
        )

        expect(dispatch).not.toHaveBeenCalled()
    })

    it('allows disabling guidance even when at limit', async () => {
        const dispatch = jest.fn()
        mockUpdateGuidanceArticle.mockResolvedValue({
            id: 1,
            title: 'Test',
            content: 'Test content',
            visibility: 'UNLISTED',
        })

        const guidanceArticles = Array.from(
            { length: NEW_GUIDANCE_ARTICLE_LIMIT },
            (_, i) => createMockFilteredGuidanceArticle(i, 'PUBLIC'),
        )

        const stateWithPublicGuidance = {
            ...mockState,
            visibility: true,
            guidance: createMockGuidanceArticle(1, 'PUBLIC'),
        }

        jest.spyOn(GuidanceContext, 'useGuidanceContext').mockReturnValue({
            state: stateWithPublicGuidance,
            dispatch,
            config: { ...mockConfig, guidanceArticles },
            canEdit: true,
            guidanceArticle: createMockGuidanceArticle(1, 'PUBLIC'),
            hasPendingChanges: false,
            playground: {} as any,
            isFormValid: true,
            hasDraft: false,
        })

        const { result } = renderHook(() => useToggleVisibility())

        await act(async () => {
            await result.current.toggleVisibility()
        })

        expect(mockUpdateGuidanceArticle).toHaveBeenCalledWith(
            expect.objectContaining({ visibility: 'UNLISTED' }),
            expect.any(Object),
        )

        expect(dispatch).toHaveBeenCalledWith({
            type: 'SET_UPDATING',
            payload: true,
        })
    })

    it('allows enabling guidance when below limit', async () => {
        const dispatch = jest.fn()
        mockUpdateGuidanceArticle.mockResolvedValue({
            id: 1,
            title: 'Test',
            content: 'Test content',
            visibility: 'PUBLIC',
        })

        const guidanceArticles = Array.from({ length: 50 }, (_, i) =>
            createMockFilteredGuidanceArticle(i, 'PUBLIC'),
        )

        jest.spyOn(GuidanceContext, 'useGuidanceContext').mockReturnValue({
            state: mockState,
            dispatch,
            config: { ...mockConfig, guidanceArticles },
            canEdit: true,
            guidanceArticle: mockConfig.guidanceArticle,
            hasPendingChanges: false,
            playground: {} as any,
            isFormValid: false,
            hasDraft: false,
        })

        const { result } = renderHook(() => useToggleVisibility())

        await act(async () => {
            await result.current.toggleVisibility()
        })

        expect(mockUpdateGuidanceArticle).toHaveBeenCalledWith(
            expect.objectContaining({ visibility: 'PUBLIC' }),
            expect.any(Object),
        )

        expect(dispatch).toHaveBeenCalledWith({
            type: 'SET_UPDATING',
            payload: true,
        })
    })

    it('does not dispatch MARK_AS_SAVED when toggling visibility', async () => {
        const dispatch = jest.fn()
        mockUpdateGuidanceArticle.mockResolvedValue({
            id: 1,
            title: 'Test',
            content: 'Test content',
            visibility: 'PUBLIC',
        })

        jest.spyOn(GuidanceContext, 'useGuidanceContext').mockReturnValue({
            state: mockState,
            dispatch,
            config: mockConfig,
            canEdit: true,
            guidanceArticle: mockConfig.guidanceArticle,
            hasPendingChanges: false,
            playground: {} as any,
            isFormValid: true,
            hasDraft: false,
        })

        const { result } = renderHook(() => useToggleVisibility())

        await act(async () => {
            await result.current.toggleVisibility()
        })

        expect(dispatch).not.toHaveBeenCalledWith(
            expect.objectContaining({ type: 'MARK_AS_SAVED' }),
        )

        expect(dispatch).toHaveBeenCalledWith({
            type: 'SET_VISIBILITY',
            payload: true,
        })
    })
})
