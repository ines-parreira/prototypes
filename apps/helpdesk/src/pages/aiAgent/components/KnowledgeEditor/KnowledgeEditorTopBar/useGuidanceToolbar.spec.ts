import { renderHook } from '@repo/testing'
import { act } from 'react-dom/test-utils'

import { useGuidanceContext } from '../KnowledgeEditorGuidance/context'
import type { GuidanceContextValue } from '../KnowledgeEditorGuidance/context/types'
import { useGuidanceToolbar } from './useGuidanceToolbar'

jest.mock('../KnowledgeEditorGuidance/context', () => ({
    useGuidanceContext: jest.fn(),
}))

const mockDispatch = jest.fn()
const mockOnUpdateFn = jest.fn()
const mockOnTest = jest.fn()

const createMockContext = (
    overrides: Partial<{
        state: Partial<GuidanceContextValue['state']>
        canEdit: boolean
        hasDraft: boolean
        isFormValid: boolean
        playground: Partial<GuidanceContextValue['playground']>
    }> = {},
): GuidanceContextValue => ({
    state: {
        guidance: {
            id: 1,
            title: 'Test Article',
            content: 'Test Content',
            isCurrent: true,
        },
        guidanceMode: 'read',
        title: 'Test Article',
        content: 'Test Content',
        isUpdating: false,
        isAutoSaving: false,
        historicalVersion: null,
        ...overrides.state,
    } as GuidanceContextValue['state'],
    dispatch: mockDispatch,
    isFormValid: overrides.isFormValid ?? true,
    canEdit: overrides.canEdit ?? true,
    hasPendingChanges: false,
    guidanceArticle: undefined,
    config: {
        guidanceHelpCenter: { id: 1, default_locale: 'en-US' } as any,
        onUpdateFn: mockOnUpdateFn,
        onClose: jest.fn(),
        shopName: 'test-shop',
        shopType: 'shopify',
        guidanceArticles: [],
        initialMode: 'edit' as const,
    } as GuidanceContextValue['config'],
    hasDraft: overrides.hasDraft ?? false,
    playground: {
        isOpen: false,
        onTest: mockOnTest,
        onClose: jest.fn(),
        sidePanelWidth: '100%',
        shouldHideFullscreenButton: false,
        ...overrides.playground,
    },
})

describe('useGuidanceToolbar', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.mocked(useGuidanceContext).mockReturnValue(createMockContext())
    })

    describe('onOpenDuplicateModal', () => {
        it('should dispatch SET_MODAL with duplicate payload', () => {
            const { result } = renderHook(() => useGuidanceToolbar())

            act(() => {
                result.current.actions.onOpenDuplicateModal()
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_MODAL',
                payload: 'duplicate',
            })
        })
    })

    describe('toolbar state management', () => {
        it('should return correct disabled state', () => {
            jest.mocked(useGuidanceContext).mockReturnValue(
                createMockContext({ state: { isUpdating: true } }),
            )

            const { result } = renderHook(() => useGuidanceToolbar())

            expect(result.current.isDisabled).toBe(true)
        })

        it('should return correct toolbar state for published-without-draft', () => {
            const { result } = renderHook(() => useGuidanceToolbar())

            expect(result.current.state.type).toBe('published-without-draft')
        })

        it('should return correct toolbar state for published-with-draft', () => {
            jest.mocked(useGuidanceContext).mockReturnValue(
                createMockContext({ canEdit: false, hasDraft: true }),
            )

            const { result } = renderHook(() => useGuidanceToolbar())

            expect(result.current.state.type).toBe('published-with-draft')
            expect(result.current.canEdit).toBe(false)
            expect(result.current.editDisabledReason).toBe(
                'This version is read-only. Edit the draft to make changes.',
            )
        })

        it('should return disabled reason when in published-with-draft state even if canEdit is true', () => {
            jest.mocked(useGuidanceContext).mockReturnValue(
                createMockContext({ canEdit: true, hasDraft: true }),
            )

            const { result } = renderHook(() => useGuidanceToolbar())

            expect(result.current.state.type).toBe('published-with-draft')
            expect(result.current.editDisabledReason).toBe(
                'This version is read-only. Edit the draft to make changes.',
            )
        })

        it('should return isPlaygroundOpen based on playground.isOpen', () => {
            jest.mocked(useGuidanceContext).mockReturnValue(
                createMockContext({ playground: { isOpen: true } }),
            )

            const { result } = renderHook(() => useGuidanceToolbar())

            expect(result.current.isPlaygroundOpen).toBe(true)
        })

        it('should return isPlaygroundOpen as false when playground.isOpen is false', () => {
            const { result } = renderHook(() => useGuidanceToolbar())

            expect(result.current.isPlaygroundOpen).toBe(false)
        })
    })

    describe('onTest', () => {
        it('should call playground.onTest', () => {
            const { result } = renderHook(() => useGuidanceToolbar())

            result.current.onTest()

            expect(mockOnTest).toHaveBeenCalled()
        })
    })

    describe('onClickPublish', () => {
        it('should dispatch SET_MODAL with publish payload', () => {
            const { result } = renderHook(() => useGuidanceToolbar())

            act(() => {
                result.current.actions.onClickPublish()
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_MODAL',
                payload: 'publish',
            })
        })
    })
})
