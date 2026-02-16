import { renderHook } from '@repo/testing'
import { act } from 'react-dom/test-utils'

import { useGuidanceContext } from '../KnowledgeEditorGuidance/context'
import { useGuidanceToolbar } from './useGuidanceToolbar'

jest.mock('../KnowledgeEditorGuidance/context', () => ({
    useGuidanceContext: jest.fn(),
}))

const mockDispatch = jest.fn()
const mockOnUpdateFn = jest.fn()
const mockOnTest = jest.fn()

describe('useGuidanceToolbar', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        jest.mocked(useGuidanceContext).mockReturnValue({
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
            },
            dispatch: mockDispatch,
            isFormValid: true,
            canEdit: true,
            config: {
                guidanceHelpCenter: {
                    id: 1,
                    default_locale: 'en-US',
                },
                onUpdateFn: mockOnUpdateFn,
                onClose: jest.fn(),
                shopName: 'test-shop',
            },
            hasDraft: false,
            playground: {
                isOpen: false,
                onTest: mockOnTest,
                onClose: jest.fn(),
                sidePanelWidth: '100%',
                shouldHideFullscreenButton: false,
            },
        } as any)
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
            jest.mocked(useGuidanceContext).mockReturnValue({
                state: {
                    guidance: { id: 1 },
                    guidanceMode: 'read',
                    isUpdating: true,
                    isAutoSaving: false,
                    historicalVersion: null,
                },
                dispatch: mockDispatch,
                isFormValid: true,
                canEdit: true,
                config: {
                    guidanceHelpCenter: { id: 1, default_locale: 'en-US' },
                },
                hasDraft: false,
                playground: {
                    isOpen: false,
                    onTest: mockOnTest,
                    onClose: jest.fn(),
                    sidePanelWidth: '100%',
                    shouldHideFullscreenButton: false,
                },
            } as any)

            const { result } = renderHook(() => useGuidanceToolbar())

            expect(result.current.isDisabled).toBe(true)
        })

        it('should return correct toolbar state for published-without-draft', () => {
            const { result } = renderHook(() => useGuidanceToolbar())

            expect(result.current.state.type).toBe('published-without-draft')
        })

        it('should return correct toolbar state for published-with-draft', () => {
            jest.mocked(useGuidanceContext).mockReturnValue({
                state: {
                    guidance: {
                        id: 1,
                        title: 'Test',
                        content: 'Content',
                        isCurrent: true,
                    },
                    guidanceMode: 'read',
                    isUpdating: false,
                    isAutoSaving: false,
                    historicalVersion: null,
                },
                dispatch: mockDispatch,
                isFormValid: true,
                canEdit: false,
                config: {
                    guidanceHelpCenter: { id: 1, default_locale: 'en-US' },
                },
                hasDraft: true,
                playground: {
                    isOpen: false,
                    onTest: mockOnTest,
                    onClose: jest.fn(),
                    sidePanelWidth: '100%',
                    shouldHideFullscreenButton: false,
                },
            } as any)

            const { result } = renderHook(() => useGuidanceToolbar())

            expect(result.current.state.type).toBe('published-with-draft')
            expect(result.current.canEdit).toBe(false)
            expect(result.current.editDisabledReason).toBeDefined()
        })

        it('should return isPlaygroundOpen based on playground.isOpen', () => {
            jest.mocked(useGuidanceContext).mockReturnValue({
                state: {
                    guidance: { id: 1 },
                    guidanceMode: 'read',
                    isUpdating: false,
                    isAutoSaving: false,
                    historicalVersion: null,
                },
                dispatch: mockDispatch,
                isFormValid: true,
                canEdit: true,
                config: {
                    guidanceHelpCenter: { id: 1, default_locale: 'en-US' },
                },
                hasDraft: false,
                playground: {
                    isOpen: true,
                    onTest: mockOnTest,
                    onClose: jest.fn(),
                    sidePanelWidth: '100%',
                    shouldHideFullscreenButton: false,
                },
            } as any)

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
