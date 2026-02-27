import { renderHook } from '@repo/testing'
import { act } from 'react-dom/test-utils'

import {
    canEdit,
    hasDraft,
    isFormValid,
    useGuidanceContext,
    useGuidanceStore,
    useGuidanceStoreApi,
} from '../KnowledgeEditorGuidance/context'
import { useGuidanceToolbar } from './useGuidanceToolbar'

jest.mock('../KnowledgeEditorGuidance/context', () => ({
    useGuidanceContext: jest.fn(),
    useGuidanceStore: jest.fn(),
    useGuidanceStoreApi: jest.fn(),
    canEdit: jest.fn(),
    hasDraft: jest.fn(),
    isFormValid: jest.fn(),
}))

const mockDispatch = jest.fn()
const mockOnUpdateFn = jest.fn()
const mockOnTest = jest.fn()

const setMockContextValue = (contextValue: any) => {
    const storeValue = {
        state: contextValue.state,
        config: contextValue.config,
        dispatch: contextValue.dispatch,
        guidanceArticle: contextValue.state?.guidance,
        playground: contextValue.playground,
        setConfig: jest.fn(),
        setGuidanceArticle: jest.fn(),
        setPlayground: jest.fn(),
        shouldAddToMissingKnowledge: true,
        setShouldAddToMissingKnowledge: jest.fn(),
    }

    jest.mocked(useGuidanceContext).mockReturnValue(contextValue)
    jest.mocked(useGuidanceStore).mockImplementation((selector) =>
        selector(storeValue),
    )
    jest.mocked(useGuidanceStoreApi).mockReturnValue({
        getState: () => storeValue,
    } as any)
    jest.mocked(canEdit).mockReturnValue(contextValue.canEdit)
    jest.mocked(hasDraft).mockReturnValue(contextValue.hasDraft)
    jest.mocked(isFormValid).mockReturnValue(contextValue.isFormValid)
}

describe('useGuidanceToolbar', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        setMockContextValue({
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
            setMockContextValue({
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
            setMockContextValue({
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
            expect(result.current.editDisabledReason).toBe(
                'This version is read-only. Edit the draft to make changes.',
            )
        })

        it('should return disabled reason when in published-with-draft state even if canEdit is true', () => {
            setMockContextValue({
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
                canEdit: true,
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
            expect(result.current.editDisabledReason).toBe(
                'This version is read-only. Edit the draft to make changes.',
            )
        })

        it('should return isPlaygroundOpen based on playground.isOpen', () => {
            setMockContextValue({
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
