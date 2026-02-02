import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'
import { act } from 'react-dom/test-utils'

import { useNotify } from 'hooks/useNotify'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'

import { useGuidanceContext } from '../KnowledgeEditorGuidance/context'
import { useGuidanceToolbar } from './useGuidanceToolbar'

jest.mock('@repo/feature-flags')
jest.mock('hooks/useNotify')
jest.mock('pages/aiAgent/hooks/useGuidanceArticleMutation')
jest.mock('../KnowledgeEditorGuidance/context', () => ({
    useGuidanceContext: jest.fn(),
    fromArticleTranslationResponse: jest.fn((response, extra) => ({
        ...response,
        ...extra,
    })),
}))

const mockUseFlag = jest.mocked(useFlag)

const mockNotifyError = jest.fn()
const mockNotifySuccess = jest.fn()
const mockDispatch = jest.fn()
const mockUpdateGuidanceArticle = jest.fn()
const mockOnUpdateFn = jest.fn()
const mockOnTest = jest.fn()

describe('useGuidanceToolbar', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseFlag.mockReturnValue(false)

        jest.mocked(useNotify).mockReturnValue({
            error: mockNotifyError,
            success: mockNotifySuccess,
        } as any)

        jest.mocked(useGuidanceArticleMutation).mockReturnValue({
            updateGuidanceArticle: mockUpdateGuidanceArticle,
            isGuidanceArticleUpdating: false,
        } as any)

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
        describe('when feature flag is enabled', () => {
            beforeEach(() => {
                mockUseFlag.mockImplementation(
                    (key) =>
                        key ===
                        FeatureFlagKey.AddVersionHistoryForArticlesAndGuidances,
                )
            })

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

            it('should not call updateGuidanceArticle', () => {
                const { result } = renderHook(() => useGuidanceToolbar())

                act(() => {
                    result.current.actions.onClickPublish()
                })

                expect(mockUpdateGuidanceArticle).not.toHaveBeenCalled()
            })
        })

        describe('when feature flag is disabled', () => {
            beforeEach(() => {
                mockUseFlag.mockReturnValue(false)
            })

            it('should publish directly and call updateGuidanceArticle', async () => {
                mockUpdateGuidanceArticle.mockResolvedValue({
                    title: 'Updated Title',
                    content: 'Updated Content',
                })

                const { result } = renderHook(() => useGuidanceToolbar())

                await act(async () => {
                    await result.current.actions.onClickPublish()
                })

                expect(mockUpdateGuidanceArticle).toHaveBeenCalledWith(
                    { isCurrent: true },
                    { articleId: 1, locale: 'en-US' },
                )
            })

            it('should dispatch SET_UPDATING true, then MARK_AS_SAVED, then SET_MODE, then SET_UPDATING false', async () => {
                mockUpdateGuidanceArticle.mockResolvedValue({
                    title: 'Updated Title',
                    content: 'Updated Content',
                })

                const { result } = renderHook(() => useGuidanceToolbar())

                await act(async () => {
                    await result.current.actions.onClickPublish()
                })

                expect(mockDispatch).toHaveBeenNthCalledWith(1, {
                    type: 'SET_UPDATING',
                    payload: true,
                })
                expect(mockDispatch).toHaveBeenNthCalledWith(2, {
                    type: 'MARK_AS_SAVED',
                    payload: expect.objectContaining({
                        title: 'Updated Title',
                        content: 'Updated Content',
                    }),
                })
                expect(mockDispatch).toHaveBeenNthCalledWith(3, {
                    type: 'SET_MODE',
                    payload: 'read',
                })
                expect(mockDispatch).toHaveBeenNthCalledWith(4, {
                    type: 'SET_UPDATING',
                    payload: false,
                })
            })

            it('should call notifySuccess on successful publish', async () => {
                mockUpdateGuidanceArticle.mockResolvedValue({
                    title: 'Updated Title',
                    content: 'Updated Content',
                })

                const { result } = renderHook(() => useGuidanceToolbar())

                await act(async () => {
                    await result.current.actions.onClickPublish()
                })

                expect(mockNotifySuccess).toHaveBeenCalledWith(
                    'Guidance published successfully.',
                )
            })

            it('should call onUpdateFn on successful publish', async () => {
                mockUpdateGuidanceArticle.mockResolvedValue({
                    title: 'Updated Title',
                    content: 'Updated Content',
                })

                const { result } = renderHook(() => useGuidanceToolbar())

                await act(async () => {
                    await result.current.actions.onClickPublish()
                })

                expect(mockOnUpdateFn).toHaveBeenCalled()
            })

            it('should call notifyError on failed publish', async () => {
                mockUpdateGuidanceArticle.mockRejectedValue(
                    new Error('Publish failed'),
                )

                const { result } = renderHook(() => useGuidanceToolbar())

                await act(async () => {
                    await result.current.actions.onClickPublish()
                })

                expect(mockNotifyError).toHaveBeenCalledWith(
                    'An error occurred while publishing guidance.',
                )
            })

            it('should always reset updating state even on error', async () => {
                mockUpdateGuidanceArticle.mockRejectedValue(
                    new Error('Publish failed'),
                )

                const { result } = renderHook(() => useGuidanceToolbar())

                await act(async () => {
                    await result.current.actions.onClickPublish()
                })

                expect(mockDispatch).toHaveBeenLastCalledWith({
                    type: 'SET_UPDATING',
                    payload: false,
                })
            })

            it('should not publish when guidance id is missing', async () => {
                jest.mocked(useGuidanceContext).mockReturnValue({
                    state: {
                        guidance: undefined,
                        guidanceMode: 'edit',
                        title: 'Test',
                        content: 'Content',
                        isUpdating: false,
                        isAutoSaving: false,
                        historicalVersion: null,
                    },
                    dispatch: mockDispatch,
                    isFormValid: true,
                    canEdit: true,
                    config: {
                        guidanceHelpCenter: { id: 1, default_locale: 'en-US' },

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

                const { result } = renderHook(() => useGuidanceToolbar())

                await act(async () => {
                    await result.current.actions.onClickPublish()
                })

                expect(mockUpdateGuidanceArticle).not.toHaveBeenCalled()
            })
        })
    })
})
